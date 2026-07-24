# Rittenkaart-app - installatie

## 1. Google Sheet aanmaken
1. Maak een nieuwe Google Sheet.
2. Hernoem het eerste tabblad naar exact `Leden`.
3. Zet in rij 1 deze koppen (kolom A t/m G):
   `Lidnummer | Naam | Email | Token | Saldo | LaatsteScan | AangemaaktOp`

## 2. Apps Script koppelen
1. In de Sheet: **Extensies > Apps Script**.
2. Verwijder de standaardinhoud en plak de inhoud van `Code.gs`.
3. **Project instellingen > Scripteigenschappen**, voeg toe:
   - `ADMIN_PASSWORD` = een wachtwoord naar keuze
   - `VERENIGING_NAAM` = naam van de vereniging (komt in de mail en op de schermen)
4. **Implementeren > Nieuwe implementatie**
   - Type: **Webapp**
   - Uitvoeren als: **Ik**
   - Toegang: **Iedereen**
5. Kopieer de webapp-URL die je krijgt (eindigt op `/exec`).
6. Bij de eerste keer implementeren vraagt Google om machtigingen (Sheet lezen/schrijven, mail versturen) - accepteer die voor je eigen account.

## 3. HTML-bestanden instellen
Open zowel `admin.html` als `scanner.html` in een teksteditor en vervang:
```
const APPS_SCRIPT_URL = 'PLAK_HIER_JE_APPS_SCRIPT_WEBAPP_URL';
```
met de webapp-URL uit stap 2.

## 4. Hosten
Zet `admin.html` en `scanner.html` op GitHub Pages (net als je andere tools). Ze zijn los van elkaar te gebruiken:
- `admin.html`: leden toevoegen (mailt automatisch de QR-code) en ritten opwaarderen.
- `scanner.html`: open dit op de telefoon/tablet bij de deur, log in met het wachtwoord, laat de camera op de QR-code richten.

## 5. Meerdere verenigingen
Voor een tweede vereniging: maak een kopie van de hele Sheet (**Bestand > Kopie maken**, script gaat mee), zet eigen Scripteigenschappen, doe een nieuwe implementatie, en maak een kopie van `admin.html`/`scanner.html` met de nieuwe webapp-URL erin.

## Nog open/te overwegen
- Wachtwoorden staan als platte tekst in Scripteigenschappen en worden bij elke aanroep meegestuurd - prima voor beperkte, vertrouwde toegang, maar geen bankwaardige beveiliging.
- QR-afbeelding wordt gegenereerd via de gratis dienst api.qrserver.com. Werkt prima, maar is een externe afhankelijkheid.
- Er is nog geen manier om een lid te verwijderen/wachtwoord te wijzigen vanuit het adminpaneel zelf - dat kan rechtstreeks in de Sheet / Scripteigenschappen.
