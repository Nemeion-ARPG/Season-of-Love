# Google Sheets Logging (Apps Script)

This roller can POST roll results to a Google Sheet via a Google Apps Script Web App.

## 1) Create the Sheet

Create a Google Sheet (any name). Add a tab named `SoL Logs`.

Create another tab named `Login Credentials` with headers in row 1:

- `Username`
- `Password`
- `Privileges`

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
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : '{}');
  } catch (err) {
    payload = { type: 'bad_json', raw: (e && e.postData && e.postData.contents) ? e.postData.contents : '' };
  }

  const targetName = payload.sheetName || 'SoL Logs';
  let sheet = ss.getSheetByName(targetName);
  if (!sheet) sheet = ss.insertSheet(targetName);

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

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};

  // JSONP endpoint for login validation
  // Example request:
  //   ?action=validateLogin&sheetName=Login%20Credentials&username=demo&password=demo&callback=cb
  if (p.action === 'validateLogin') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = p.sheetName || 'Login Credentials';
    const sheet = ss.getSheetByName(sheetName);

    const callback = p.callback || 'callback';
    const username = String(p.username || '').trim().toLowerCase();
    const password = String(p.password || '');

    let result = { ok: false, privileges: '' };

    if (sheet && username && password) {
      const values = sheet.getDataRange().getValues();
      if (values.length >= 2) {
        const headers = values[0].map(h => String(h || '').trim().toLowerCase());
        const uIdx = headers.indexOf('username');
        const pIdx = headers.indexOf('password');
        const privIdx = headers.indexOf('privileges');

        if (uIdx !== -1 && pIdx !== -1) {
          for (let i = 1; i < values.length; i++) {
            const row = values[i];
            const u = String(row[uIdx] || '').trim().toLowerCase();
            const pw = String(row[pIdx] || '');
            if (u === username && pw === password) {
              result.ok = true;
              result.privileges = privIdx !== -1 ? String(row[privIdx] || '') : '';
              break;
            }
          }
        }
      }
    }

    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(result)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Simple health check
  return ContentService
    .createTextOutput('ok')
    .setMimeType(ContentService.MimeType.TEXT);
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
