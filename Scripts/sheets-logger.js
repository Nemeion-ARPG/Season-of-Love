
// Google Sheets logger (via Google Apps Script Web App)
//
// 1) Deploy the Apps Script as a Web App (Execute as: Me, Who has access: Anyone)
// 2) Put the deployed Web App URL into SHEETS_LOGGER_ENDPOINT below.
//
// This is best-effort logging for a static site. It sends a JSON payload as text/plain
// using fetch(mode: 'no-cors') so the request works without CORS preflight.

(function () {
	// Prefer shared config from Scripts/sol-config.js
	const SHEETS_LOGGER_ENDPOINT = (window.SEASON_OF_LOVE_SHEETS_ENDPOINT || '').trim();
	const SHEETS_LOGGER_SHEET_NAME = (window.SEASON_OF_LOVE_LOGS_SHEET_NAME || 'SoL Logs').trim();

	function isEnabled() {
		return typeof SHEETS_LOGGER_ENDPOINT === 'string' && SHEETS_LOGGER_ENDPOINT.length > 0;
	}

	function getUsername() {
		return (sessionStorage.getItem('seasonOfLoveUsername') || '').trim();
	}

	function baseEvent() {
		return {
			app: 'Season-of-Love',
			ts: new Date().toISOString(),
			username: getUsername(),
			sheetName: SHEETS_LOGGER_SHEET_NAME,
			page: window.location.pathname.split('/').pop() || 'unknown',
			userAgent: navigator.userAgent
		};
	}

	async function postEvent(event) {
		if (!isEnabled()) return;

		try {
			const payload = JSON.stringify(event);

			// Prefer sendBeacon when available (more reliable for "fire and forget")
			if (navigator.sendBeacon) {
				const ok = navigator.sendBeacon(
					SHEETS_LOGGER_ENDPOINT,
					new Blob([payload], { type: 'text/plain;charset=utf-8' })
				);
				if (ok) return;
			}

			// Fire-and-forget. With no-cors we cannot read the response, but the request is sent.
			await fetch(SHEETS_LOGGER_ENDPOINT, {
				method: 'POST',
				mode: 'no-cors',
				redirect: 'follow',
				headers: {
					'Content-Type': 'text/plain;charset=utf-8'
				},
				body: payload,
				keepalive: true
			});
		} catch (err) {
			// Never break the roller if logging fails.
			console.warn('Sheets logging failed:', err);
		}
	}

	// Public API
	window.logSeasonOfLoveRoll = function logSeasonOfLoveRoll(rollerName, inputs, results, extra) {
		const event = {
			...baseEvent(),
			type: 'roll',
			roller: rollerName,
			inputs: inputs ?? {},
			results: results ?? {},
			extra: extra ?? {}
		};

		// Don't await to avoid slowing down UI.
		void postEvent(event);
	};

	window.logSeasonOfLoveEvent = function logSeasonOfLoveEvent(type, data) {
		const event = {
			...baseEvent(),
			type: type || 'event',
			data: data ?? {}
		};
		void postEvent(event);
	};

	// Debug helper: run `testSheetsLogger()` in DevTools console.
	window.testSheetsLogger = function testSheetsLogger() {
		window.logSeasonOfLoveEvent('test', {
			note: 'If you see this row, logging is working.',
			hint: `Expected tab: ${SHEETS_LOGGER_SHEET_NAME}`
		});
	};
})();

