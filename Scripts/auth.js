
// Season of Love - lightweight client-side auth helpers
// (Not secure; intended for gating a static/local tool.)

(function () {
	const AUTH_KEY = 'seasonOfLoveAuthenticated';
	const USERNAME_KEY = 'seasonOfLoveUsername';
	const PRIVILEGES_KEY = 'seasonOfLovePrivileges';
	const EFFORT_ALLOWED_USERS = new Set(['seph', 'badazal']);

	function getUsername() {
		return (sessionStorage.getItem(USERNAME_KEY) || '').trim();
	}

	function getNormalizedUsername() {
		const raw = getUsername();
		return raw.replace(/^@+/, '').trim().toLowerCase();
	}

	function isEffortBonusAllowed() {
		return EFFORT_ALLOWED_USERS.has(getNormalizedUsername());
	}

	function setVisible(el, visible) {
		if (!el) return;
		el.style.display = visible ? '' : 'none';
	}

	function applyEffortBonusVisibility() {
		// Only applies to main.html (these IDs exist there)
		const allowed = isEffortBonusAllowed();
		const effortBonusCheckbox = document.getElementById('effortBonus');
		const effortLootCheckbox = document.getElementById('effortLootCheck');

		const effortBonusGroup = effortBonusCheckbox?.closest('.input-group') || effortBonusCheckbox?.parentElement;
		const effortLootGroup = effortLootCheckbox?.closest('.input-group') || effortLootCheckbox?.parentElement;

		if (effortBonusCheckbox) {
			effortBonusCheckbox.disabled = !allowed;
			if (!allowed) effortBonusCheckbox.checked = false;
		}
		if (effortLootCheckbox) {
			effortLootCheckbox.disabled = !allowed;
			if (!allowed) effortLootCheckbox.checked = false;
		}

		setVisible(effortBonusGroup, allowed);
		setVisible(effortLootGroup, allowed);
	}

	function setAuthenticated(username, privileges) {
		sessionStorage.setItem(AUTH_KEY, 'true');
		sessionStorage.setItem(USERNAME_KEY, (username || '').trim());
		if (typeof privileges === 'string') {
			sessionStorage.setItem(PRIVILEGES_KEY, privileges.trim());
		}
	}

	function clearAuthenticated() {
		sessionStorage.removeItem(AUTH_KEY);
		sessionStorage.removeItem(USERNAME_KEY);
		sessionStorage.removeItem(PRIVILEGES_KEY);
	}

	function isAuthenticated() {
		return sessionStorage.getItem(AUTH_KEY) === 'true';
	}

	// Exposed for pages to call early (e.g., in <head>)
	window.requireSeasonOfLoveAuth = function requireSeasonOfLoveAuth() {
		if (!isAuthenticated()) {
			window.location.replace('login.html');
		}
	};

	window.logoutSeasonOfLove = function logoutSeasonOfLove() {
		clearAuthenticated();
		window.location.href = 'login.html';
	};

	function jsonp(url, params, timeoutMs = 8000) {
		return new Promise((resolve, reject) => {
			const callbackName = `__solJsonpCb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
			const script = document.createElement('script');
			const search = new URLSearchParams({
				...params,
				callback: callbackName,
				r: String(Date.now())
			});

			let done = false;
			const cleanup = () => {
				if (done) return;
				done = true;
				try { delete window[callbackName]; } catch (_) { /* ignore */ }
				if (script.parentNode) script.parentNode.removeChild(script);
			};

			const timer = setTimeout(() => {
				cleanup();
				reject(new Error('JSONP timeout'));
			}, timeoutMs);

			window[callbackName] = (data) => {
				clearTimeout(timer);
				cleanup();
				resolve(data);
			};

			script.onerror = () => {
				clearTimeout(timer);
				cleanup();
				reject(new Error('JSONP script error'));
			};

			script.src = `${url}${url.includes('?') ? '&' : '?'}${search.toString()}`;
			document.head.appendChild(script);
		});
	}

	async function validateLoginViaGoogleSheet(username, password) {
		const endpoint = String(window.SEASON_OF_LOVE_SHEETS_ENDPOINT || '').trim();
		if (!endpoint) return { ok: false };

		const sheetName = String(window.SEASON_OF_LOVE_CREDENTIALS_SHEET_NAME || 'Login Credentials').trim();
		const normalizedUsername = (username || '').trim();
		const providedPassword = String(password ?? '');
		if (!normalizedUsername || !providedPassword) return { ok: false };

		// NOTE: This sends username/password to Apps Script via query params.
		// It’s suitable for a lightweight static tool, not secure auth.
		const data = await jsonp(endpoint, {
			action: 'validateLogin',
			sheetName,
			username: normalizedUsername,
			password: providedPassword
		});

		if (data && typeof data === 'object' && data.ok === true) {
			return {
				ok: true,
				privileges: typeof data.privileges === 'string' ? data.privileges : ''
			};
		}

		return { ok: false };
	}

	function validateLoginViaLocalList(username, password) {
		const normalizedUsername = (username || '').trim().toLowerCase();
		const providedPassword = String(password ?? '');
		const list = Array.isArray(window.SEASON_OF_LOVE_LOGINS) ? window.SEASON_OF_LOVE_LOGINS : [];
		if (!normalizedUsername || !providedPassword || list.length === 0) return { ok: false };

		const match = list.find(entry => {
			const entryUsername = String(entry?.username ?? '').trim().toLowerCase();
			const entryPassword = String(entry?.password ?? '');
			return entryUsername === normalizedUsername && entryPassword === providedPassword;
		});

		if (!match) return { ok: false };
		return { ok: true, privileges: String(match?.privileges ?? '') };
	}

	// Credential check.
	// Primary: Google Sheet tab (via Apps Script web app)
	// Fallback: Data/logins.js (window.SEASON_OF_LOVE_LOGINS)
	window.validateLogin = async function validateLogin(username, password) {
		try {
			const remote = await validateLoginViaGoogleSheet(username, password);
			if (remote.ok) return remote;
		} catch (e) {
			// Ignore remote errors; fall back to local list.
			console.warn('Remote credential check failed, using local list:', e);
		}

		return validateLoginViaLocalList(username, password);
	};

	// Login page helpers (mirrors the provided example’s behavior)
	window.attemptLogin = async function attemptLogin() {
		const usernameInput = document.getElementById('login-username');
		const passwordInput = document.getElementById('login-password');
		const errorDiv = document.getElementById('login-error');
		const loginButton = document.getElementById('login-button') || document.querySelector('.login-button');

		if (!usernameInput || !passwordInput || !errorDiv || !loginButton) {
			// Not on the login page; no-op.
			return;
		}

		const username = usernameInput.value.trim();
		const password = passwordInput.value;

		loginButton.disabled = true;
		const originalText = loginButton.textContent;
		loginButton.textContent = 'Logging in...';
		errorDiv.classList.add('hidden');

		try {
			const result = await window.validateLogin(username, password);
			if (result && result.ok) {
				setAuthenticated(username, result.privileges);
				window.location.href = 'main.html';
				return;
			}

			errorDiv.classList.remove('hidden');
			passwordInput.value = '';
			passwordInput.focus();
		} catch (e) {
			console.error('Login error:', e);
			errorDiv.classList.remove('hidden');
			errorDiv.textContent = 'Login system unavailable. Please try again later.';
		} finally {
			loginButton.disabled = false;
			loginButton.textContent = originalText || 'Login';
		}
	};

	window.handleLoginKeyPress = function handleLoginKeyPress(event) {
		if (event?.key === 'Enter') {
			window.attemptLogin();
		}
	};

	function populateUserUI() {
		const el = document.getElementById('auth-user');
		if (!el) return;
		const username = getUsername();
		const privileges = (sessionStorage.getItem(PRIVILEGES_KEY) || '').trim();
		if (username && privileges) {
			el.textContent = `Logged in as: ${username} (${privileges})`;
		} else {
			el.textContent = username ? `Logged in as: ${username}` : 'Logged in';
		}
	}

	window.applySeasonOfLovePermissions = function applySeasonOfLovePermissions() {
		populateUserUI();
		applyEffortBonusVisibility();
	};

	document.addEventListener('DOMContentLoaded', window.applySeasonOfLovePermissions);
})();

