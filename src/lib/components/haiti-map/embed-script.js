(function () {
	// Self-executing function to keep variables scoped and avoid globals
	try {
		// 1) Resolve the current <script> element and read optional data-attributes
		//
		// data-target: id of the container element to mount into (default: 'haiti-drone-map')
		// data-src:    URL of the iframe source (defaults to the same host as this script)
		// data-track:  Optional override for the tracking endpoint; if omitted we derive it
		var scriptEl = /** @type {HTMLScriptElement | null} */ (document.currentScript);
		var targetId = (scriptEl && scriptEl.getAttribute('data-target')) || 'haiti-drone-map';
		var derivedSrc = '';
		if (scriptEl && scriptEl.src) {
			var scriptUrl = new URL(scriptEl.src, document.baseURI);
			scriptUrl.pathname = scriptUrl.pathname.replace(/\/embed\/?$/, '');
			scriptUrl.search = '';
			scriptUrl.hash = '';
			derivedSrc = scriptUrl.toString().replace(/\/$/, '');
		}
		var src =
			(scriptEl && scriptEl.getAttribute('data-src')) ||
			derivedSrc ||
			'https://interactive.thenewhumanitarian.org/embeddable/map/2026-08/haiti';

		// Ensure the target container exists (create one if it doesn't)
		var target = document.getElementById(targetId);
		if (!target) {
			target = document.createElement('div');
			target.id = targetId;
			document.body.appendChild(target);
		}

		// 2) Inject minimal CSS for the responsive iframe and a simple shimmer while loading
		var css =
			'' +
			// Wrapper fills available width
			'.tnh-haiti-embed { position: relative; width: 100%; overflow: hidden; line-height: 0; }\n' +
			// Iframe keeps a responsive aspect ratio and has no chrome
			'.tnh-haiti-dashboard { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; border: 0; outline: 0; box-shadow: none; }\n' +
			// Tweak aspect ratios for narrower viewports
			'@media screen and (max-width: 980px) { .tnh-haiti-dashboard { aspect-ratio: 1; } }\n' +
			'@media screen and (max-width: 640px) { .tnh-haiti-dashboard { aspect-ratio: 1 / 1.6; } }\n' +
			// Loading shimmer while the iframe contents arrive
			'.tnh-haiti-dashboard { --light-grey:#eee; --dark-grey:#ddd; background: repeating-linear-gradient(to right, var(--light-grey) 0%, var(--dark-grey) 50%, var(--light-grey) 100%); background-size: 200% auto; background-position: 0 100%; animation: tnh-haiti-loading 2s infinite linear; }\n' +
			'@keyframes tnh-haiti-loading { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }';

		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);

		// 3) Build the iframe element and apply safe attributes
		var wrapper = document.createElement('div');
		wrapper.className = 'tnh-haiti-embed';

		var iframe = document.createElement('iframe');
		iframe.className = 'tnh-haiti-dashboard';
		iframe.setAttribute('allowfullscreen', '');
		iframe.setAttribute('scrolling', 'no');
		iframe.setAttribute('allowtransparency', 'true');
		iframe.setAttribute('loading', 'lazy');
		iframe.setAttribute('title', 'Haiti explosive drones map');
		iframe.src = src;

		// Once the iframe loads, remove the shimmer styles
		iframe.addEventListener('load', function () {
			iframe.style.background = 'none';
			iframe.style.animation = 'none';
		});

		// 4) Fire-and-forget tracking beacon so every embed view is counted
		//    Prefer navigator.sendBeacon (non-blocking, reliable). Fallback to a GET image ping.
		try {
			// Derive tracker endpoint if not explicitly provided via data-track
			var trackUrl = scriptEl && scriptEl.getAttribute('data-track');
			if (!trackUrl) {
				var trackUrlObject = new URL(src, document.baseURI);
				trackUrlObject.pathname = trackUrlObject.pathname.replace(/\/$/, '') + '/track';
				trackUrlObject.search = '';
				trackUrlObject.hash = '';
				trackUrl = trackUrlObject.toString();
			}

			// Minimal payload — GA event wiring happens server-side
			var payload = {
				v: 1,
				t: 'embed',
				referrer: document.referrer || '',
				location: (window.location && window.location.href) || ''
			};

			var json = JSON.stringify(payload);
			if (navigator && typeof navigator.sendBeacon === 'function') {
				// POST JSON using sendBeacon (does not block page unload)
				navigator.sendBeacon(trackUrl, new Blob([json], { type: 'application/json' }));
			} else {
				// Fallback: cache-busted GET request via Image
				var img = new Image();
				var ts = Date.now();
				img.src = trackUrl + '?v=1&ts=' + ts + '&referrer=' + encodeURIComponent(payload.referrer);
			}
		} catch {
			// Tracking failures should never break the embed
			/* ignore tracking errors */
		}

		// 5) Mount the iframe
		wrapper.appendChild(iframe);
		target.innerHTML = '';
		target.appendChild(wrapper);
	} catch (e) {
		// Fail safe: if anything goes wrong, log and do not throw
		console.error('[TNH Haiti Embed] Failed to initialize embed:', e);
	}
})();
