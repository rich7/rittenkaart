
Scanner
https://rich7.github.io/rittenkaart/index/
Administratie
https://rich7.github.io/rittenkaart/index/admin



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
Open `admin.html`, `scanner.html` en `lid.html` in een teksteditor en vervang in elk bestand:
```
const APPS_SCRIPT_URL = 'PLAK_HIER_JE_APPS_SCRIPT_WEBAPP_URL';
```
met de webapp-URL uit stap 2.

## 4. Hosten
Zet `admin.html`, `scanner.html` en `lid.html` op GitHub Pages (net als je andere tools). Ze zijn los van elkaar te gebruiken:
- `admin.html`: tabs voor nieuw lid toevoegen (mailt automatisch de QR-code), ritten opwaarderen, ledenoverzicht, en instellingen (berichtduur op de scanner).
- `scanner.html`: open dit op de telefoon/tablet bij de deur, log in met het wachtwoord, laat de camera op de QR-code richten. Piept/trilt bij geslaagde/geweigerde scan, stopt 3 seconden met scannen na elk resultaat.
- `lid.html`: leden vullen hun lidnummer + e-mailadres in en zien hun eigen tegoed en laatste bezoek. Geen wachtwoord nodig - kan gewoon gedeeld worden als link.

## 5. Meerdere verenigingen
Voor een tweede vereniging: maak een kopie van de hele Sheet (**Bestand > Kopie maken**, script gaat mee), zet eigen Scripteigenschappen, doe een nieuwe implementatie, en maak een kopie van `admin.html`/`scanner.html`/`lid.html` met de nieuwe webapp-URL erin.

## Log-tabblad
Er verschijnt automatisch een tweede tabblad "Log" in je Sheet zodra de eerste scan plaatsvindt. Daar staat elke scanpoging (geslaagd of geweigerd, met reden).

## Vingerafdruk/Face ID inloggen
`admin.html` en `scanner.html` gebruiken nu een echt inlogformulier, zodat de browser het wachtwoord kan aanbieden om op te slaan. Zodra je dat op een telefoon/tablet één keer doet (bij het eerste keer inloggen kiest de browser/wachtwoordmanager voor "wachtwoord opslaan?"), vult diezelfde browser het wachtwoord bij een volgend bezoek automatisch in nadat je met Face ID/vingerafdruk hebt bevestigd - dat is standaardgedrag van de wachtwoordmanager (iOS Sleutelhanger, Google Wachtwoordmanager, enz.), er is geen extra installatie voor nodig.

## Nog open/te overwegen
- Wachtwoorden staan als platte tekst in Scripteigenschappen en worden bij elke aanroep meegestuurd - prima voor beperkte, vertrouwde toegang, maar geen bankwaardige beveiliging.
- QR-afbeelding wordt gegenereerd via de gratis dienst api.qrserver.com. Werkt prima, maar is een externe afhankelijkheid.
- Er is nog geen manier om een lid te verwijderen/wachtwoord te wijzigen vanuit het adminpaneel zelf - dat kan rechtstreeks in de Sheet / Scripteigenschappen.
