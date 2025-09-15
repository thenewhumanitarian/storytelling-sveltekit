(() => {
	// ---- Config ----
	const TOTALS = [
		{ label: 'Killed', value: 2957 },
		{ label: 'Wounded', value: 19866 }
	];
	const DATE_RANGE = '1 Jan 2024–9 Sep 2025';
	const DURATION_MS = 2200; // length of the count-up
	const THRESHOLD = 0.35; // how much must be visible to trigger
	const fmt = new Intl.NumberFormat('en-GB');

	const root = document.getElementById('counter');
	if (!root) return;

	// ---- Minimal styles (scoped) ----
	const css = `
  #counter{position:relative;overflow:hidden;display:grid;place-items:center;font-family:inherit;transition:background-color 0.8s ease-in-out;}
  #counter.completed{background-color:#282828;}
  #counter .ghf-wrap{display:grid;grid-auto-flow:column;gap:clamp(12px,3vw,32px);align-items:center;justify-content:space-between;inline-size:100%;block-size:100%;padding:0 2rem 1.5rem 2rem;}
  #counter .ghf-item{display:grid;place-items:center;text-align:center;line-height:1.1;min-width:min(40ch,46%);}
  #counter .ghf-num{font-size:clamp(32px,8vw,84px);font-weight:700;width:100%;display:flex;justify-content:center;align-items:center;font-family:GT Sectra Bold, serif;min-width:5ch;color:#AB3850;transition:color 0.8s ease-in-out;}
  #counter.completed .ghf-num{color:#fff;}
  #counter .ghf-label{font-size:clamp(14px,2.5vw,22px);opacity:.85;padding:1rem 0 0.5rem 1rem;font-family:monospace,sans-serif;transition:color 0.8s ease-in-out;}
  #counter.completed .ghf-label{color:#fff;}
  #counter .ghf-date{font-size:12px;opacity:.7;margin-top:.35rem;transition:color 0.8s ease-in-out;}
  #counter.completed .ghf-date{color:#eee;}
  @media (max-width: 680px){ #counter .ghf-wrap{grid-auto-flow:row;justify-content:center;} }
  `;
	const style = document.createElement('style');
	style.textContent = css;
	document.head.appendChild(style);

	// ---- Build UI ----
	root.setAttribute('aria-live', 'polite');
	root.innerHTML = `
    <div class="ghf-wrap" role="group" aria-label="Casualty counters">
      ${TOTALS.map(
				(d) => `
        <section class="ghf-item">
          <div font-family: 'GT Sectra Bold', serif; font-weight: 700;" class="ghf-num" aria-label="${d.label} total">0</div>
          <div style class="ghf-label">${d.label}</div>
          <div class="ghf-date">${DATE_RANGE}</div>
        </section>
      `
			).join('')}
    </div>
  `;
	const numEls = [...root.querySelectorAll('.ghf-num')];

	let rafs = []; // active requestAnimationFrame ids
	let running = false; // prevents double-starts

	const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

	function animateTo(node, to, ms) {
		const start = performance.now();
		function step(now) {
			const t = Math.min(1, (now - start) / ms);
			node.textContent = fmt.format(Math.round(to * easeOutCubic(t)));
			if (t < 1) rafs[rafs.length - 1] = requestAnimationFrame(step);
			else {
				node.textContent = fmt.format(to); // ensure exact final
				// Check if all animations are complete
				if (rafs.length === TOTALS.length) {
					setTimeout(() => root.classList.add('completed'), 200);
				}
			}
		}
		rafs.push(requestAnimationFrame(step));
	}

	function start() {
		if (running) return;
		running = true;
		// start both counts from zero
		numEls.forEach((n) => (n.textContent = '0'));
		TOTALS.forEach((d, i) => animateTo(numEls[i], d.value, DURATION_MS));
	}

	function reset() {
		running = false;
		// cancel any in-flight animations and zero out
		rafs.forEach((id) => cancelAnimationFrame(id));
		rafs = [];
		numEls.forEach((n) => (n.textContent = '0'));
		root.classList.remove('completed');
	}

	// ---- Viewport trigger ----
	const io = new IntersectionObserver(
		([e]) => {
			if (e.isIntersecting) start();
			else reset();
		},
		{ threshold: THRESHOLD }
	);

	io.observe(root);
})();
