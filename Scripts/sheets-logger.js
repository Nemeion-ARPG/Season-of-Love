
// Google Sheets logger (via Google Apps Script Web App)
//
// 1) Deploy the Apps Script as a Web App (Execute as: Me, Who has access: Anyone)
// 2) Put the deployed Web App URL into SHEETS_LOGGER_ENDPOINT below.
//
// This is best-effort logging for a static site. It sends a JSON payload as text/plain
// using fetch(mode: 'no-cors') so the request works without CORS preflight.

(function () {
	// TODO: Set this to your deployed Apps Script Web App URL.
	// Example: https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
	const SHEETS_LOGGER_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxq9VkhDx9Pbcw5OSW-I7WthN5cS_xxkxN57krvpT06TsRLBEZusapima8_Joiiv4DV6g/exec';

	function isEnabled() {
		return typeof SHEETS_LOGGER_ENDPOINT === 'string' && SHEETS_LOGGER_ENDPOINT.trim().length > 0;
	}

	function getUsername() {
		return (sessionStorage.getItem('seasonOfLoveUsername') || '').trim();
	}

	function baseEvent() {
		return {
			app: 'Season-of-Love',
			ts: new Date().toISOString(),
			username: getUsername(),
			page: window.location.pathname.split('/').pop() || 'unknown',
			userAgent: navigator.userAgent
		};
	}

	async function postEvent(event) {
		if (!isEnabled()) return;

		try {
			// Fire-and-forget. With no-cors we cannot read the response, but the request is sent.
			await fetch(SHEETS_LOGGER_ENDPOINT, {
				method: 'POST',
				mode: 'no-cors',
				headers: {
					'Content-Type': 'text/plain;charset=utf-8'
				},
				body: JSON.stringify(event),
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
})();

