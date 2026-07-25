##Rittenkaart apps
## 1. Scanner   
App voor telefoon. Scanned de QR code een geeft toegang en trekt 1 rit af, of geeft reden waarom geweigerd.

https://rich7.github.io/rittenkaart/scanner.html

## 2. Admin tool.  
Voegt rittenkaarten toe, verstuurd email met nieuwe kaart (QR code). opwaarderen kaart, kaarten overzicht.  Instellingen

https://rich7.github.io/rittenkaart/admin.html

## 3. Leden app. 
QR code uit Email is voldoende.
Optioneel kan lid de leden app gebruiken
Laat toegangs QR code zien, laatste datum afschrijving en resterend tegoed

https://rich7.github.io/rittenkaart/leden.html

## 4. Opslag kaarten en activiteiten log op Google Sheets 
Backend opslag voor rittenkaarten. Activiteiten log met alle scans en opwaarderingen 

https://docs.google.com/spreadsheets/d/1eTKFX7DJd5UzaKlY5XbSqFj9K7OH4z3QIVh-NmYufKc/edit?gid=0#gid=0








# Rittenkaart-app - installatie

## 1. Google Sheet aanmaken
0. Maak Google account aan of gebruik bestaand account.
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
Zet `admin.html`, `scanner.html` en `lid.html` op een webpagina. Ze zijn los van elkaar te gebruiken:
- `admin.html`: tabs voor nieuw lid toevoegen (mailt automatisch de QR-code), ritten opwaarderen, ledenoverzicht, en instellingen (berichtduur op de scanner).
- `scanner.html`: open dit op de telefoon/tablet bij de toegang, log in met het wachtwoord, laat de camera op de QR-code richten. Piept/trilt bij geslaagde/geweigerde scan
- `lid.html`: leden vullen hun lidnummer + e-mailadres in en zien hun eigen tegoed en laatste bezoek. Geen wachtwoord nodig - kan gewoon gedeeld worden als link.


## Log-tabblad
Er verschijnt automatisch een tweede tabblad "Log" in je Sheet zodra de eerste scan plaatsvindt. Daar staat elke scanpoging (geslaagd of geweigerd, met reden en wanneer er opgewaardeerd is).

## Vingerafdruk/Face ID inloggen
`admin.html` en `scanner.html` gebruiken inlogformulier, de browser kan aanbieden het wachtwoord om op te slaan. Zodra je dat op een telefoon/tablet één keer doet (bij het eerste keer inloggen kiest de browser/wachtwoordmanager voor "wachtwoord opslaan?"), vult diezelfde browser het wachtwoord bij een volgend bezoek automatisch in nadat je met Face ID/vingerafdruk hebt bevestigd - dat is standaardgedrag van de iOS Sleutelhanger / Google Wachtwoordmanager, enz.

## Nog open/te overwegen
- Wachtwoorden staan als platte tekst in Scripteigenschappen en worden bij elke aanroep meegestuurd - prima voor beperkte, vertrouwde toegang, maar geen bankwaardige beveiliging.
- 
- QR-afbeelding wordt gegenereerd via de gratis dienst api.qrserver.com. Werkt prima, maar is een externe afhankelijkheid.
- Er is nog geen manier om een lid te verwijderen/wachtwoord te wijzigen vanuit het adminpaneel zelf - dat kan rechtstreeks in de Sheet / Scripteigenschappen.
- 



