# Google Sheets Logging (Apps Script)

This roller can POST roll results to a Google Sheet via a Google Apps Script Web App.

## 1) Create the Sheet

Create a Google Sheet (any name). Add a tab named `Logs` (or use the first tab).

Recommended header row (row 1):

- `Timestamp`
- `App`
- `Username`
- `Roller`
- `Page`
- `Inputs (JSON)`
- `Results (JSON)`
- `UserAgent`

## 2) Create the Apps Script

In the Sheet: **Extensions → Apps Script**

Paste this code:

```js
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Logs') || ss.getSheets()[0];

  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : '{}');
  } catch (err) {
    payload = { type: 'bad_json', raw: (e && e.postData && e.postData.contents) ? e.postData.contents : '' };
  }

  const row = [
    new Date(),
    payload.app || 'Season-of-Love',
    payload.username || '',
    payload.roller || payload.type || 'event',
    payload.page || '',
    JSON.stringify(payload.inputs || payload.data || {}),
    JSON.stringify(payload.results || {}),
    payload.userAgent || ''
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3) Deploy as Web App

- Click **Deploy → New deployment**
- Select **Web app**
- **Execute as:** Me
- **Who has access:** Anyone (or Anyone with the link)
- Click **Deploy**

Copy the Web App URL.

## 4) Configure the roller

Open [Scripts/sheets-logger.js](../Scripts/sheets-logger.js) and set:

- `SHEETS_LOGGER_ENDPOINT` to the Web App URL

After that, each roll will send:

- logged-in username (from sessionStorage)
- the user inputs
- the exact rolled results

## Notes / limitations

- This is "lightweight" gating + logging for a static/local site. It is not secure authentication.
- The logger uses `fetch(mode: 'no-cors')`, so it won't show a success/failure UI, but it will send requests.
