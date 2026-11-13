/*!
 * CockpitApi 2.0 – Datenbibliothek für Cockpit-XP Rennbildschirme.
 *
 * Kümmert sich um Polling, Normalisierung und Aktionen. Screens hören nur auf
 * Events und zeigen die gelieferten, bereits bereinigten Daten an.
 * Buildfrei: einfach per <script> einbinden, stellt window.CockpitApi bereit.
 */
(function (global) {
  'use strict';

  var VERSION = '2.0.0';
  var STATUS_INTERVAL = 800;
  var RACE_DATA_INTERVAL = 1000;
  var REQUEST_TIMEOUT = 5000;
  // Mindestabstand, bevor ein unbekannter Slot erneut ein Nachladen der Fahrer auslöst.
  var METADATA_RELOAD_THROTTLE = 5000;

  var ENDPOINTS = {
    status: '/api/rbs/rennstatus',
    renndaten: '/api/rbs/renndaten',
    rennen: '/api/rbs/sAllgemeinedaten',
    fahrer: '/api/rbs/sFahrer',
    strafe: '/api/rbs/cptastenstrafe',
    button: '/api/rbs/cpsimulatebutton'
  };

  var STATUS_KEYS = {
    0: 'internal',
    1: 'running',
    2: 'starting',
    3: 'winner',
    4: 'finished',
    6: 'paused',
    8: 'restarting',
    9: 'aborted'
  };

  var STATUS_TEXTS = {
    internal: 'Intern',
    running: 'Rennen läuft',
    starting: 'Startampel läuft',
    winner: 'Sieger im Ziel',
    finished: 'Rennen beendet',
    paused: 'Rennen pausiert',
    restarting: 'Start nach Pause',
    aborted: 'Rennen abgebrochen',
    unknown: 'Status unbekannt'
  };

  // Welche Aktionen im jeweiligen Rennstatus sinnvoll sind (Hinweis für die UI).
  var ACTIONS_BY_STATUS = {
    running: ['pause', 'abbruch'],
    paused: ['weiter'],
    aborted: ['startampel'],
    finished: ['startampel']
  };

  var BUTTON_IDS = {
    startampel: 1,
    abbruch: 2,
    pause: 3,
    weiter: 4
  };

  var LIGHT_COLORS = {
    rot: 'red',
    red: 'red',
    gelb: 'yellow',
    yellow: 'yellow',
    gruen: 'green',
    'grün': 'green',
    green: 'green'
  };

  // Delphi-Systemfarben (clWindowText usw.) mit den Windows-Standardwerten, Index = COLOR_*.
  var SYSTEM_COLORS = [
    '#c8c8c8', '#000000', '#99b4d1', '#bfcddb', '#f0f0f0', '#ffffff', '#646464', '#000000',
    '#000000', '#000000', '#b4b4b4', '#f4f7fc', '#ababab', '#0078d7', '#ffffff', '#f0f0f0',
    '#a0a0a0', '#6d6d6d', '#000000', '#000000', '#ffffff', '#696969', '#e3e3e3', '#000000',
    '#ffffe1', null, '#0066cc', '#b9d1ea', '#d7e4f2', '#3399ff', '#f0f0f0'
  ];

  var FAHRER_FIELDS = [
    'namefahrer',
    'shortnamefahrer',
    'namefahrzeug',
    'bildfahrer',
    'bildfahrzeug',
    'bildfahrerUrl',
    'bildfahrzeugUrl',
    'slotfarbeback',
    'slotfarbefont'
  ];

  function noop() {}

  // ---------------------------------------------------------------------------
  // Normalisierung: reine Funktionen, API-Rohdaten -> bereinigte Typen
  // ---------------------------------------------------------------------------

  function toNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      var number = Number(value.trim().replace(',', '.'));
      return Number.isFinite(number) ? number : null;
    }
    return null;
  }

  // 0 bedeutet bei Cockpit-XP „noch kein Wert“ (z. B. noch keine Rundenzeit).
  function toPositive(value) {
    var number = toNumber(value);
    return number !== null && number > 0 ? number : null;
  }

  function toText(value) {
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
    return null;
  }

  // "04:55", "1:02:03" oder "04:55.3" -> Millisekunden. Reine Zahlen gelten als ms.
  function toDuration(value) {
    var text = toText(value);
    if (text === null) {
      return null;
    }
    if (text.indexOf(':') === -1) {
      var milliseconds = toNumber(text);
      return milliseconds !== null && milliseconds >= 0 ? milliseconds : null;
    }

    var parts = text.split(':');
    if (parts.length > 3) {
      return null;
    }
    var seconds = 0;
    for (var index = 0; index < parts.length; index += 1) {
      var part = toNumber(parts[index]);
      if (part === null || part < 0) {
        return null;
      }
      seconds = seconds * 60 + part;
    }
    return Math.round(seconds * 1000);
  }

  // Windows/OLE-Farbe (0x00BBGGRR) -> "#rrggbb". Systemfarben (0xFF0000nn, als
  // signed 32 Bit negativ, z. B. clWindowText = -16777208) über SYSTEM_COLORS.
  function toCssColor(value) {
    var color = toNumber(value);
    if (color === null || Math.floor(color) !== color) {
      return null;
    }
    if (color < 0) {
      color += 0x100000000;
    }
    if (color >= 0xFF000000 && color <= 0xFFFFFFFF) {
      return SYSTEM_COLORS[color - 0xFF000000] || null;
    }
    if (color < 0 || color > 0xFFFFFF) {
      return null;
    }
    var red = color & 0xFF;
    var green = (color >>> 8) & 0xFF;
    var blue = (color >>> 16) & 0xFF;
    return '#' + [red, green, blue].map(function (channel) {
      return (channel < 16 ? '0' : '') + channel.toString(16);
    }).join('');
  }

  function clamp(value, minimum, maximum) {
    return value === null ? null : Math.max(minimum, Math.min(maximum, value));
  }

  function isValidSlot(slot) {
    return Number.isInteger(slot) && slot >= 1;
  }

  function imageUrl(filename) {
    var name = toText(filename);
    if (name === null) {
      return null;
    }
    var base = global.location && global.location.href ? global.location.href : 'http://localhost/';
    return new URL('/bilder/' + encodeURIComponent(name), base).href;
  }

  // Unbekannte, künftige API-Felder werden unverändert durchgereicht.
  function withPassThrough(data, normalized, excluded) {
    var result = {};
    Object.keys(data || {}).forEach(function (key) {
      if (!excluded || excluded.indexOf(key) === -1) {
        result[key] = data[key];
      }
    });
    return Object.assign(result, normalized);
  }

  function normalizeStatus(data) {
    var rennstatus = toNumber(data.rennstatus);
    var statusKey = STATUS_KEYS[rennstatus] || 'unknown';
    return withPassThrough(data, {
      rennstatus: rennstatus,
      statusKey: statusKey,
      rennzeit: toDuration(data.rennzeit),
      statusampel: toNumber(data.statusampel),
      ampeln: [1, 2, 3, 4, 5].map(function (number) {
        var color = String(data['ampel' + number] || '').toLowerCase().trim();
        return LIGHT_COLORS[color] || 'off';
      }),
      aktionen: (ACTIONS_BY_STATUS[statusKey] || []).slice()
    }, ['ampel1', 'ampel2', 'ampel3', 'ampel4', 'ampel5']);
  }

  function normalizeRennen(data) {
    var sollzeit = toPositive(data.sollzeit);
    return withPassThrough(data, {
      rennmodus: toText(data.rennmodus),
      sollrennrunden: toPositive(data.sollrennrunden),
      // Cockpit-XP liefert die Sollzeit in Sekunden.
      sollzeit: sollzeit === null ? null : sollzeit * 1000,
      anzahlfahrer: toNumber(data.anzahlfahrer)
    });
  }

  function normalizeFahrer(data) {
    return withPassThrough(data, {
      slot: toNumber(data.slot),
      namefahrer: toText(data.namefahrer),
      shortnamefahrer: toText(data.shortnamefahrer),
      namefahrzeug: toText(data.namefahrzeug),
      bildfahrer: toText(data.bildfahrer),
      bildfahrzeug: toText(data.bildfahrzeug),
      bildfahrerUrl: imageUrl(data.bildfahrer),
      bildfahrzeugUrl: imageUrl(data.bildfahrzeug),
      slotfarbeback: toCssColor(data.slotfarbeback),
      slotfarbefont: toCssColor(data.slotfarbefont)
    });
  }

  function normalizeRenndaten(data) {
    var strafstand = toNumber(data.strafstand);
    var strafdauer = toNumber(data.strafdauer);
    var strafart = toText(data.strafart);
    return withPassThrough(data, {
      slot: toNumber(data.slot),
      position: toPositive(data.position),
      runde: toNumber(data.runde),
      rundenzeit: toPositive(data.rundenzeit),
      schnellsterunde: toPositive(data.schnellsterunde),
      schnellsterunderd: toPositive(data.schnellsterunderd),
      abstandzeitfuehrenden: toNumber(data.abstandzeitfuehrenden),
      abstandzeitvordermann: toNumber(data.abstandzeitvordermann),
      abstandrundefuehrenden: toNumber(data.abstandrundefuehrenden),
      abstandrundevordermann: toNumber(data.abstandrundevordermann),
      tankstand: clamp(toNumber(data.tankstand), 0, 100),
      tankenaktiviert: toNumber(data.tankenaktiviert) === 1,
      strafstand: strafstand,
      strafdauer: strafdauer,
      strafart: strafart,
      strafeAktiv: Boolean(strafart || strafdauer > 0 || strafstand > 0)
    });
  }

  function normalizeList(data, normalize) {
    return (Array.isArray(data) ? data : []).map(function (item) {
      return normalize(item || {});
    }).filter(function (item) {
      return isValidSlot(item.slot);
    });
  }

  function emptyFahrer() {
    var fahrer = {};
    FAHRER_FIELDS.forEach(function (field) { fahrer[field] = null; });
    return fahrer;
  }

  // Renndaten und Fahrerdaten flach per Slot zusammenführen, sortiert nach Position.
  function mergeAutos(renndaten, fahrerBySlot) {
    return renndaten.map(function (auto) {
      var fahrer = fahrerBySlot[auto.slot];
      var merged = emptyFahrer();
      if (fahrer) {
        FAHRER_FIELDS.forEach(function (field) { merged[field] = fahrer[field]; });
      }
      return Object.assign(merged, auto);
    }).sort(function (first, second) {
      if (first.position !== second.position) {
        if (first.position === null) return 1;
        if (second.position === null) return -1;
        return first.position - second.position;
      }
      return first.slot - second.slot;
    });
  }

  function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    }
    return value;
  }

  // ---------------------------------------------------------------------------
  // Fehler
  // ---------------------------------------------------------------------------

  /**
   * kind: 'http' (Antwort nicht 2xx), 'timeout', 'network' oder 'parse' (kein gültiges JSON).
   */
  function CockpitApiError(message, endpoint, kind, httpStatus, cause) {
    this.name = 'CockpitApiError';
    this.message = message;
    this.endpoint = endpoint;
    this.kind = kind;
    this.httpStatus = httpStatus === undefined ? null : httpStatus;
    this.cause = cause;
    this.stack = new Error(message).stack;
  }
  CockpitApiError.prototype = Object.create(Error.prototype);
  CockpitApiError.prototype.constructor = CockpitApiError;

  function parseSlot(slot, allowNull) {
    if (allowNull && (slot === undefined || slot === null || slot === '')) {
      return null;
    }
    var number = Number(slot);
    if (!isValidSlot(number)) {
      throw new TypeError('slot muss eine positive Ganzzahl sein.');
    }
    return number;
  }

  // ---------------------------------------------------------------------------
  // CockpitApi
  // ---------------------------------------------------------------------------

  /**
   * @param {object} [options]
   * @param {number} [options.slot] Renndaten serverseitig auf diesen Slot filtern.
   * @param {boolean} [options.renndaten=true] false: /renndaten wird nicht gepollt.
   * @param {number} [options.requestTimeout=5000] Timeout je Request in ms.
   */
  function CockpitApi(options) {
    options = options || {};

    this.slot = parseSlot(options.slot, true);
    this.pollsRenndaten = options.renndaten !== false;
    this.requestTimeout = options.requestTimeout === undefined ? REQUEST_TIMEOUT : Number(options.requestTimeout);
    if (!Number.isFinite(this.requestTimeout) || this.requestTimeout <= 0) {
      throw new TypeError('requestTimeout muss eine positive Zahl sein.');
    }
    this.fetch = options.fetch || global.fetch.bind(global);

    this.listeners = {};
    this.running = false;
    this.statusTimer = null;
    this.raceTimer = null;
    // Laufendes Laden der Metadaten, damit parallele Aufrufer es mitnutzen.
    this.metadataPromise = null;
    // Erhöht sich bei stop/start bzw. Slotwechsel; ältere Antworten werden verworfen.
    this.generation = 0;
    this.raceGeneration = 0;
    this.metadataRequestId = 0;
    this.lastMetadataRequest = 0;
    this.statusInFlight = false;
    this.raceInFlight = false;

    this.renndaten = [];
    this.fahrerBySlot = {};
    this.state = {
      status: null,
      rennen: null,
      fahrer: deepFreeze([]),
      autos: deepFreeze([]),
      online: null
    };

    this.start();
  }

  CockpitApi.VERSION = VERSION;
  CockpitApi.Error = CockpitApiError;
  CockpitApi.STATUS_TEXTS = deepFreeze(Object.assign({}, STATUS_TEXTS));

  // --- Events ----------------------------------------------------------------

  CockpitApi.prototype.on = function (eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener muss eine Funktion sein.');
    }
    (this.listeners[eventName] = this.listeners[eventName] || []).push(listener);
    return this;
  };

  CockpitApi.prototype.off = function (eventName, listener) {
    var listeners = this.listeners[eventName];
    if (listeners) {
      this.listeners[eventName] = listeners.filter(function (current) {
        return current !== listener;
      });
    }
    return this;
  };

  // Ein fehlerhafter Listener darf weder andere Listener noch das Polling stören.
  CockpitApi.prototype.emit = function (eventName, value, previous) {
    (this.listeners[eventName] || []).slice().forEach(function (listener) {
      try {
        listener(value, previous);
      } catch (error) {
        if (global.console && typeof global.console.error === 'function') {
          global.console.error('CockpitApi: Fehler im Listener für "' + eventName + '"', error);
        }
      }
    });
  };

  // --- Zustand ---------------------------------------------------------------

  CockpitApi.prototype.getState = function () {
    return Object.freeze(Object.assign({}, this.state));
  };

  CockpitApi.prototype.getStatus = function () {
    return this.state.status;
  };

  CockpitApi.prototype.setOnline = function (online) {
    if (this.state.online !== online) {
      this.state.online = online;
      this.emit('connection', { online: online });
    }
  };

  CockpitApi.prototype.publishAutos = function () {
    this.state.autos = deepFreeze(mergeAutos(this.renndaten, this.fahrerBySlot));
    this.emit('autos', this.state.autos);
  };

  // --- Steuerung -------------------------------------------------------------

  CockpitApi.prototype.start = function () {
    if (this.running) {
      return this;
    }
    this.running = true;
    this.generation += 1;

    this.loadMetadata(true).catch(noop);
    this.pollStatus();
    this.statusTimer = global.setInterval(this.pollStatus.bind(this), STATUS_INTERVAL);
    this.startRaceTimer();
    return this;
  };

  CockpitApi.prototype.stop = function () {
    this.running = false;
    this.generation += 1;
    this.statusInFlight = false;
    this.metadataPromise = null;
    global.clearInterval(this.statusTimer);
    this.statusTimer = null;
    this.stopRaceTimer();
    return this;
  };

  CockpitApi.prototype.startRaceTimer = function () {
    if (this.running && this.pollsRenndaten && !this.raceTimer) {
      this.raceGeneration += 1;
      this.pollRenndaten();
      this.raceTimer = global.setInterval(this.pollRenndaten.bind(this), RACE_DATA_INTERVAL);
    }
  };

  // Laufende Renndaten-Antworten werden danach verworfen.
  CockpitApi.prototype.stopRaceTimer = function () {
    this.raceGeneration += 1;
    this.raceInFlight = false;
    global.clearInterval(this.raceTimer);
    this.raceTimer = null;
  };

  /** Renndaten-Polling zur Laufzeit ein- oder ausschalten. */
  CockpitApi.prototype.setRenndaten = function (enabled) {
    enabled = Boolean(enabled);
    if (enabled !== this.pollsRenndaten) {
      this.pollsRenndaten = enabled;
      if (enabled) this.startRaceTimer();
      else this.stopRaceTimer();
    }
    return this;
  };

  /** Renndaten-Filter wechseln, ohne eine neue Instanz anzulegen. null = alle Slots. */
  CockpitApi.prototype.setSlot = function (slot) {
    slot = parseSlot(slot, true);
    if (slot === this.slot) {
      return this;
    }
    this.slot = slot;
    this.raceGeneration += 1;
    this.raceInFlight = false;
    this.renndaten = [];
    this.publishAutos();
    if (this.running && this.pollsRenndaten) {
      this.pollRenndaten();
    }
    return this;
  };

  /**
   * Fahrer und allgemeine Renndaten neu laden. Liefert { rennen, fahrer }.
   * Läuft bereits ein Laden, wird dessen Ergebnis mitgenutzt.
   */
  CockpitApi.prototype.reloadMetadata = function () {
    return this.loadMetadata(false);
  };

  // --- HTTP ------------------------------------------------------------------

  CockpitApi.prototype.request = function (path, init) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var controller = typeof global.AbortController === 'function' ? new global.AbortController() : null;
      var settled = false;
      var finish = function (callback, value) {
        if (!settled) {
          settled = true;
          global.clearTimeout(timer);
          callback(value);
        }
      };
      var timer = global.setTimeout(function () {
        finish(reject, new CockpitApiError(
          'Zeitüberschreitung nach ' + self.requestTimeout + ' ms', path, 'timeout'
        ));
        if (controller) {
          controller.abort();
        }
      }, self.requestTimeout);

      if (controller) {
        init.signal = controller.signal;
      }

      Promise.resolve().then(function () {
        return self.fetch(path, init);
      }).then(function (response) {
        if (!response.ok) {
          throw new CockpitApiError(
            'Cockpit-XP antwortet mit HTTP ' + response.status, path, 'http', response.status
          );
        }
        return response.status === 204 ? '' : response.text();
      }).then(function (text) {
        finish(resolve, text);
      }, function (error) {
        finish(reject, error instanceof CockpitApiError
          ? error
          : new CockpitApiError('Cockpit-XP ist nicht erreichbar', path, 'network', null, error));
      });
    });
  };

  CockpitApi.prototype.getJson = function (path) {
    return this.request(path, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }).then(function (text) {
      if (!text) {
        return null;
      }
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new CockpitApiError('Ungültige Antwort von Cockpit-XP', path, 'parse', null, error);
      }
    });
  };

  // Jede 2xx-Antwort gilt als Erfolg, der Antwortinhalt wird ignoriert.
  CockpitApi.prototype.post = function (path, body) {
    return this.request(path, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(noop);
  };

  // --- Polling ---------------------------------------------------------------

  CockpitApi.prototype.pollStatus = function () {
    var self = this;
    var generation = this.generation;
    if (this.statusInFlight) {
      return;
    }
    this.statusInFlight = true;

    this.getJson(ENDPOINTS.status).then(function (data) {
      if (generation !== self.generation) return;
      var previous = self.state.status;
      var status = deepFreeze(normalizeStatus(data || {}));
      self.state.status = status;
      self.setOnline(true);
      self.emit('status', status, previous);
      if (previous && previous.rennstatus !== status.rennstatus) {
        self.loadMetadata(true).catch(noop);
        self.emit('statusChange', status, previous);
      }
    }, function (error) {
      // Der letzte gültige Status bleibt bewusst erhalten.
      if (generation !== self.generation) return;
      self.setOnline(false);
      self.emit('error', error);
    }).then(function () {
      if (generation === self.generation) self.statusInFlight = false;
    });
  };

  CockpitApi.prototype.pollRenndaten = function () {
    var self = this;
    var generation = this.raceGeneration;
    var slot = this.slot;
    if (this.raceInFlight) {
      return;
    }
    this.raceInFlight = true;

    var path = ENDPOINTS.renndaten + (slot === null ? '' : '?slot=' + encodeURIComponent(slot));
    this.getJson(path).then(function (data) {
      if (generation !== self.raceGeneration) return;
      var renndaten = normalizeList(data, normalizeRenndaten);
      if (slot !== null) {
        renndaten = renndaten.filter(function (auto) { return auto.slot === slot; });
      }
      self.renndaten = renndaten;
      self.reloadMetadataForUnknownSlots();
      self.publishAutos();
    }, function (error) {
      // Die letzten gültigen Renndaten bleiben bewusst erhalten.
      if (generation !== self.raceGeneration) return;
      self.emit('error', error);
    }).then(function () {
      if (generation === self.raceGeneration) self.raceInFlight = false;
    });
  };

  CockpitApi.prototype.reloadMetadataForUnknownSlots = function () {
    var self = this;
    var unknown = this.renndaten.some(function (auto) { return !self.fahrerBySlot[auto.slot]; });
    if (unknown && Date.now() - this.lastMetadataRequest >= METADATA_RELOAD_THROTTLE) {
      this.loadMetadata(false).catch(noop);
    }
  };

  // force: neue Anfrage auch dann, wenn schon eine läuft (z. B. nach Statuswechsel,
  // weil die laufende Antwort den alten Stand enthalten kann).
  CockpitApi.prototype.loadMetadata = function (force) {
    var self = this;
    if (!force && this.metadataPromise) {
      return this.metadataPromise;
    }
    var generation = this.generation;
    var requestId = ++this.metadataRequestId;
    this.lastMetadataRequest = Date.now();

    var promise = Promise.all([
      this.getJson(ENDPOINTS.rennen),
      this.getJson(ENDPOINTS.fahrer)
    ]).then(function (result) {
      if (requestId === self.metadataRequestId && generation === self.generation) {
        var fahrer = normalizeList(result[1], normalizeFahrer).sort(function (first, second) {
          return first.slot - second.slot;
        });
        self.fahrerBySlot = {};
        fahrer.forEach(function (item) { self.fahrerBySlot[item.slot] = item; });
        self.state.rennen = deepFreeze(normalizeRennen(result[0] || {}));
        self.state.fahrer = deepFreeze(fahrer);
        self.emit('rennen', self.state.rennen);
        self.emit('fahrer', self.state.fahrer);
        if (self.pollsRenndaten) {
          self.publishAutos();
        }
      }
      return { rennen: self.state.rennen, fahrer: self.state.fahrer };
    }, function (error) {
      // Vorhandene Metadaten bleiben bewusst erhalten.
      if (generation === self.generation) self.emit('error', error);
      throw error;
    });
    var clear = function () {
      if (self.metadataPromise === promise) self.metadataPromise = null;
    };
    promise.then(clear, clear);
    this.metadataPromise = promise;
    return promise;
  };

  // --- Aktionen --------------------------------------------------------------

  /** Erteilt dem Slot sofort eine Strafe. */
  CockpitApi.prototype.strafe = function (slot) {
    return this.post(ENDPOINTS.strafe, { slot: parseSlot(slot, false) });
  };

  /** Löst einen Cockpit-XP-Button aus (1–9). Für 1–4 gibt es benannte Methoden. */
  CockpitApi.prototype.simulateButton = function (id) {
    var number = Number(id);
    if (!Number.isInteger(number) || number < 1 || number > 9) {
      throw new RangeError('id muss eine Ganzzahl zwischen 1 und 9 sein.');
    }
    return this.post(ENDPOINTS.button, { id: number });
  };

  Object.keys(BUTTON_IDS).forEach(function (action) {
    CockpitApi.prototype[action] = function () {
      return this.simulateButton(BUTTON_IDS[action]);
    };
  });

  // ---------------------------------------------------------------------------
  // Formatierer (optional, reine Funktionen für die Anzeige)
  // ---------------------------------------------------------------------------

  function pad(value, length) {
    return String(value).padStart(length || 2, '0');
  }

  function isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  CockpitApi.format = Object.freeze({
    /** 295000 -> "04:55", 3723000 -> "01:02:03" */
    rennzeit: function (milliseconds) {
      if (!isNumber(milliseconds) || milliseconds < 0) return '--:--';
      var totalSeconds = Math.floor(milliseconds / 1000);
      var hours = Math.floor(totalSeconds / 3600);
      var time = pad(Math.floor((totalSeconds % 3600) / 60)) + ':' + pad(totalSeconds % 60);
      return hours > 0 ? pad(hours) + ':' + time : time;
    },

    /** 67954 -> "01:07.954" */
    rundenzeit: function (milliseconds) {
      if (!isNumber(milliseconds) || milliseconds <= 0) return '--:--.---';
      var minutes = Math.floor(milliseconds / 60000);
      return pad(minutes) + ':' + ((milliseconds % 60000) / 1000).toFixed(3).padStart(6, '0');
    },

    /** 1234 -> "+1.234 s"; 0 (Führender) -> "--" */
    abstand: function (milliseconds) {
      if (!isNumber(milliseconds) || milliseconds <= 0) return '--';
      return '+' + (milliseconds / 1000).toFixed(3) + ' s';
    },

    /** 67954 -> "67,954 s" */
    sekunden: function (milliseconds) {
      if (!isNumber(milliseconds) || milliseconds <= 0) return '-- s';
      return (milliseconds / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }) + ' s';
    },

    /** 91.3 -> "91,3 %" */
    prozent: function (value, minimumFractionDigits) {
      if (!isNumber(value)) return '--';
      return value.toLocaleString('de-DE', {
        minimumFractionDigits: minimumFractionDigits === undefined ? 1 : minimumFractionDigits,
        maximumFractionDigits: 2
      }) + ' %';
    },

    /** 'running' -> "Rennen läuft" */
    statusText: function (statusKey) {
      return STATUS_TEXTS[statusKey] || STATUS_TEXTS.unknown;
    }
  });

  global.CockpitApi = CockpitApi;
}(typeof window !== 'undefined' ? window : globalThis));
