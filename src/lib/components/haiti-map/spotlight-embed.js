(function () {
	var script = /** @type {HTMLScriptElement | null} */ (document.currentScript);
	if (!script) return;
	var target = document.getElementById(
		script.getAttribute('data-target') || 'haiti-drone-spotlight'
	);
	if (!target) return;

	var scriptUrl = new URL(script.src, document.baseURI);
	scriptUrl.pathname = scriptUrl.pathname.replace(/\/embed\/?$/, '');
	scriptUrl.search = '';
	var lang = script.getAttribute('data-lang');
	scriptUrl.searchParams.set('autoplay', 'external');
	if (lang === 'fr') scriptUrl.searchParams.set('lang', 'fr');
	var ratio = script.getAttribute('data-ratio') === '1:1' ? '1 / 1' : '16 / 9';

	var wrapper = document.createElement('div');
	wrapper.style.cssText = 'position:relative;width:100%;overflow:hidden;aspect-ratio:' + ratio;
	var iframe = document.createElement('iframe');
	iframe.src = scriptUrl.toString();
	iframe.title =
		lang === 'fr' ? 'Drones explosifs recensés en Haïti' : 'Explosive drones recorded in Haiti';
	iframe.loading = 'lazy';
	iframe.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;border:0';
	wrapper.appendChild(iframe);
	target.replaceChildren(wrapper);

	var visible = false;
	var ready = false;
	var started = false;
	var observer = new IntersectionObserver(
		function (entries) {
			visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
			startIfReady();
		},
		{ threshold: 0.25 }
	);

	function startIfReady() {
		if (!visible || !ready || started) return;
		started = true;
		iframe.contentWindow?.postMessage({ type: 'tnh-haiti-spotlight-start' }, scriptUrl.origin);
		observer.disconnect();
		window.removeEventListener('message', onMessage);
	}

	/** @param {MessageEvent} event */
	function onMessage(event) {
		if (
			event.source !== iframe.contentWindow ||
			event.origin !== scriptUrl.origin ||
			event.data?.type !== 'tnh-haiti-spotlight-ready'
		)
			return;
		ready = true;
		startIfReady();
	}

	window.addEventListener('message', onMessage);
	observer.observe(wrapper);
})();
