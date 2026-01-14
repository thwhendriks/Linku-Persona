# Linku Persona Widget voor Figma

Een Figma widget om persona's te maken en beheren.

<img width="1920" height="1080" alt="widget-thumbnail" src="https://github.com/user-attachments/assets/b8f24387-f992-4146-9f91-c2b2e6c6cca7" />

---

## 🎯 Voor wie is deze handleiding?

Deze handleiding is geschreven voor designers die:
- Nog nooit met GitHub hebben gewerkt
- Nog nooit met de Terminal/command line hebben gewerkt
- De widget lokaal willen draaien om aanpassingen te maken

**Geen zorgen!** We leggen elke stap uit met duidelijke instructies.

---

## 📋 Wat heb je nodig?

Voordat we beginnen, moeten we een paar programma's installeren. Dit hoef je maar één keer te doen.

### Stap 1: Installeer Visual Studio Code (code editor)

Visual Studio Code (VS Code) is een gratis programma om code te bekijken en bewerken.

1. Ga naar: https://code.visualstudio.com/
2. Klik op de grote blauwe downloadknop
3. Open het gedownloade bestand en installeer het programma
4. Sleep VS Code naar je Applications map (Mac) of volg de installer (Windows)

### Stap 2: Installeer Node.js

Node.js is nodig om de widget te kunnen bouwen.

1. Ga naar: https://nodejs.org/
2. Download de **LTS versie** (de linker groene knop - dit is de stabiele versie)
3. Open het gedownloade bestand
4. Volg de installatie-stappen (klik steeds op "Volgende" / "Continue")
5. **Herstart je computer** na de installatie

### Stap 3: Controleer of Node.js goed is geïnstalleerd

1. Open **Terminal** (Mac) of **Command Prompt** (Windows)
   - **Mac**: Druk `Cmd + Spatie`, typ "Terminal", druk Enter
   - **Windows**: Druk `Windows-toets`, typ "cmd", druk Enter
2. Typ het volgende en druk Enter:
   ```
   node --version
   ```
3. Je zou iets moeten zien zoals `v20.10.0` (het versienummer kan anders zijn)
4. Als je een foutmelding krijgt, herstart je computer en probeer opnieuw

---

## 📥 Het project downloaden

### Optie A: Download als ZIP (makkelijkst)

1. Ga naar de GitHub pagina van dit project
2. Klik op de groene knop **"Code"**
3. Klik op **"Download ZIP"**
4. Pak het ZIP bestand uit (dubbelklik op Mac, of rechtermuisklik → "Uitpakken" op Windows)
5. Verplaats de map naar een plek die je makkelijk kunt vinden (bijvoorbeeld je Documenten map)

### Optie B: Via GitHub Desktop (aangeraden als je vaker wilt bijdragen)

Als je wijzigingen wilt kunnen delen met het team, is GitHub Desktop handig:

1. Download GitHub Desktop: https://desktop.github.com/
2. Installeer en open het programma
3. Log in met je GitHub account (of maak er een aan op github.com)
4. Klik op "Clone a repository from the Internet..."
5. Plak de URL van dit project
6. Kies waar je het wilt opslaan en klik "Clone"

---

## 🚀 Het project opstarten

### Stap 1: Open het project in VS Code

1. Open Visual Studio Code
2. Ga naar `File` → `Open Folder...` (of `Bestand` → `Map openen...`)
3. Navigeer naar de map waar je het project hebt opgeslagen
4. Selecteer de map `Linku Persona` (of hoe de map ook heet) en klik "Open"

### Stap 2: Open de Terminal in VS Code

1. In VS Code, ga naar het menu: `Terminal` → `New Terminal`
   - Of gebruik de sneltoets: `Ctrl + ~` (Windows) of `Cmd + ~` (Mac)
2. Er opent nu een Terminal venster onderin VS Code

### Stap 3: Installeer de benodigde packages

Dit hoef je alleen de eerste keer te doen (of als er nieuwe packages zijn toegevoegd).

1. Typ in de Terminal:
   ```
   npm install
   ```
2. Druk op Enter
3. Wacht tot het klaar is (dit kan even duren, je ziet veel tekst voorbij komen)
4. Als het klaar is, zie je weer de cursor knipperen

### Stap 4: Start de widget

1. Typ in de Terminal:
   ```
   npm run watch
   ```
2. Druk op Enter
3. Je ziet nu iets zoals: `watching for changes...`
4. **Laat dit venster open staan!** Dit zorgt ervoor dat je wijzigingen automatisch worden verwerkt.

---

## 🔌 De widget in Figma laden

### De eerste keer (widget importeren)

1. Open Figma Desktop App (niet in de browser!)
2. Open een bestaand bestand of maak een nieuw bestand
3. Klik met de rechtermuisknop ergens op het canvas
4. Ga naar `Widgets` → `Development` → `Import widget from manifest...`
5. Navigeer naar je project map
6. Selecteer het bestand `manifest.json` en klik "Open"
7. De widget verschijnt nu in je Widgets menu onder "Development"

### De widget gebruiken

1. Klik met de rechtermuisknop op het canvas
2. Ga naar `Widgets` → `Development` → `Linku Persona`
3. Klik erop om de widget te plaatsen

### Wijzigingen zien in Figma

Als je code aanpast en opslaat:
1. De Terminal (waar `npm run watch` draait) verwerkt automatisch je wijzigingen
2. In Figma: klik met rechtermuisknop op de widget
3. Klik op `Widgets` → `Development` → kies je widget opnieuw
4. Of: verwijder de widget en plaats hem opnieuw

---

## 📁 Projectstructuur (voor als je wilt aanpassen)

```
Linku Persona/
├── widget-src/           ← Hier staat alle code
│   ├── code.tsx          ← Hoofdbestand van de widget
│   ├── components/       ← Losse onderdelen (knoppen, kaarten, etc.)
│   ├── constants.ts      ← Kleuren, groottes, etc.
│   ├── strings.ts        ← Alle teksten
│   ├── types.ts          ← Definities van data
│   └── ui/               ← Pop-up schermen
├── dist/                 ← Hier komt de gebouwde code (niet handmatig aanpassen!)
├── manifest.json         ← Widget configuratie voor Figma
├── package.json          ← Project configuratie
└── README.md             ← Dit bestand
```

---

## ❓ Veelvoorkomende problemen

### "npm: command not found" of "node: command not found"

- Node.js is niet goed geïnstalleerd. Herstart je computer en probeer opnieuw.
- Zo niet, installeer Node.js opnieuw.

### De widget verschijnt niet in Figma

- Zorg dat je de Figma Desktop App gebruikt, niet de browser versie
- Controleer of `npm run watch` nog draait in de Terminal
- Probeer de widget opnieuw te importeren via het manifest.json bestand

### Foutmeldingen in de Terminal na `npm install`

- Probeer: `npm install` opnieuw uit te voeren
- Verwijder de map `node_modules` en voer `npm install` opnieuw uit

### Wijzigingen worden niet zichtbaar in Figma

- Check of `npm run watch` nog draait (je moet `watching for changes...` zien)
- Verwijder de widget in Figma en plaats hem opnieuw

---

## 🛑 Stoppen met werken

1. Ga naar de Terminal in VS Code
2. Druk `Ctrl + C` (Windows) of `Cmd + C` (Mac) om het watch proces te stoppen
3. Je kunt VS Code nu sluiten

---

## 💡 Tips

- **Sla je bestanden op** (`Cmd + S` of `Ctrl + S`) na elke wijziging - de watch detecteert dit automatisch
- **Bekijk de console in Figma** voor foutmeldingen: `Plugins` → `Development` → `Show/Hide Console`
- **Maak kleine wijzigingen** en test vaak, zo kun je makkelijker zien wat er mis gaat

---

## 🆘 Hulp nodig?

Kom je er niet uit? Vraag hulp aan een collega die bekend is met het project, of maak een issue aan op GitHub.
