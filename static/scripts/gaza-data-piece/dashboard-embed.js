(function () {
	try {
		var scriptEl = document.currentScript;
		var targetId = (scriptEl && scriptEl.getAttribute('data-target')) || 'gaza-aid-killings';
		var src =
			(scriptEl && scriptEl.getAttribute('data-src')) ||
			'https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza';
		var target = document.getElementById(targetId);
		if (!target) {
			target = document.createElement('div');
			target.id = targetId;
			document.body.appendChild(target);
		}

		// Detect host for logo policy
		var hostContainsTNH = false;
		try {
			var topHref = window.top && window.top.location && window.top.location.href;
			hostContainsTNH = /thenewhumanitarian\.org/i.test(topHref || '');
		} catch (e) {
			// Cross-origin, assume not TNH to be safe
			hostContainsTNH = false;
		}

		// Inject styles (scoped by class)
		var css =
			'' +
			'.tnh-gaza-embed { position: relative; width: 100%; }\n' +
			'.tnh-gaza-dashboard { width: 100%; aspect-ratio: 4 / 3; border: none; outline: none; box-shadow: none; }\n' +
			'@media screen and (max-width: 980px) { .tnh-gaza-dashboard { aspect-ratio: 1; } }\n' +
			'@media screen and (max-width: 640px) { .tnh-gaza-dashboard { aspect-ratio: 1 / 1.6; } }\n' +
			/* Loading shimmer */
			'.tnh-gaza-dashboard { --light-grey:#eee; --dark-grey:#ddd; background: repeating-linear-gradient(to right, var(--light-grey) 0%, var(--dark-grey) 50%, var(--light-grey) 100%); background-size: 200% auto; background-position: 0 100%; animation: tnh-gaza-loading 2s infinite linear; }\n' +
			'@keyframes tnh-gaza-loading { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }\n' +
			/* Logo */
			'.tnh-badge { position:absolute; right:8px; bottom:8px; z-index:2; display:inline-flex; align-items:center; gap:6px; background:rgba(17,17,17,.7); color:#fff; padding:6px 10px; border-radius:4px; text-decoration:none; font: 600 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial; }\n' +
			'.tnh-badge:hover { background: rgba(17,17,17,.85); }\n' +
			'.tnh-badge img { height:14px; width:auto; display:block; }';

		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);

		// Create iframe
		var wrapper = document.createElement('div');
		wrapper.className = 'tnh-gaza-embed';
		var iframe = document.createElement('iframe');
		iframe.className = 'tnh-gaza-dashboard';
		iframe.setAttribute('allowfullscreen', '');
		iframe.setAttribute('scrolling', 'no');
		iframe.setAttribute('allowtransparency', 'true');
		iframe.setAttribute('loading', 'lazy');
		iframe.setAttribute('title', 'Gaza Aid Seekers Dashboard');
		iframe.src = src;

		// Remove shimmer once loaded
		iframe.addEventListener('load', function () {
			iframe.style.background = 'none';
			iframe.style.animation = 'none';
		});

		wrapper.appendChild(iframe);

		// Add TNH badge if standalone OR embedding site is not TNH
		var alwaysShowBadge = true; // show on standalone
		if (alwaysShowBadge || !hostContainsTNH) {
			var badge = document.createElement('a');
			badge.className = 'tnh-badge';
			badge.href = 'https://www.thenewhumanitarian.org';
			badge.target = '_blank';
			badge.rel = 'noopener noreferrer';
			badge.setAttribute('aria-label', 'The New Humanitarian');
			var logo = document.createElement('img');
			logo.src = 'https://interactive.thenewhumanitarian.org/static/logos/tnh-logo-invert.svg';
			logo.alt = 'The New Humanitarian';
			badge.appendChild(logo);
			var text = document.createElement('span');
			text.textContent = 'The New Humanitarian';
			badge.appendChild(text);
			wrapper.appendChild(badge);
		}

		target.innerHTML = '';
		target.appendChild(wrapper);
	} catch (e) {
		console.error('[TNH Gaza Embed] Failed to initialize embed:', e);
	}
})();
