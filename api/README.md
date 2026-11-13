# CockpitApi 2.0

Kleine, buildfreie JavaScript-Bibliothek für Cockpit-XP Rennbildschirme. Sie übernimmt Polling, Normalisierung und Aktionen. Der Bildschirm muss nur noch anzeigen.

Die API wird immer über denselben Host aufgerufen, von dem die Seite geladen wurde. Die Datei `cockpit-api.js` einfach neben die eigene HTML-Seite in den Webserver von Cockpit-XP legen.

## Einbindung

```html
<script src="cockpit-api.js"></script>
<script>
  const cockpit = new CockpitApi();
  const format = CockpitApi.format;

  cockpit.on('status', (status) => {
    document.querySelector('#status').textContent = format.statusText(status.statusKey);
    document.querySelector('#time').textContent = format.rennzeit(status.rennzeit);
  });

  cockpit.on('autos', (autos) => {
    for (const auto of autos) {
      console.log(auto.position, auto.namefahrer, format.rundenzeit(auto.rundenzeit));
    }
  });

  cockpit.on('connection', ({ online }) => console.log(online ? 'Online' : 'Offline'));
</script>
```

## Optionen

```js
new CockpitApi({
  slot: 2,             // optional: Renndaten serverseitig auf einen Slot filtern
  renndaten: false,    // optional: /renndaten gar nicht pollen (z. B. Rennleiter)
  requestTimeout: 5000 // optional: Timeout je Request in ms
});
```

Die Instanz startet sofort. Der Rennstatus wird alle 800 ms gepollt, die Renndaten alle 1000 ms. Fahrer und allgemeine Daten werden beim Start, bei jedem Wechsel des Rennstatus und beim ersten Auftauchen eines unbekannten Slots geladen.

## Methoden

| Methode | Beschreibung |
|---|---|
| `on(event, listener)` / `off(event, listener)` | Events abonnieren bzw. abbestellen. |
| `getState()` | `{ status, rennen, fahrer, autos, online }`, der letzte bekannte Stand. |
| `getStatus()` | Letzter Rennstatus. |
| `setSlot(slot)` | Slot-Filter wechseln (`null` = alle). Die Autos werden geleert und sofort neu geladen. |
| `setRenndaten(aktiv)` | Renndaten-Polling zur Laufzeit ein- oder ausschalten, z. B. erst nach einer Fahrerauswahl. |
| `reloadMetadata()` | Fahrer und allgemeine Daten neu laden. Promise mit `{ rennen, fahrer }`. Läuft bereits ein Laden, wird es mitgenutzt. |
| `start()` / `stop()` | Polling starten bzw. beenden. Laufende Antworten werden nach `stop()` verworfen. |

## Events

| Event | Argumente | Wann |
|---|---|---|
| `status` | `(status, previous)` | bei jedem Statuspoll |
| `statusChange` | `(status, previous)` | nur wenn sich `rennstatus` ändert |
| `autos` | `(autos)` | neue Renndaten oder neue Fahrerdaten |
| `fahrer` | `(fahrer)` | Fahrerliste geladen (immer alle Fahrer, unabhängig vom Slot) |
| `rennen` | `(rennen)` | allgemeine Daten geladen |
| `connection` | `({ online })` | nur wenn sich die Erreichbarkeit ändert |
| `error` | `(CockpitApiError)` | Fehler beim Polling bzw. Laden. Der letzte gültige Stand bleibt erhalten. |

Alle gelieferten Objekte sind schreibgeschützt (`Object.freeze`). Wirft ein Listener eine Exception, wird sie in der Konsole gemeldet, andere Listener laufen trotzdem weiter.

## Datenvertrag

Die Feldnamen entsprechen der Cockpit-XP-API. Die Bibliothek bereinigt nur die Typen. **Jeder Wert hat entweder den dokumentierten Typ oder ist `null`.** Alle Zeiten sind Millisekunden.

### `status`

| Feld | Typ | Hinweis |
|---|---|---|
| `rennstatus` | Zahl | 1, 2, 6 oder 9 |
| `statusKey` | String | `internal` (0), `running` (1), `starting` (2), `winner` (3), `finished` (4), `paused` (6), `restarting` (8), `aborted` (9), sonst `unknown` |
| `rennzeit` | ms / `null` | API liefert `"04:55"` bzw. `"1:02:03"` |
| `statusampel` | Zahl / `null` | |
| `ampeln` | Array(5) | je `red`, `yellow`, `green` oder `off` |
| `aktionen` | Array | im Status sinnvolle Aktionen: `running` → `pause`, `abbruch`; `paused` → `weiter`; `aborted`, `finished` → `startampel` |

### `rennen`

| Feld | Typ | Hinweis |
|---|---|---|
| `rennmodus` | String / `null` | z. B. „Rennen: 10 Runden“ |
| `sollrennrunden` | Zahl / `null` | `null` bei Zeitrennen |
| `sollzeit` | ms / `null` | API liefert Sekunden; `null` bei Rundenrennen |
| `anzahlfahrer` | Zahl / `null` | |

### `fahrer` (Array, nach Slot sortiert)

`slot` (Zahl), `namefahrer`, `shortnamefahrer`, `namefahrzeug`, `bildfahrer`, `bildfahrzeug` (String / `null`), `bildfahrerUrl`, `bildfahrzeugUrl` (absolute URL / `null`), `slotfarbeback`, `slotfarbefont` (CSS-Farbe `"#rrggbb"` / `null`; Delphi-Systemfarben wie `clWindowText` = `-16777208` werden mit den Windows-Standardfarben umgesetzt).

### `autos` (Array, nach Position sortiert)

Jedes Auto enthält die Renndaten **und** die Fahrerfelder seines Slots (Fahrerfelder sind `null`, solange der Fahrer unbekannt ist).

| Feld | Typ | Hinweis |
|---|---|---|
| `slot` | Zahl | |
| `position` | Zahl / `null` | `null` vor der ersten Wertung, steht dann am Ende der Liste |
| `runde` | Zahl / `null` | |
| `rundenzeit`, `schnellsterunde` | ms / `null` | `null` solange keine Runde gefahren |
| `schnellsterunderd` | Zahl / `null` | Rundennummer der schnellsten Runde |
| `abstandzeitfuehrenden`, `abstandzeitvordermann` | ms / `null` | 0 beim Führenden |
| `abstandrundefuehrenden`, `abstandrundevordermann` | Zahl / `null` | Rundendifferenz |
| `tankstand` | Zahl / `null` | Prozent, 0–100 |
| `tankenaktiviert` | Boolean | Auto ist in der Box |
| `strafstand`, `strafdauer` | Zahl / `null` | |
| `strafart` | String / `null` | |
| `strafeAktiv` | Boolean | Strafe laut `strafart`, `strafdauer` oder `strafstand` aktiv |

Unbekannte, neue API-Felder werden unverändert durchgereicht.

## Aktionen

Alle Aktionen liefern eine Promise. Jede 2xx-Antwort gilt als Erfolg. Fehler werden **nur** über die Promise gemeldet, nicht über das Event `error`.

| Methode | API |
|---|---|
| `startampel()` | `cpsimulatebutton` id 1 |
| `abbruch()` | `cpsimulatebutton` id 2 |
| `pause()` | `cpsimulatebutton` id 3 |
| `weiter()` | `cpsimulatebutton` id 4 |
| `simulateButton(id)` | `cpsimulatebutton` id 1–9 (5 Training, 6 Quali, 7 Schnellstart, 8 RC-Center, 9 Wechsel) |
| `strafe(slot)` | `cptastenstrafe` |

`status.aktionen` ist ein Hinweis für die Oberfläche. Ob eine Aktion wirklich ausgeführt wird, entscheidet Cockpit-XP.

## Fehler

Fehler sind vom Typ `CockpitApi.Error` (`name: 'CockpitApiError'`) mit:

- `endpoint`: der aufgerufene Pfad
- `kind`: `http`, `timeout`, `network` oder `parse` (kein gültiges JSON)
- `httpStatus`: HTTP-Statuscode bei `kind: 'http'`, sonst `null`

## Formatierer

`CockpitApi.format` enthält optionale Helfer für die Anzeige. Bei `null` liefern sie einen Platzhalter.

| Helfer | Beispiel |
|---|---|
| `rennzeit(ms)` | `295000` → `04:55`, `3723000` → `01:02:03` |
| `rundenzeit(ms)` | `67954` → `01:07.954` |
| `abstand(ms)` | `1234` → `+1.234 s`, `0` → `--` |
| `sekunden(ms)` | `67954` → `67,954 s` |
| `prozent(wert, nachkommastellen = 1)` | `91.3` → `91,3 %` |
| `statusText(statusKey)` | `paused` → „Rennen pausiert“ |
