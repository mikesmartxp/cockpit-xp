# Cockpit-XP: Werkzeuge für eigene Rennbildschirme

Dieses Repository enthält zwei Hilfen für [Cockpit-XP](https://www.cockpit-xp.de), die Software für Slotcar-Rennen:

| Ordner | Inhalt | Für wen |
|---|---|---|
| [`skills/rennbildschirm-designer`](skills/rennbildschirm-designer/SKILL.md) | KI-Skill (Claude Code, Codex, VS Code mit KI), der klassische Rennbildschirme (`Rennen.xml` + Hintergrundbild) im Gespräch entwirft und baut | Anwender ohne Programmierkenntnisse |
| [`api`](api/README.md) | `cockpit-api.js`: kleine JavaScript-Bibliothek für eigene Rennbildschirme als Webseite über den Webserver von Cockpit-XP | Anwender, die HTML/JavaScript schreiben |

## 1. Skill „Rennbildschirm-Designer“

Eine Anleitung für einen KI-Assistenten, der auf deinem PC arbeiten darf, z. B. [Claude Code](https://claude.com/claude-code),
Codex von OpenAI oder Visual Studio Code mit KI-Erweiterung (z. B. GitHub Copilot im Agent-Modus). Die KI fragt Schritt für Schritt:

1. Digitale oder analoge Bahn?
2. Wie viele Fahrer (1–8)?
3. Welche Daten (Rundenzeiten, Abstände, Zwischenzeiten, Tank, Strafen, Rekorde …)?
4. Wie soll es aussehen (Farben, Logo, Stil)? Und: Standard-Startampel von Cockpit oder eine eigene?
5. In welchen Ordner soll der Bildschirm?

Danach baut die KI den kompletten Ordner (Hintergrundbild, `Rennen.xml`, Vorschau), prüft ihn und erklärt den Test in Cockpit.
Das Design ist frei und richtet sich nach deinen Wünschen.
Ausführliche Anleitung mit Beispielbild: [`skills/rennbildschirm-designer/README.md`](skills/rennbildschirm-designer/README.md).

**Nutzen ohne Installation:** Den Inhalt von [`SKILL.md`](skills/rennbildschirm-designer/SKILL.md) einfach in den Chat
kopieren (oder schreiben: *„Lies die Datei …\SKILL.md und folge der Anleitung“*) und dann *„Bau mir einen Rennbildschirm“*.

**Als Skill installieren (Claude Code):** Die Datei speichern als

```
%USERPROFILE%\.claude\skills\rennbildschirm-designer\SKILL.md
```

Danach einfach schreiben: *„Bau mir einen Rennbildschirm“* oder `/rennbildschirm-designer`.
Codex und andere Programme haben eigene Skill-Ordner, siehe deren Anleitung.

## 2. CockpitApi (`api/`)

`cockpit-api.js` ist eine buildfreie JavaScript-Bibliothek für Rennbildschirme als Webseite. Sie fragt die Cockpit-XP-API
regelmäßig ab, bereinigt die Daten (Zeiten in Millisekunden, Fahrer- und Renndaten zusammengeführt, nach Platz sortiert) und
meldet Änderungen als Events. Aktionen wie Startampel, Pause oder Strafe sind eingebaut. Die Seite muss nur noch anzeigen.

Die Datei einfach neben die eigene HTML-Seite in den Webserver von Cockpit-XP legen:

```html
<script src="cockpit-api.js"></script>
<script>
  const cockpit = new CockpitApi();
  cockpit.on('autos', (autos) => console.log(autos));
</script>
```

Ausführliche Beschreibung: [`api/README.md`](api/README.md).
