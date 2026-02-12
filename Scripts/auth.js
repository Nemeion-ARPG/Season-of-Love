
// Season of Love - lightweight client-side auth helpers
// (Not secure; intended for gating a static/local tool.)

(function () {
	const AUTH_KEY = 'seasonOfLoveAuthenticated';
	const USERNAME_KEY = 'seasonOfLoveUsername';

	function getUsername() {
		return (sessionStorage.getItem(USERNAME_KEY) || '').trim();
	}

	function setAuthenticated(username) {
		sessionStorage.setItem(AUTH_KEY, 'true');
		sessionStorage.setItem(USERNAME_KEY, (username || '').trim());
	}

	function clearAuthenticated() {
		sessionStorage.removeItem(AUTH_KEY);
		sessionStorage.removeItem(USERNAME_KEY);
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

	// Credential check. Reads from Data/logins.js (window.SEASON_OF_LOVE_LOGINS)
	window.validateLogin = async function validateLogin(username, password) {
		const normalizedUsername = (username || '').trim().toLowerCase();
		const providedPassword = String(password ?? '');

		const list = Array.isArray(window.SEASON_OF_LOVE_LOGINS) ? window.SEASON_OF_LOVE_LOGINS : [];
		if (!normalizedUsername || !providedPassword || list.length === 0) return false;

		return list.some(entry => {
			const entryUsername = String(entry?.username ?? '').trim().toLowerCase();
			const entryPassword = String(entry?.password ?? '');
			return entryUsername === normalizedUsername && entryPassword === providedPassword;
		});
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
			const ok = await window.validateLogin(username, password);
			if (ok) {
				setAuthenticated(username);
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
		el.textContent = username ? `Logged in as: ${username}` : 'Logged in';
	}

	document.addEventListener('DOMContentLoaded', populateUserUI);
})();

