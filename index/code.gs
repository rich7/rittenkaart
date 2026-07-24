/**
 * RITTENKAART - Apps Script backend
 * ------------------------------------------------------------
 * Dit script hoort bij een Google Sheet met een tabblad "Leden"
 * met kolommen (rij 1 = koppen):
 *   A: Lidnummer | B: Naam | C: Email | D: Token | E: Saldo | F: LaatsteScan | G: AangemaaktOp
 *
 * INSTALLATIE
 * 1. Maak een Google Sheet, noem tabblad exact "Leden", zet de koppen
 *    hierboven in rij 1.
 * 2. Extensies > Apps Script, plak dit bestand erin (vervang de inhoud).
 * 3. Project instellingen > Scripteigenschappen, voeg toe:
 *      ADMIN_PASSWORD    = <jouw admin-wachtwoord>
 *      VERENIGING_NAAM   = <naam van de vereniging>
 * 4. Implementeren > Nieuwe implementatie > Type: Webapp
 *      - Uitvoeren als: Ik (jouw account)
 *      - Toegang: Iedereen
 *    Kopieer de webapp-URL, die vul je in bij het adminpaneel en de scanner-app.
 * 5. Wil je dit voor een tweede vereniging? Maak een kopie van de hele
 *    Sheet ("Bestand > Kopie maken"), dat neemt dit script mee. Zet
 *    daarna eigen Scripteigenschappen en doe een nieuwe implementatie.
 */

const SHEET_NAME = 'Leden';
const ADMIN_PASSWORD_PROP = 'ADMIN_PASSWORD';
const VERENIGING_NAAM_PROP = 'VERENIGING_NAAM';
const START_SALDO = 10;

function doPost(e) {
  let result;
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    switch (action) {
      case 'scan':
        result = scanLid(params.token);
        break;
      case 'checkAdminPassword':
        checkAdmin(params.adminPassword);
        result = { ok: true, verenigingNaam: getVerenigingNaam() };
        break;
      case 'addMember':
        checkAdmin(params.adminPassword);
        result = addMember(params.lidnummer, params.naam, params.email);
        break;
      case 'topUp':
        checkAdmin(params.adminPassword);
        result = topUp(params.lidnummer, params.aantal);
        break;
      case 'getMembers':
        checkAdmin(params.adminPassword);
        result = getMembers();
        break;
      default:
        throw new Error('Onbekende actie: ' + action);
    }
    return jsonResponse({ success: true, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function checkAdmin(pw) {
  const real = PropertiesService.getScriptProperties().getProperty(ADMIN_PASSWORD_PROP);
  if (!real || pw !== real) throw new Error('Ongeldig wachtwoord');
}

function getVerenigingNaam() {
  return PropertiesService.getScriptProperties().getProperty(VERENIGING_NAAM_PROP) || 'de vereniging';
}

function getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Tabblad "Leden" niet gevonden');
  return sheet;
}

function findRowByToken(token) {
  const data = getSheet().getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]) === String(token)) return i + 1;
  }
  return -1;
}

function findRowByLidnummer(lidnummer) {
  const data = getSheet().getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(lidnummer)) return i + 1;
  }
  return -1;
}

function scanLid(token) {
  if (!token) throw new Error('Geen QR-code gegevens ontvangen');
  const row = findRowByToken(token);
  if (row === -1) throw new Error('Onbekende QR-code');

  const sheet = getSheet();
  const naam = sheet.getRange(row, 2).getValue();
  const saldo = Number(sheet.getRange(row, 5).getValue());

  if (saldo <= 0) {
    return { naam: naam, saldo: saldo, toegestaan: false, melding: 'Geen ritten meer over' };
  }
  const nieuwSaldo = saldo - 1;
  sheet.getRange(row, 5).setValue(nieuwSaldo);
  sheet.getRange(row, 6).setValue(new Date());
  return { naam: naam, saldo: nieuwSaldo, toegestaan: true, melding: 'Toegang verleend' };
}

function addMember(lidnummer, naam, email) {
  if (!lidnummer || !naam || !email) throw new Error('Lidnummer, naam en e-mail zijn verplicht');
  if (findRowByLidnummer(lidnummer) !== -1) throw new Error('Lidnummer bestaat al');

  const token = Utilities.getUuid();
  getSheet().appendRow([lidnummer, naam, email, token, START_SALDO, '', new Date()]);
  stuurQrMail(naam, email, token, lidnummer);
  return { lidnummer: lidnummer, naam: naam, email: email, saldo: START_SALDO };
}

function topUp(lidnummer, aantal) {
  const row = findRowByLidnummer(lidnummer);
  if (row === -1) throw new Error('Lid niet gevonden');
  const n = Number(aantal);
  if (!n || n <= 0) throw new Error('Ongeldig aantal ritten');

  const sheet = getSheet();
  const huidig = Number(sheet.getRange(row, 5).getValue());
  const nieuw = huidig + n;
  sheet.getRange(row, 5).setValue(nieuw);
  return { lidnummer: lidnummer, nieuwSaldo: nieuw };
}

function getMembers() {
  const data = getSheet().getDataRange().getValues();
  const leden = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    leden.push({
      lidnummer: data[i][0],
      naam: data[i][1],
      email: data[i][2],
      saldo: data[i][4],
      laatsteScan: data[i][5] ? new Date(data[i][5]).toLocaleString('nl-NL') : ''
    });
  }
  return leden;
}

function stuurQrMail(naam, email, token, lidnummer) {
  const verenigingNaam = getVerenigingNaam();
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(token);
  const blob = UrlFetchApp.fetch(qrUrl).getBlob().setName('rittenkaart-qr.png');

  const html =
    '<p>Beste ' + naam + ',</p>' +
    '<p>Hierbij je persoonlijke rittenkaart voor ' + verenigingNaam + ' (lidnummer ' + lidnummer + '), ' +
    'goed voor ' + START_SALDO + ' ritten.</p>' +
    '<p>Toon onderstaande QR-code bij binnenkomst, dan wordt er automatisch 1 rit afgeschreven.</p>' +
    '<img src="cid:qrcode" width="300" height="300" />' +
    '<p>Bewaar deze e-mail goed &mdash; je hebt de code bij elk bezoek nodig. ' +
    'Bijna op? Vraag bij de administratie om je kaart op te waarderen.</p>';

  MailApp.sendEmail({
    to: email,
    subject: 'Jouw rittenkaart voor ' + verenigingNaam,
    htmlBody: html,
    inlineImages: { qrcode: blob }
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
