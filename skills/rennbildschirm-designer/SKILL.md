---
name: rennbildschirm-designer
description: Entwirft und baut einen eigenen Rennbildschirm (Rennen.xml + Hintergrundbild) für die Slotcar-Software Cockpit-XP. Führt den Kunden Schritt für Schritt durch die Fragen (Digital/Analog, Fahreranzahl, gewünschte Daten, Design, Zielordner) und erzeugt danach einen fertigen Ordner mit Vorschau. Verwenden bei "Rennbildschirm bauen/designen/erstellen", "RBS erstellen", "Cockpit Screen", "Renn-Screen für X Fahrer".
---

# Rennbildschirm-Designer für Cockpit-XP

Du hilfst einem Cockpit-XP-Anwender, einen **eigenen Rennbildschirm** zu bauen. Ein Rennbildschirm ist ein **Ordner** mit
einem **Hintergrundbild** und einer **`Rennen.xml`**. Cockpit lädt das Bild und legt die Live-Werte (Zeiten, Runden,
Namen …) laut XML pixelgenau darüber.

**Sprache:** Deutsch, freundlich, ohne Fachchinesisch. Viele Anwender sind über 50 und keine Programmierer.
Erkläre Begriffe kurz, wenn du sie brauchst (z. B. „Spurfarbe = die Farbe, die in Cockpit für jede Spur eingestellt ist“).

---

## Teil A: Gesprächsablauf

Stelle die Fragen **in genau dieser Reihenfolge**, immer **einen Schritt nach dem anderen**. Wenn ein Werkzeug für
Auswahlfragen verfügbar ist (z. B. `AskUserQuestion`), nutze es. Sonst nummerierte Antwortmöglichkeiten im Text.
Hat der Kunde etwas schon von sich aus gesagt, bestätige es kurz statt erneut zu fragen.

### Schritt 1: Digital oder analog?
Frage: **„Fährst du auf einer digitalen oder einer analogen Bahn?“**

| | Analog | Digital |
|---|---|---|
| Bedeutung von `slot` | feste Spur 1–8 | Regler-/Auto-Nummer |
| Beschriftung in der Zeile | „Spur 3“ | „Regler 3“ (oder „Auto 3“, Kunde fragen) |
| Spurfarbe (`slotcolorbg`) | Farbe der Spur | in Cockpit eingestellte Reglerfarbe |
| Spurwechsel-Rennen | möglich (Cockpit zeigt am Ende ein eigenes Podium-Popup) | – |

Das Podium-, Sieger- und Stand-Popup baut der Skill nicht, Cockpit nimmt sie aus `Cp Defaults`.
| Carrera CU30352 | – | Nachfrage: **„Nutzt du eine Carrera Control Unit 30352?“** Nur dann gibt es Gas-/Bremswerte (`cugeschwwert`, `cubremswert`) |

Bei Digital zusätzlich fragen, **ob Boxengasse/Tanken genutzt wird** (bei analog ebenso, falls die Bahn eine Tank-/Boxenerkennung hat).

### Schritt 2: Wie viele Fahrer?
Frage: **„Für wie viele Fahrer (1–8) soll der Bildschirm sein?“**
- Die Zahl bestimmt `slots` in der XML und die Zeilenhöhe (siehe Teil C).
- **1 Fahrer** ist ein Sonderfall (Einzelzeitfahren, Training allein, Quali auf einer Spur) mit großem „Cockpit“-Layout statt Tabelle.
  Frage dann zusätzlich, welche Art.

### Schritt 3: Welche Daten sollen angezeigt werden?
Frage zuerst nach der **Art** des Bildschirms: **Rennen**, **Training/Quali**, **Serien-/Clubrennen**, **Einzelzeitfahren** (nur 1 Fahrer).

Dann die Daten. Zeige die Liste in Gruppen, der **Grundstock ist vorausgewählt**, der Kunde streicht oder ergänzt
(Mehrfachauswahl). Weise darauf hin: **Je mehr Werte, desto kleiner wird die Schrift.** Bei 6–8 Fahrern sind
etwa 6–8 Werte je Zeile gut lesbar.

| Gruppe | Angebot | Variablen (Teil D) |
|---|---|---|
| **Grundstock** (vorausgewählt) | Platz, Name, Runden, letzte Runde, schnellste Runde | `position`, `fahrer`, `runde`, `rundenzeit`, `schnellsterunde` |
| Bilder | Fahrerbild, Fahrzeugbild, Flagge | `bildfahrer`, `bildfahrzeug`, `bildnation` |
| Fahrzeug | Fahrzeugname, Kürzel (3 Buchstaben) | `fahrzeug`, `fahrersn` |
| Abstände | zum Führenden, zum Vordermann | `abstand`, `abstandvordermann` |
| Differenzen | ± zur Vorrunde, Rückstand auf Bestzeit | `diffletzterunde`, `diffschnellsterunde` |
| Historie | Ø-Runde, die letzten 4 Runden | `durchschnrundenzeit`, `histrundenzeit` |
| **Zwischenzeiten / Sektoren** | Sektor 1–3, Zwischenzeit 1–8, optimale Runde | `sektorzeit`, `zwischenzeit`, `bestzeitsektorsum` |
| Geschwindigkeit | Topspeed, Ø-Geschwindigkeit | `topspeed`, `durchv` |
| **Tank / Box** | Tankbalken, Tank %, Box-Symbol, Anzahl Stopps | `tankbar`, `tank1000`, `symbole_einaus` 32/33, `tankStopps` |
| **Strafen** | Strafbalken mit Text, Zeitstrafe, Strafpunkte | `progressbar typ="strafe2"`, `zeitstrafe`, `strafpunktefahrer` |
| Rekorde | Bahnrekord (+ Halter), Spurrekord | `bahnrekord`, `bahnrekordfahrer`, `slotrekord` |
| Serie | Gesamtplatz, Gesamtrunden, „Rennen x von y“ | `crpositiongesamt`, `crrundenzahlgesamt`, `cranzahlrennengefahren`/`…gesamt` |
| Nur CU30352 | Gas- und Bremswert | `cugeschwwert`, `cubremswert` |
| Nur mit Schadens-Addon | Motor-/Bremsschaden-Symbol | `symbole_einaus` 73/74, 75/76 |

Wichtige Hinweise beim Fragen:
- **Zwischenzeiten, Sektoren, Topspeed** brauchen zusätzliche Messstellen an der Bahn. Ohne sie zeigt Cockpit `0,000`
  statt eines leeren Feldes. Frage nach: **„Hat deine Bahn Messstellen für Sektoren/Zwischenzeiten/Topspeed? Wie viele?“**
- **Schadenssymbole** nur, wenn der Kunde das Schadens-Addon (`Cp-SchadenSimulation-CU`) hat. Nachfragen.
- **Kopf und Fuß** gehören immer dazu (nicht extra fragen, nur erwähnen): Rennmodus, „Führt: Name“, Rennzeit/Restrunden,
  Statuszeile, Name der Rennbahn, Rennzeit-Balken.

### Schritt 4: Wie soll es aussehen?
Frage offen: **„Wie stellst du dir das Design vor? Farben, hell oder dunkel, ein bestimmter Stil, dein Vereinslogo …?“**
Das Design ist **frei** und gehört dem Kunden. Entwickle es aus seinen Wünschen (Teil E). Hat er keine Idee, frag nach
Anhaltspunkten (Vereinsfarben, Logo, Lieblingsserie, Stimmung, Bahn/Raum) und schlage daraus **zwei bis drei eigene,
deutlich unterschiedliche Richtungen** vor, gern als kleine Skizzenbilder.

Kläre dabei (mit sinnvollen Vorgaben, nur nachfragen, wenn unklar):
- **Monitor:** Standard ist **Full HD 1920×1080** → Fläche **1904×960** (siehe Teil B). Cockpit kann den Screen auf andere
  Monitore skalieren („Rennbildschirm an der Größe des Monitors anpassen“), daher reicht in der Regel Full HD.
  Ausnahme: Zusatzmonitor ohne Taskleiste → 1912×1052.
- **Logo:** Pfad zu einer Bilddatei (PNG mit Transparenz ideal). Es wird ins Hintergrundbild gemalt.
- **Schrift:** Cockpit kann nur installierte Schriften nutzen. Für Screens, die weitergegeben werden, nur Schriften, die auf
  **jedem** Windows-PC vorhanden sind (z. B. Bahnschrift, Impact, Arial, Arial Black, Segoe UI, Tahoma, Verdana, Trebuchet MS).
  Andere Schriften nur, wenn der Kunde sie installiert hat. **Genau vermessen** sind bisher nur Bahnschrift und Impact
  (Teil B, Regel 5). Bei anderen Schriften den Kunden darauf hinweisen, dass nach dem ersten Test evtl. nachjustiert werden muss.

**Startampel** (am Ende von Schritt 4 fragen):
**„Möchtest du die normale Startampel von Cockpit nutzen oder eine eigene im Design deines Bildschirms?“**
1. **Standard-Ampel nutzen (empfohlen, kein Aufwand):** Es wird **nichts kopiert**. Cockpit nimmt automatisch die Ampel
   aus `Cp Defaults`, solange im Screen-Ordner keine eigene liegt. Vorteil: Aktualisiert sich mit Cockpit, passt zu allen Screens.
2. **Eigene Ampel bauen:** Die Ampel aus `Cp Defaults` wird in den Screen-Ordner kopiert und dort im Look des Bildschirms
   umgestaltet (Träger, Lampenbilder, Farben, Frühstart-Text). Frag kurz nach Wünschen (z. B. Farben wie der Screen,
   Vereinslogo auf dem Träger, Anzahl der Lichter je Lampe). Ablauf siehe Teil F, Schritt 3b.

### Schritt 5: Wo soll der Bildschirm gespeichert werden?
Frage: **„In welchen Ordner soll ich den Rennbildschirm legen, und wie soll er heißen?“**
- Vorschlag: `C:\ProgramData\Cockpit-V2\RennBildschirm\Anwender\<Name>` (Cockpit zeigt alle Ordner unter `RennBildschirm`).
- Namensvorschlag: `<Kürzel>-<n>S-<Art> 1920x1080`, z. B. `MSC-6S-Rennen 1920x1080`. Das Präfix **`Cp-` nicht verwenden**
  (gehört zu den mitgelieferten Screens von Cockpit).
- **Existiert der Ordner schon und ist nicht leer: nachfragen**, bevor etwas überschrieben wird.

### Zusammenfassung und Bau
Fasse alle Antworten in einer kurzen Liste zusammen und hole ein **„Ja, bauen“** ein. Dann Teil F (Bauen) ausführen,
die Vorschau ansehen, selbst prüfen (Teil G) und dem Kunden das Ergebnis mit Testanleitung (Teil H) übergeben.
Änderungswünsche danach: Skript anpassen, neu erzeugen, erneut prüfen.

---

## Teil B: Technische Grundregeln (unbedingt einhalten)

1. **Ordnerinhalt:** `Rennen.xml`, Hintergrundbild (`.jpg`), `vorschau.jpg`, `version.xml`, verwendete Symbol-PNGs.
   Nur bei **eigener** Startampel zusätzlich `Startampel.xml` + `Startampel.xml.CCu` mit ihren Bildern (Teil F, Schritt 3b).
   **Alle Bilder liegen im selben Ordner wie die XML.**
2. **Kodierung ISO-8859-1** (`<?xml version="1.0" encoding="iso-8859-1"?>`) und **Zeilenenden CRLF**. Sonst sind Umlaute kaputt.
3. **Farben im Format `00BBGGRR`** (Blau-Grün-Rot!). Rot `#FF0000` → `000000FF`, Gold `#FFC400` → `0000C4FF`.
   Sonderwerte: `slotcolor` (Spur-Schriftfarbe), `slotcolorbg` (Spur-Hintergrundfarbe).
4. **Der Platzhalter-Text zwischen den Tags bestimmt die Feldbreite.** Cockpit misst ihn in der eingestellten Schrift,
   längere Werte werden **abgeschnitten**. Immer den **längsten erwarteten Wert** nehmen:
   `88,888` (Zeit), `999` (Runden), `Vorname Nachname1` (Name), `Rennen: 999 Runden / 999 Min (Startampel)` (Rennmodus),
   für `rennbahn` 40 Zeichen. `len="0"` lassen.
5. **Schriftgröße:** `fh` ist die Zellenhöhe, nicht die Buchstabengröße. Cockpit zeichnet **Bahnschrift mit 0,787 × fh**
   und **Impact mit 0,753 × fh** (gemessen). Wer rechtsbündig oder zentriert setzt, misst die Platzhalterbreite in genau dieser
   Größe (der Baustein in Teil F macht das). Für **andere Schriften** ist der Faktor nicht gemessen und lässt sich nicht aus der
   Schriftdatei ableiten: mit 0,78 schätzen, Spalten lieber linksbündig oder mit etwas Luft setzen und nach dem ersten
   Screenshot aus Cockpit korrigieren.
6. **`fa="right"`/`"center"`** richten **innerhalb der Platzhalterbreite** aus. `xpos` ist immer die linke Kante des Feldes.
   Für eine rechte Kante bei X also `xpos = X − Platzhalterbreite`.
7. **Bahnschrift** mit `fs="b"` (fett) oder `fs=""`; **Impact immer `fs=""`**.
8. **`fcn`** ist die Farbe für den **absolut besten Wert aller Fahrer** (z. B. für die schnellste Runde des Rennens).
   Wo das nicht gewollt ist: `fcn` = `fc` setzen. Bei `position` wirkt `fcn` nicht.
9. **Tabelle nach Platz:** In `<dim>` `fahrerposfix="-1"` (Anwender entscheidet in der Bildschirmauswahl: nach Platz oder
   fest nach Spur) und **alle Zeilen `sort="0"`**, `nr` = Zeile 1…n. Dann bleiben Balken, Bilder und Symbole beim richtigen Fahrer.
   **Nichts fest an Zeile 1 binden** (z. B. keine goldene Fläche für den Führenden im Hintergrund, Fahrer können fixiert sein).
   Den Führenden zeigt man mit **`sort="1" nr="1"`** (z. B. „FÜHRT: Name“ im Kopf).
10. **Training/Quali** nach schnellster Runde sortieren: `sorttraining="1"` in `<dim>`.
11. **Globale Werte** (`rennmodus`, `rennzeit`, `status`, `rennbahn`, `bahnrekord`) mit `nr="0"`.
    **`restrunden` ist ein Fahrerwert**: für den Führenden `nr="1" sort="1"` (mit `nr="0"` bleibt es leer).
12. **Unter Bildfeldern** (`bildfahrer`, `bildfahrzeug`) **keine Fläche ins Hintergrundbild malen**, sie scheint durch transparente
    PNGs. Fehlt ein Fahrerbild, zeigt Cockpit einen Platzhalter, ein fehlendes Fahrzeugbild bleibt leer.
13. **Symbole** (`symbole_einaus`) liegen **hinter** einem `progressbar` an derselben Stelle. Nicht überlappen lassen.
    Ein- und Aus-Ereignis müssen zusammenpassen (beide fahrerbezogen mit `nr` = Zeile, oder beide global mit `nr="0"`).
14. **Strafbalken `strafe2`** ist ohne Strafe unsichtbar und braucht Platz (mind. ca. 236×50 px).
    `opt1c` = Textfarbe im Balken: auf hellem Grund dunkel, auf dunklem Grund Weiß.
15. **Erlaubte Variablen:** nur die aus Teil D (stammen aus dem Cockpit-XP-Wiki). **Nicht verwenden:** AddOn-Variablen
    (`addonvariable`, `addonbar`, `bildueberaddon`), Urkunden-Variablen (`crdurchgang`, `crfahrer`, `crname`, `crplatz`,
    `crpunkte`, `crrenntag`), alte Namen (`vrennenrzsum`, `restrennzeit`, `bildfahrerschnellsterunde`).
    `cugeschwwert`/`cubremswert` nur bei CU30352 und den Screen dann als CU-Screen kennzeichnen (z. B. Text „NUR MIT CARRERA CU“).
16. **Nichts Bestehendes verändern:** Programmordner `C:\Program Files (x86)\Cockpit-XP` und `Cp Defaults` **nur lesen**.
    Andere Rennbildschirme nicht anfassen. Nur in den vom Kunden genannten Zielordner schreiben.

### Bildschirmgröße (`xmax` × `ymax` in `<dim>`)
| Einsatz | Formel | Full HD |
|---|---|---|
| Hauptmonitor mit Taskleiste und F-Leiste (**Standard**) | Breite−16 × Höhe−120 | **1904 × 960** |
| Hauptmonitor ohne Taskleiste, mit F-Leiste | B−16 × H−72 | 1904 × 1008 |
| Zusatzmonitor | B−8 × H−28 | 1912 × 1052 |

Das Hintergrundbild hat **exakt** `xmax` × `ymax` Pixel.

---

## Teil C: Aufbau und Layout

### Grundgerüst `Rennen.xml`
```xml
<?xml version="1.0" encoding="iso-8859-1"?>
<RennScreen>
	<base>
		<dim xmax="1904" ymax="960" bcolor="00000000" bimage="Hintergrund_1904x960.jpg" fahrerposfix="-1" slots="6" sorttraining="0" fontsizefaktor="100">Bildschirm Dimension+Background</dim>
		<defaults ft="Bahnschrift">Schriftart-Defaults Hier nur Fonttyp(Muss)</defaults>
	</base>
	<texte>     <!-- feste Beschriftungen (<text>) --> </texte>
	<grafik>    <!-- Flächen in Spurfarbe (<box>), Linien --> </grafik>
	<variablen> <!-- Live-Werte, Bilder, Balken, Symbole --> </variablen>
</RennScreen>
```
Der Text in `<dim>` und `<defaults>` muss genau so stehen.

### Elemente (vollständige Attributlisten verwenden)
Koordinaten und Farben in den Beispielen sind **nur Platzhalter**, sie zeigen die Schreibweise, kein Design.
```xml
<!-- Textvariable -->
<rundenzeit xpos="1000" ypos="200" nr="1" nks="3" mst="1" len="0" fcn="00FF00FF" prefix="" post="" sort="0" go="0" option="" fh="90" ft="Arial" fdc="000000FF" fs="b" fc="00FFFFFF" fa="right">88,888</rundenzeit>
<!-- Fester Text -->
<text xpos="900" ypos="140" fh="30" ft="Arial" fs="b" fc="00C0C0C0" text="RUNDEN"></text>
<!-- Fläche in Spurfarbe je Zeile (wandert mit dem Fahrer) -->
<box x1="10" y1="200" x2="30" y2="300" nr="1" sort="0" w="1" c="slotcolorbg" dc="00808080"/>
<!-- Bilder -->
<bildfahrer x1="150" y1="200" x2="250" y2="300" nr="1" sort="0"/>
<bildfahrzeug x1="650" y1="200" x2="850" y2="300" nr="1" sort="0"/>
<!-- Tankbalken: lc Rahmen, nc normal, tc Reserve, opt1c Hintergrund/Wartezeit -->
<tankbar nr="1" x1="1600" y1="200" x2="1700" y2="240" lc="00FFFFFF" nc="0000FF00" tc="000000FF" tbtyp="h" sort="0" option="" opt1c="00404040"/>
<!-- Strafbalken mit zwei Textzeilen -->
<progressbar x1="1600" y1="250" x2="1850" y2="300" nr="1" sort="0" lc="00FFFFFF" nc="000000FF" tc="000080FF" option="" tbtyp="h" typ="strafe2" opt1c="00FFFFFF"/>
<!-- Rennzeit-Balken (füllt sich mit der abgelaufenen Zeit), lc="0" = ohne Rahmen -->
<progressbar x1="0" y1="950" x2="1904" y2="960" nr="0" sort="0" lc="0" nc="00FFFFFF" tc="00FFFFFF" option="" tbtyp="h" typ="rennzeit" opt1c="00FFFFFF"/>
<!-- Symbol: Box (Einfahrt 32 / Ausfahrt 33) -->
<symbole_einaus left="1600" top="160" breite="90" hoehe="36" symbolname="symbol-box.png" nr="1" sort="0" audioid_ein="32" audioid_aus="33" transcolor="0" symboladdonname=""/>
```
Weitere Grafik: `<linie x1 y1 x2 y2 w c m="n" e="1"/>`, `<rechteck …/>` (Rahmen), `<roundbox …/>`.
Feste Flächen, Linien und Beschriftungen besser **ins Hintergrundbild malen**. Beschriftungen, die der Kunde später ändern
möchte, als `<text>` in die XML.

### Attribute der Textvariablen
| Attribut | Bedeutung |
|---|---|
| `nr` | `1…n` = Zeile (bei `sort="0"`) bzw. Platz (bei `sort="1"`), `0` = globaler Wert, `-3` = aktueller Fahrer bei Quali auf einer Spur |
| `sort` | `0` = `nr` ist eine Zeile, `1` = `nr` ist ein Platz der Rangliste (nur für zusätzliche Ranglisten, z. B. „Führt“) |
| `nks` | Nachkommastellen (Zeiten `3`, Abstand `2`, Rennzeit `0` → `99:99`) |
| `mst` | Messstelle: Sektor 1–3, Zwischenzeit 1–8, Topspeed-Messpunkt; bei `histrundenzeit` Runden zurück (`1` = letzte, `2–5` = davor) |
| `prefix` / `post` | Text davor/danach, z. B. `prefix="Spur "`, `post=" %"`. Der Platzhalter enthält beides mit (`Spur 9`, `100 %`) |
| `fc` / `fcn` | Schriftfarbe / Farbe für den besten Wert aller Fahrer |
| `fdc` | ohne Wirkung, immer `000000FF` |
| `option` | `ms` = m/s statt km/h; bei `histrundenzeit` `Z#` |
| `invers` | nur `rennzeit`: `t`/`q`/`r` = in Training/Quali/Rennen aufwärts zählen |

### Anordnung: frei, mit ein paar Faustwerten
Die Anordnung entwickelst du **mit dem Kunden** aus seinen Daten und Wünschen. Möglich sind z. B. Tabelle (Zeile je Fahrer),
Spalten (Spalte je Fahrer), Karten/Kacheln, Anzeigetafel, Armaturenbrett. Kein festes Schema übernehmen.

Was fast jeder Screen braucht, frei platziert:
- **Rennzustand:** `rennmodus`, `rennzeit` (bzw. Restzeit), `restrunden` (`nr="1" sort="1"`), `status` (Platzhalter lang genug,
  z. B. `Status: Rennen läuft - Fahrer 99 fährt in die Box ein`), optional `rennbahn`, Rennzeit-Balken.
- **Je Fahrer** die gewählten Werte aus Schritt 3, gruppiert nach Wichtigkeit: ein Hauptwert groß (meist letzte Runde oder
  Runden), Platz und Name gut sichtbar, Nebenwerte kleiner.
- **Spurfarbe** je Fahrer als Fläche/Streifen/Rahmen (`box` mit `slotcolorbg`), damit jeder seine Zeile sofort findet.
- Optional der Führende über `sort="1" nr="1"`.

Faustwerte für 1904 × 960:
- Für die Fahrerbereiche bleiben nach Kopf- und Fußbereich etwa **700–750 px Höhe**. Bei einer Tabelle ist die
  Zeilenhöhe ≈ 720 ÷ Fahrer (6 Fahrer: 120 px).
- Fahrerbild etwa quadratisch, Fahrzeugbild etwa 2 : 1.
- Tankbalken ab ca. 100×36 px, Strafbalken `strafe2` ab ca. 236×50 px.

**Schriftgrößen** (sichtbare Größe = Geviert in px, daraus `fh` = Größe ÷ 0,787 bzw. ÷ 0,753):
- Der wichtigste Wert je Fahrer etwa **0,5–0,6 × Höhe des Fahrerbereichs**, Nebenwerte deutlich kleiner.
- **Nie unter 22 px sichtbar** (Lesbarkeit aus 2–3 m Abstand). Passt es nicht, Werte weglassen und dem Kunden sagen.
- Die **Breite** begrenzt die Schrift oft stärker als die Höhe: Alle Platzhalter einer Zeile müssen nebeneinander passen.

**Technische Hinweise je Fahreranzahl:**
- **Viele Fahrer (7–8):** wenig Höhe je Fahrer, also wenige Werte oder kleinere Bilder.
- **Wenige Fahrer (2–3):** viel Höhe, aber begrenzte Breite. Werte auf mehrere Zeilen oder in Spalten verteilen,
  sonst bleibt die Schrift trotz Platz klein.
- **1 Fahrer:** alle Werte `nr="1"`, bei **Quali auf einer Spur** `nr="-3"` und `positionimquali`.
  Passende Werte z. B. `diffschnellsterunde`, `diffbahnrekord`, `histrundenzeit` (`mst` 1–5), Bahnrekord mit Halter.
- **Eine Spalte je Fahrer:** gleiche Regeln wie Zeilen (`sort="0"`, `nr` = Spalte).

### Training/Quali technisch
`sorttraining="1"` sortiert nach schnellster Runde. Sinnvolle Werte statt Abstand: `diffschnellsterunde` (Rückstand auf die
Bestzeit), ggf. `tankVerbrauchProRunde` (`nks="1"`, `post=" %"`), Bahnrekord.

### Serienrennen technisch
Werte: `crpositiongesamt`, `crrundenzahlgesamt`, `cranzahlrennengefahren`, `cranzahlrennengesamt`.
Die Zwischenstand-Anzeige ist ein eigenes Popup, das Cockpit aus `Cp Defaults` nimmt (nicht nachbauen).

---

## Teil D: Variablen (vollständige Liste)

### Quellen
- **Cockpit-XP-Wiki, RBS-Variablen** (verbindliche Liste, was erlaubt ist):
  https://wiki.cockpit-xp.de/dokuwiki/doku.php?id=cockpit-xp:rennbildschirm:rbs-variablen
  Dazu die Seite zu Auflösungen: https://wiki.cockpit-xp.de/dokuwiki/doku.php?id=cockpit-xp:rennbildschirm:rbs-aufloesungen
- **Hilfe des RBS-Editors auf dem PC des Kunden** (exakte Namen und Erklärungen, nur lesen):
  `C:\Program Files (x86)\Cockpit-XP\CockpitVariablenHilfe.xml`
- **Schreibweise eines Elements unklar** (z. B. bei selten genutzten Variablen): Den Kunden bitten, das Element im RBS-Editor
  einmal in einen Test-Screen einzufügen und zu speichern, dann die XML ansehen.

Die Liste unten entspricht dem Wiki (Stand 11/2026). Wenn Wiki oder Editor-Hilfe eine Variable kennen, die hier fehlt, darf
sie genutzt werden (außer den Ausschlüssen in Teil B, Regel 15). **Schreibweise genau übernehmen**, Groß-/Kleinschreibung
zählt (z. B. `tankStopps`, `tankmVolt`; das Wiki schreibt manche Tank-Variablen klein, die XML nutzt die Großbuchstaben).

### Fahrer, Fahrzeug, Rennbahn
| Variable | Anzeige |
|---|---|
| `fahrer` | Fahrername |
| `fahrerln` | voller Fahrername |
| `fahrersn` | Kurzbezeichnung (3 Buchstaben) |
| `fahrzeug` / `fahrzeugln` | Fahrzeugname / vollständiger Fahrzeugname |
| `rennbahn` / `rennbahnln` | Name der Rennbahn (kurz/lang) |
| `sicherheitsrundenzeit` | Sicherheitsrundenzeit der Bahn |

### Allgemein (meist `nr="0"`)
| Variable | Anzeige |
|---|---|
| `rennmodus` | Modus mit Details, z. B. „Rennen: 5 Runden / 2 Min.“ |
| `rennmodusbase` | nur Training/Quali/Rennen |
| `status` | Statusmeldungen (z. B. Pause). Im laufenden Rennen oft leer |
| `rennzeit` | Rennzeit; bei Rennen auf Zeit rückwärts (Restzeit), mit `invers` aufwärts; `nks="2"` → `01:48.81` |
| `sollrennzeit` / `sollrennrunden` | eingestellte Renndauer / Rundenzahl |
| `restrunden` | noch zu fahrende Runden. **Fahrerwert:** für den Führenden `nr="1" sort="1"` |
| `datum` | `nr="0"` Datum, `nr="1"` mit Uhrzeit |
| `autoclose` | nur in Popups (Sieger/Stand): schließt nach `nr` Sekunden. Nicht auf Rennbildschirmen |

### Renndaten
| Variable | Anzeige |
|---|---|
| `position` | Platz |
| `positionimquali` | Platz in der Quali auf einer Spur |
| `slot` | Spur bzw. Regler-ID |
| `runde` | gefahrene Runden (vor der ersten Runde leer) |
| `rundenzeit` | letzte Rundenzeit (vor der ersten Runde `0,000`) |
| `rundenzeitlauf` | laufende Rundenzeit, sobald die Sicherheitsrundenzeit erreicht ist |
| `schnellsterunde` | eigene schnellste Runde |
| `schnellsterunderd` | in welcher Runde die schnellste gefahren wurde |
| `histrundenzeit` | frühere Rundenzeiten (max. 20), `mst` = Runden zurück (`1` = letzte, `2–5` = davor); `option`: `Z#` Zeit, `R#` Rundennummer, `S` davor = aufsteigend sortiert |
| `durchschnrundenzeit` | durchschnittliche Rundenzeit |
| `fahrzeit` | addierte Fahrzeit (nur bei Start/Ziel aktualisiert) |
| `gefahrenestrecke` | gefahrene Strecke in km |

### Abstände
| Variable | Anzeige |
|---|---|
| `abstand` | Abstand zum Führenden (`+ 30,3` oder `+ 2 R`, beim Führenden leer) |
| `abstandvordermann` | Abstand zum Vordermann |
| `abstandrd` / `abstandrdvordermann` | Abstand in Runden (Führender / Vordermann) |
| `abstandzeit` / `abstandzeitvordermann` | Abstand als Zeit (Führender / Vordermann) |

### Differenzen
| Variable | Anzeige |
|---|---|
| `diffletzterunde` | Differenz zur Vorrunde (`fc` = langsamer, `fcn` = schneller) |
| `diffschnellsterunde` | Differenz zur schnellsten Runde (Rückstand auf die Bestzeit) |
| `diffschnellsterunde2` | eigene schnellste Runde gegen die schnellste aller Fahrer |
| `diffrundenrekord` | Differenz zum Rundenrekord |
| `diffbahnrekord` | Differenz zum Bahnrekord |
| `diffdurchschnrundenzeit` | Differenz zur durchschnittlichen Rundenzeit |

### Geschwindigkeit
| Variable | Anzeige |
|---|---|
| `topspeed` | Topspeed, `mst` = Messstelle, `option="ms"` für m/s |
| `schnellstetopspeed` | höchster eigener Topspeed |
| `topspeedrekord` / `topspeedrekordfahrer` | bester Topspeed auf der Bahn / sein Fahrer (je Messstelle) |
| `durchv` | Durchschnittsgeschwindigkeit der letzten Runde |
| `durchvsum` | Durchschnittsgeschwindigkeit über alle Runden |

### Rekorde
| Variable | Anzeige |
|---|---|
| `bahnrekord`, `bahnrekordfahrer`, `bahnrekordfahrzeug`, `bahnrekordslot`, `bahnrekorddatum` | Bahnrekord: Zeit, Fahrer, Fahrzeug, Spur, Datum |
| `rundenrekord`, `rundenrekorddatum` | Rundenrekord und Datum |
| `rundenrekordfz`, `rundenrekordfzdatum` | eigene schnellste Runde mit diesem Fahrzeug (spurunabhängig) und Datum |
| `fahrzeugrekordabsolut`, `fahrzeugrekordabsolutfahrer` | schnellste Runde, die je mit diesem Fahrzeug gefahren wurde, und ihr Fahrer |
| `slotrekord`, `slotrekordfahrer`, `slotrekordfahrzeug`, `slotrekorddatum` | Spurrekord: Zeit, Fahrer, Fahrzeug, Datum |
| `persslotrekord`, `persslotrekordfz` | persönlicher Spurrekord des Fahrers und Fahrzeug dazu |
| `sektorrekord`, `sektorrekordfahrer` | Sektorrekord und Halter |

### Sektoren und Zwischenzeiten (alle mit `mst`)
| Variable | Anzeige |
|---|---|
| `sektorzeit` | Sektorzeit, `mst` = Sektor |
| `bestzeitsektor` | beste Sektorzeit |
| `bestzeitsektorsum` | Summe der besten Sektoren = optimale Runde |
| `bestzeitsektorfahrer` | Fahrer mit der Sektorbestzeit |
| `bestzeitsektorrd` | Runde der Sektorbestzeit |
| `bestzeitsektoraktuellerfahrer` | beste Sektorzeit des aktuellen Fahrers |
| `durchschnsektorzeit` | durchschnittliche Sektorzeit |
| `zwischenzeit` | Zwischenzeit, `mst` = Messpunkt 1–8 |

### Strafen
| Variable | Anzeige |
|---|---|
| `zeitstrafe` | Zeitstrafe |
| `boxenstrafe` | Boxenstrafe |
| `strafpunktefahrer` | Strafpunkte |

### Tanksimulation
| Variable | Anzeige |
|---|---|
| `tankinhalt` | Tankinhalt in % ohne Nachkommastellen |
| `tank1000` | Tankinhalt in % mit Nachkommastellen (`nks`) |
| `tankmVolt` | Spannung nach dem Tanken |
| `tankZeit` | Tankzeit |
| `tankVerbrauchProRunde` | Verbrauch pro Runde in % (`nks="1"` → „2,5“) |
| `tankStopps` | Anzahl Boxenstopps im Rennen |

### Balken (Element mit `x1 y1 x2 y2`, `lc` Rahmen (`0` = ohne), `nc` normal, `tc` Reserve/Strafe Typ 2, `opt1c`, `tbtyp` `h`/`v`)
| Element | Anzeige |
|---|---|
| `tankbar` | Tankbalken (`opt1c` = Farbe der Wartezeit vor dem Tanken) |
| `progressbar typ="strafe"` | Strafbalken |
| `progressbar typ="strafe2"` | Strafbalken mit zwei Textzeilen (`opt1c` = Textfarbe), ohne Strafe unsichtbar |
| `progressbar typ="rennzeit"` | füllt sich mit der abgelaufenen Rennzeit |

### Bilder (Element mit `x1 y1 x2 y2 nr sort`)
| Element | Anzeige |
|---|---|
| `bildfahrer` | Fahrerbild (ohne Bild zeigt Cockpit einen Platzhalter) |
| `bildfahrzeug` | Fahrzeugbild (ohne Bild leer) |
| `bildnation` | Landesflagge (mitgelieferte Flaggen 40×30, starkes Vergrößern sieht unscharf aus) |
| `bildrennbahn` | Bild der Rennbahn |
| `bildbahnrekordfahrer` / `bildbahnrekordfahrzeug` | Bild von Fahrer/Fahrzeug des Bahnrekords |
| `bildslotrekordfahrer` / `bildslotrekordfahrzeug` | Bild von Fahrer/Fahrzeug des Spurrekords |

### Serien-/Clubrennen
| Variable | Anzeige |
|---|---|
| `crpositiongesamt` | Platz in der Gesamtwertung |
| `crrundenzahlgesamt` | Rundenzahl gesamt |
| `crnextfahrer` | nächster Fahrer |
| `cranzahlrennengesamt` / `cranzahlrennengefahren` / `cranzahlrennenoffen` | Anzahl der Rennen gesamt / gefahren / offen |
| `craktuellesrennen` | aktuelles Rennen der Serie |
| `srgruppennr` | aktive Gruppennummer |
| `srgruppeneinzelrennennr` | Nummer des Einzelrennens in der Gruppe |
| `teamname` | Teamname (nur im Teamrennen) |

### Nur mit Carrera CU30352
| Variable | Anzeige |
|---|---|
| `cugeschwwert` | aktueller Geschwindigkeitswert des Fahrzeugs in der CU |
| `cubremswert` | aktueller Bremswert des Fahrzeugs in der CU |

### Datagrid (Tabelle, die Werte über die Runden sammelt, lässt sich maximieren und exportieren)
```xml
<!-- je Slot: zuerst die Position, beim letzten Grid zusätzlich die Position des Maximieren-Buttons -->
<datagrid nr="1" x1="12" y1="293" x2="395" y2="444">Slot 1</datagrid>
<datagrid nr="1" variable="rundenzeit" len="60">Rundenz.</datagrid>
<datagrid nr="1" variable="sektorzeit" len="60" mst="1">Sektor-1</datagrid>
<datagrid nr="2" x1="400" y1="293" x2="782" y2="444" btnx="360" btny="16">Slot 2</datagrid>
```
`nr` = Slot, `variable` = gesammelte Größe, `len` = Spaltenbreite, Inhalt = Spaltenüberschrift.

### Sonstige
| Element | Anzeige |
|---|---|
| `symbole_einaus` | Bild, das bei einem Ereignis erscheint und bei einem anderen verschwindet (siehe unten) |
| `webbrowser` | blendet eine Webseite ein (z. B. Webcam-Livestream). Attribute: `left`, `top`, `breite`, `hoehe`, `httplink`, `hidescrollbars`, `scrollx`, `scrolly`. Selten genutzt, Schreibweise vorher im RBS-Editor prüfen |

### Nicht verwenden
- **AddOn:** `addonvariable`, `addonbar`, `bildueberaddon` (gehen nur mit dem jeweiligen Addon).
- **Urkunden/Standanzeigen:** `crdurchgang`, `crrenntag`, `crplatz`, `crpunkte`, `crfahrer`, `crname`.
- **Nicht im Wiki, veraltet:** `vrennenrzsum`, `restrennzeit`, `bildfahrerschnellsterunde`.

**Ereignisse für `symbole_einaus`** (`audioid_ein` / `audioid_aus`, `nr` = Zeile außer bei globalen):
| Symbol | ein / aus | `nr` |
|---|---|---|
| In der Boxengasse | 32 / 33 | Zeile |
| Tank auf Reserve | 28 / 86 | Zeile |
| Tank leer | 29 / 30 | Zeile |
| Boxenstrafe | 34 / 35 | Zeile |
| Zeitstrafe | 38 / 85 | Zeile |
| Rundenstrafe | 39 / 84 | Zeile |
| Motorschaden (nur Schadens-Addon) | 73 / 74 | Zeile |
| Bremsschaden (nur Schadens-Addon) | 75 / 76 | Zeile |
| Pause / Safety-Car | 58 / 59 | 0 |
| Letzte Runde | 8 / 60 | 0 |

Ein Symbol ohne Aus-Ereignis (`audioid_aus="0"`) bleibt dauerhaft stehen. PNG mit Transparenz funktioniert.
Symbolbilder erzeugst du selbst (Teil F) und legst sie in den Screen-Ordner.

**Ohne Messwert** zeigt eine Variable ihren Grundwert (z. B. `0,000`), vor der ersten Runde zeigt `rundenzeit` `0,000`,
`runde`, `schnellsterunde`, `abstand` bleiben leer. Felder für Messtechnik, die der Kunde nicht hat, weglassen.

---

## Teil E: Design

**Das Design ist frei und gehört dem Kunden.** Entwickle es jedes Mal neu aus seinen Wünschen: Farben, Logo, Verein,
Stimmung, Vorbilder. Es gibt **keine Vorlage und keinen Hausstil**, den du übernimmst.

**Nicht verwenden:**
- das Design der mitgelieferten Cockpit-XP-Rennbildschirme (Ordner `Cp-…`, `Cp-V4-…`, `CockpitV4`) als Vorlage. Diese Screens
  **nicht öffnen, nicht kopieren, nicht nachbauen**, auch nicht Farben oder Anordnung daraus übernehmen,
- Logos und Markenzeichen von Cockpit-XP oder anderen Herstellern/Rennserien. Nur Logos, die der Kunde selbst liefert,
- fremde Screens aus dem Internet oder von anderen Anwendern als Kopiervorlage (als Anregung beschreiben lassen ist in Ordnung),
- Fotos oder Grafiken ohne Nutzungsrecht. Für Fotohintergründe eigene Bilder des Kunden oder lizenzfreie Bilder verwenden.

**Was Lesbarkeit sichert (gilt für jedes Design):**
- Große Schrift, guter Kontrast (Text zu Hintergrund mindestens 4,5 : 1), ruhige Flächen hinter Zahlen.
  Lieber wenige Werte groß als viele klein.
- Keine dünnen oder stark kursiven Schriften für Zahlen. Kein Text direkt auf unruhigem Foto, eine Fläche dahinter legen.
- Beschriftungen in der Sprache des Kunden (Standard Deutsch).
- Text in einer festen, lesbaren Farbe. `slotcolor` als Textfarbe nur, wenn die Spurfarben auf dem Hintergrund sicher lesbar sind.
- Bestzeit (`fcn` bei `rundenzeit`/`schnellsterunde`) in einer klar abweichenden Farbe; bei `diffletzterunde` ist
  `fcn` = schneller und `fc` = langsamer.

**Vorgehen, wenn der Kunde unsicher ist:** Zwei bis drei kleine Skizzenbilder (z. B. 950×480) mit Beispielwerten erzeugen,
die sich deutlich unterscheiden (z. B. hell/dunkel, Tabelle/Spalten, ruhig/sportlich), und aus seinen Anhaltspunkten
ableiten. Er wählt aus oder mischt, dann wird gebaut.

---

## Teil F: Bauen

### 1. Werkzeug prüfen
Prüfe, ob **Python 3 mit Pillow** vorhanden ist (`python -c "import PIL"`). Wenn nicht: dem Kunden anbieten, es zu installieren
(`winget install Python.Python.3.12`, danach `python -m pip install pillow`) und **erst nach seinem OK** installieren.
Will er nichts installieren, baue das Hintergrundbild mit PowerShell und `System.Drawing` (auf jedem Windows vorhanden)
und berechne Breiten mit `Graphics.MeasureString` in derselben Größe (0,787 × fh bzw. 0,753 × fh).

### 2. Ein Generator-Skript für alles
Schreibe **ein** Python-Skript `erzeuge_rennbildschirm.py` in den Zielordner. Es erzeugt aus **denselben Koordinaten**
Hintergrundbild, `Rennen.xml`, `version.xml`, Symbole und `vorschau.jpg`. So passen Bild und Werte immer zusammen,
und Änderungswünsche sind schnell umgesetzt. Ausführen mit `python -I erzeuge_rennbildschirm.py`.

Baustein, der die Schriftregeln aus Teil B schon richtig rechnet (übernehmen und erweitern):

```python
import os, struct
from PIL import Image, ImageDraw, ImageFont

W, H = 1904, 960
FONTS = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
DATEI = {"Bahnschrift": "bahnschrift.ttf", "Impact": "impact.ttf"}
K = {"Bahnschrift": 0.787, "Impact": 0.753}          # Cockpit zeichnet Geviert = K * fh

def tc(hexfarbe):                                     # "#RRGGBB" -> "00BBGGRR"
    h = hexfarbe.lstrip("#"); return "00" + h[4:6].upper() + h[2:4].upper() + h[0:2].upper()

def _ascent(pfad):                                    # usWinAscent / unitsPerEm (Grundlinie unter ypos)
    b = open(pfad, "rb").read(); t = {}
    for i in range(struct.unpack(">H", b[4:6])[0]):
        tag, _, off, _ = struct.unpack(">4sIII", b[12 + 16*i:28 + 16*i]); t[tag] = off
    upm = struct.unpack(">H", b[t[b"head"]+18:t[b"head"]+20])[0]
    return struct.unpack(">H", b[t[b"OS/2"]+74:t[b"OS/2"]+76])[0] / upm
ASC = {ft: _ascent(os.path.join(FONTS, f)) for ft, f in DATEI.items()}

def font(ft, fs, fh):
    f = ImageFont.truetype(os.path.join(FONTS, DATEI[ft]), max(1, round(fh * K[ft])))
    if ft == "Bahnschrift" and fs == "b":
        try: f.set_variation_by_name("Bold")
        except Exception: pass                        # Breite stimmt auch ohne Fettschnitt fast
    return f

class Screen:
    def __init__(self, grund):
        self.bg = Image.new("RGB", (W, H), grund); self.d = ImageDraw.Draw(self.bg)
        self.texte, self.grafik, self.variablen, self.vorschau = [], [], [], []

    def _pos(self, s, x, ym, gr, ft, fs, fa):
        fh = round(gr / K[ft]); f = font(ft, fs, fh)
        w = f.getlength(s); xpos = {"left": x, "center": x - w/2, "right": x - w}[fa]
        oben = f.getbbox("H", anchor="ls")[1]          # negativ: Höhe der Großbuchstaben
        ypos = round(ym - (ASC[ft] * f.size + oben / 2))
        return round(xpos), ypos, fh, f

    def var(self, tag, x, ym, nr, ph, gr, fc, fa="left", ft="Bahnschrift", fs="b",
            nks=0, mst=1, prefix="", post="", fcn=None, sort=0, option=""):
        """x = linke Kante/Mitte/rechte Kante je nach fa, ym = Mitte der Großbuchstaben, gr = sichtbare Größe in px."""
        xpos, ypos, fh, f = self._pos(ph, x, ym, gr, ft, fs, fa)
        self.variablen.append(
            f'<{tag} xpos="{xpos}" ypos="{ypos}" nr="{nr}" nks="{nks}" mst="{mst}" len="0" fcn="{tc(fcn or fc)}" '
            f'prefix="{prefix}" post="{post}" sort="{sort}" go="0" option="{option}" fh="{fh}" ft="{ft}" '
            f'fdc="000000FF" fs="{fs}" fc="{tc(fc)}" fa="{fa}">{ph}</{tag}>')
        self.vorschau.append((xpos, ypos, ph, f, fc, ft, fh))

    def label(self, x, ym, s, gr, fc, fa="left", ft="Bahnschrift", fs="b"):
        xpos, ypos, fh, f = self._pos(s, x, ym, gr, ft, fs, fa)
        self.texte.append(f'<text xpos="{xpos}" ypos="{ypos}" fh="{fh}" ft="{ft}" fs="{fs}" fc="{tc(fc)}" text="{s}"></text>')
        self.vorschau.append((xpos, ypos, s, f, fc, ft, fh))

    def element(self, liste, tag, **a):               # Bilder, Balken, Symbole, box
        getattr(self, liste).append("<%s %s/>" % (tag, " ".join(f'{k}="{v}"' for k, v in a.items())))

    def speichern(self, ordner, bildname, slots, bcolor, sorttraining=0):
        self.bg.save(os.path.join(ordner, bildname), quality=95)
        z = ['<?xml version="1.0" encoding="iso-8859-1"?>', "<RennScreen>", "\t<base>",
             f'\t\t<dim xmax="{W}" ymax="{H}" bcolor="{tc(bcolor)}" bimage="{bildname}" fahrerposfix="-1" '
             f'slots="{slots}" sorttraining="{sorttraining}" fontsizefaktor="100">Bildschirm Dimension+Background</dim>',
             '\t\t<defaults ft="Bahnschrift">Schriftart-Defaults Hier nur Fonttyp(Muss)</defaults>', "\t</base>"]
        for name, liste in (("texte", self.texte), ("grafik", self.grafik), ("variablen", self.variablen)):
            z += [f"\t<{name}>"] + ["\t\t" + e for e in liste] + [f"\t</{name}>"]
        z.append("</RennScreen>")
        with open(os.path.join(ordner, "Rennen.xml"), "w", encoding="iso-8859-1", newline="\r\n") as fp:
            fp.write("\n".join(z) + "\n")
        # Vorschau: Platzhalter so zeichnen, wie Cockpit es tut (Grundlinie = ypos + Ascent * Größe)
        v = self.bg.copy(); d = ImageDraw.Draw(v)
        for xpos, ypos, s, f, fc, ft, fh in self.vorschau:
            d.text((xpos, ypos + ASC[ft] * f.size), s, font=f, fill=fc, anchor="ls")
        v.save(os.path.join(ordner, "vorschau.jpg"), quality=90)
```
Ergänzen:
- **Hintergrund:** Flächen, Linien, Logo mit `self.d` bzw. `self.bg.paste(logo, (x, y), logo)` malen.
- **Vorschau:** Bildfelder (`bildfahrer`, `bildfahrzeug`) als graue Rahmen mit „Fahrer“/„Auto“, Spurstreifen in Beispielfarben,
  Tank- und Strafbalken mit Beispielfüllung in die Vorschau zeichnen (nur in `vorschau.jpg`, nicht ins Hintergrundbild).
- **`version.xml`** (ISO-8859-1, CRLF):
  ```xml
  <?xml version="1.0" encoding="iso-8859-1"?>
  <info>
    <version>1.0</version>
    <entwickler>NAME DES KUNDEN</entwickler>
    <build>1</build>
    <aktivieren>0</aktivieren>
  </info>
  ```
- **Symbole** (z. B. `symbol-box.png`): kleines PNG mit Transparenz im Stil des Screens (Form, Farbe und Schrift frei),
  Inhalt z. B. „BOX“, „MOTOR“, „BREMSE“ oder ein eigenes Piktogramm.
- **Umlaute** in `<text>` und Platzhaltern sind erlaubt (die Datei wird in ISO-8859-1 geschrieben). Zeichen außerhalb
  von ISO-8859-1 (z. B. „–“, „·“ geht, „→“ nicht) vermeiden.

### 3. Startampel und Popups
Vorlage ist `C:\ProgramData\Cockpit-V2\RennBildschirm\Cp Defaults\` (bei abweichender Installation den Ordner
`RennBildschirm` suchen). In `Cp Defaults` **nie etwas verändern**, nur lesen bzw. daraus kopieren.
**Sieger-, Podium- und Standanzeige nie kopieren.** Ohne eigene Datei nimmt Cockpit automatisch die aus `Cp Defaults`.

#### 3a. Standard-Ampel (Wahl 1)
**Nichts tun, nichts kopieren.** Liegt im Screen-Ordner keine `Startampel.xml`/`.CCu`, lädt Cockpit die aus `Cp Defaults`.
Nur prüfen, dass das Ampelfenster dort (`framepos w`/`h`) kleiner als `xmax`/`ymax` ist, und dem Kunden sagen,
dass die Standard-Ampel verwendet wird.

#### 3b. Eigene Ampel (Wahl 2)
1. **Kopieren:** `Startampel.xml` **und** `Startampel.xml.CCu` in den Screen-Ordner (Cockpit lädt mit CU30352 nur die `.CCu`,
   fehlt sie, nimmt es die aus `Cp Defaults`. Deshalb immer beide). Außerdem alle Bilder, die darin genannt sind
   (`loadpic red=… yellow=… green=… off=…` und `framepos … bimage=…`).
2. **Aufbau verstehen:** Die Datei ist ein Ablaufskript. In `<init><one>` lädt `loadpic` die vier Lampenbilder
   (rot/gelb/grün/aus, **nur `.jpg`**). Je Modus (`<training>`, `<quali>`, `<rennen>`) legt `<one>` mit `framepos`
   (Fenster, `x="auto" y="auto"` = zentriert, `bimage` = Träger) und `ampelpos nr="1…5" x y w h` (Lampen relativ zum Fenster)
   das Aussehen fest. Danach folgen die Abläufe (`start`, `pause`, `fruehstart` … mit `ampel`, `wait`, `rennstatus`, `sound`).
   `fruehstarter xpos ypos fh fc ft prefix` ist der Text für den Frühstarter (Farbe `00BBGGRR`).
3. **Umgestalten:** Neue Bilder im Generator-Skript erzeugen (Träger in Fenstergröße, z. B. 760×470; je Lampe ein Bild, das
   den **ganzen Lampenkasten** im jeweiligen Zustand zeigt, weil ein Bild für alle 5 Lampen gilt). **Eigene Dateinamen** vergeben
   (z. B. `<Screen>-Ampel-rot_116x300.jpg`) und in **beiden** Dateien `loadpic`, `framepos` (in allen drei Modi) und
   `ampelpos` (in allen drei Modi) anpassen. Frühstart-Text (`fruehstarter`) an Farbe und Schrift des Screens anpassen.
   Danach nicht mehr gebrauchte, mitkopierte Bilder aus dem Screen-Ordner löschen.
4. **Ablauf nicht ändern:** `ampel`, `wait`, `rennstatus`, `sound`, `audio`, `custartampel`, `bbstartknopfsimulation` und die
   Reihenfolge der Befehle bleiben, wie sie sind. Die `.CCu` synchronisiert sich mit der Ampel der CU, dort besonders vorsichtig sein.
5. **Größe:** Das Fenster muss kleiner als `xmax`/`ymax` sein und sollte auch auf kleineren Screens passen (z. B. höchstens 760×470).
6. **Vorschau:** Eine `vorschau-ampel.jpg` mit den vier Zuständen nebeneinander erzeugen und ansehen. Sie darf im Ordner bleiben.
7. Beide Dateien in **ISO-8859-1 mit CRLF** speichern (Kommentare darin enthalten Umlaute) und auf Wohlgeformtheit prüfen.

---

## Teil G: Selbst prüfen, bevor der Kunde testet

1. `vorschau.jpg` **ansehen** (Bild öffnen). Prüfen:
   - nichts überlappt, keine Werte über Bildfeldern oder Balken,
   - rechtsbündige Zahlen enden an derselben Kante wie ihr Spaltenkopf,
   - Platzhalter passen in ihre Spalte (die Platzhalterbreite ist die echte Feldbreite!),
   - keine Fläche im Hintergrundbild unter `bildfahrer`/`bildfahrzeug`,
   - Symbole nicht unter einem `progressbar`,
   - Schrift nirgends kleiner als 22 px sichtbar, Kontrast ausreichend.
2. XML prüfen: wohlgeformt (z. B. mit Python `xml.etree.ElementTree.parse`), ISO-8859-1, CRLF, jede Variable aus Teil D,
   alle `nr` 1…n vorhanden, alle Zeilen `sort="0"`, `slots` = Fahreranzahl, Bildname in `bimage` existiert.
3. Alle in der XML genannten Dateien (`bimage`, `symbolname`, bei eigener Ampel deren Bilder) liegen im Ordner.
   Bei Standard-Ampel liegt **keine** `Startampel.xml`/`.CCu` im Ordner.
4. Mängel selbst beheben und neu erzeugen. Erst dann übergeben.

---

## Teil H: Übergabe an den Kunden

Zeige die `vorschau.jpg` und erkläre kurz:
1. Cockpit starten → **Bildschirmauswahl** → den neuen Screen wählen.
2. **Nach jeder Änderung den Screen neu auswählen oder Cockpit neu starten**, sonst bleibt die alte Version im Speicher.
3. Ohne Bahn testen: mit der **Tastensimulation** von Cockpit (F2 zeigt die Tasten) ein Rennen durchspielen.
4. Bitte achten auf: abgeschnittene Namen/Zeiten, passt der Bildschirm über die Taskleiste, Startampel, Strafbalken, Symbole.
   Bei eigener Ampel: Training, Quali und Rennen je einmal starten, einen Frühstart auslösen und, falls vorhanden,
   mit der CU30352 testen (dann gilt die `.CCu`).
5. In der Bildschirmauswahl lässt sich einstellen, ob die Zeilen **nach Platz** wechseln oder **fest nach Spur** stehen.
6. Feinheiten kann der Kunde im **RBS-Editor** von Cockpit selbst verschieben. Achtung: Wird danach das Skript erneut
   ausgeführt, sind diese Änderungen weg. Vorher fragen.
7. Bitte um einen **Screenshot aus dem laufenden Rennen**, falls etwas nicht passt. Daran Positionen und Größen korrigieren.

---

<!--
Für Menschen: Installation in Claude Code
  Quelle: https://github.com/mikesmartxp/cockpit-xp
  Datei speichern als  %USERPROFILE%\.claude\skills\rennbildschirm-designer\SKILL.md
  Danach in Claude Code z. B. schreiben: "Bau mir einen Rennbildschirm" oder /rennbildschirm-designer
-->
