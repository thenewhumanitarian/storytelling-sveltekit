<script lang="ts">
	import { onMount } from 'svelte';

	// Display data (kept inline for robustness of the embed)
	const TOTALS = [
		{ label: 'Killed', value: 2957 },
		{ label: 'Wounded', value: 19866 }
	];
	const DATE_RANGE = '1 Jan 2024–9 Sep 2025';
	const STORY_URL =
		'https://www.thenewhumanitarian.org/investigations/2025/09/15/exclusive-israel-has-killed-nearly-3000-gaza-aid-seekers';
	const BG_IMAGE =
		'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2025-09/gaza-data--header.jpg.webp?itok=sMy2BKsD';

	let container: HTMLElement | null = null;
	let numberNodes: HTMLElement[] = [];
	let animationFrameIds: number[] = [];
	let hasRunningAnimation = false;
	const formatter = new Intl.NumberFormat('en-GB');

	// Adjust mode (for social captures)
	let adjustMode = $state(false);
	let adjustWidth = $state(1280);
	let adjustHeight = $state(720);
	let adjustX = $state(0);
	let adjustY = $state(0);

	// Controls panel position (draggable)
	let controlsX = $state(8);
	let controlsY = $state(8);

	// Typographic controls
	let fontSizePx = $state(96) // number size
	let labelGapPx = $state(8) // space between number and label
	let labelFontPx = $state(16)
	let dateFontPx = $state(12)

	// Replay control
	let replayPending = $state(false)
	let suppressAutoStartUntil = 0
	let replayTimer: number | null = null

	function replayWithDelay(delayMs = 5000) {
		if (replayTimer) {
			clearTimeout(replayTimer)
			replayTimer = null
		}
		replayPending = true
		suppressAutoStartUntil = Date.now() + delayMs + 100 // small buffer
		resetAnimation()
		replayTimer = window.setTimeout(() => {
			startAnimation()
			replayPending = false
			replayTimer = null
		}, delayMs)
	}

	function centerBox() {
		if (typeof window === 'undefined') return;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		adjustX = Math.max(0, Math.round((vw - adjustWidth) / 2));
		adjustY = Math.max(0, Math.round((vh - adjustHeight) / 2));
	}

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	function animateNumber(node: HTMLElement, target: number, durationMs: number) {
		const start = performance.now();
		function step(now: number) {
			const t = Math.min(1, (now - start) / durationMs);
			node.textContent = formatter.format(Math.round(target * easeOutCubic(t)));
			if (t < 1) animationFrameIds[animationFrameIds.length - 1] = requestAnimationFrame(step);
			else node.textContent = formatter.format(target);
		}
		animationFrameIds.push(requestAnimationFrame(step));
	}

	function startAnimation() {
		if (hasRunningAnimation) return;
		hasRunningAnimation = true;
		numberNodes.forEach((n) => (n.textContent = '0'));
		TOTALS.forEach((d, i) => animateNumber(numberNodes[i], d.value, 2200));
	}

	function resetAnimation() {
		hasRunningAnimation = false;
		animationFrameIds.forEach((id) => cancelAnimationFrame(id));
		animationFrameIds = [];
		numberNodes.forEach((n) => (n.textContent = '0'));
	}

	function onFramePointerDown(e: PointerEvent) {
		if (!adjustMode) return;
		const startX = e.clientX;
		const startY = e.clientY;
		const boxX = adjustX;
		const boxY = adjustY;
		e.preventDefault();
		function onMove(ev: PointerEvent) {
			adjustX = boxX + (ev.clientX - startX);
			adjustY = boxY + (ev.clientY - startY);
		}
		function onUp() {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	function onControlsDragStart(e: PointerEvent) {
		if (!adjustMode) return;
		const startX = e.clientX;
		const startY = e.clientY;
		const baseX = controlsX;
		const baseY = controlsY;
		e.preventDefault();
		function onMove(ev: PointerEvent) {
			controlsX = baseX + (ev.clientX - startX);
			controlsY = baseY + (ev.clientY - startY);
		}
		function onUp() {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	onMount(() => {
		// Detect adjust mode via query param
		try {
			const params = new URLSearchParams(window.location.search);
			adjustMode = params.get('adjust') === 'true';
		} catch {}

		if (adjustMode) centerBox();

		// Gather number nodes after mount
		numberNodes = Array.from(document.querySelectorAll('[data-counter]')) as HTMLElement[];

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (Date.now() < suppressAutoStartUntil) return
					startAnimation()
				}
				else resetAnimation();
			},
			{ threshold: 0.35 }
		);
		if (container) observer.observe(container);

		// Respect reduced motion
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (media.matches) {
			TOTALS.forEach((d, i) => (numberNodes[i].textContent = formatter.format(d.value)));
		}

		// Re-center if window resizes in adjust mode
		function onResize() {
			if (adjustMode) centerBox();
		}
		window.addEventListener('resize', onResize);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<main class="relative m-0 h-screen w-screen bg-[#111] text-white" aria-labelledby="title">
	<!-- Adjust controls -->
	{#if adjustMode}
		<div class="fixed z-50 space-y-2 rounded bg-black/70 p-3 text-sm shadow-lg backdrop-blur-sm select-none cursor-default"
			style={`left:${controlsX}px;top:${controlsY}px;`}
		>
			<div class="flex items-center justify-between gap-2">
				<div class="font-semibold">Adjust size</div>
				<div class="h-3 w-16 rounded bg-white/30 hover:bg-white/40 cursor-move" onpointerdown={onControlsDragStart} title="Drag panel" aria-label="Drag panel"></div>
			</div>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">W</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="320" max="2160" step="10" bind:value={adjustWidth} oninput={() => adjustMode && centerBox()} />
				<span class="tabular-nums">{adjustWidth}px</span>
			</label>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">H</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="240" max="2160" step="10" bind:value={adjustHeight} oninput={() => adjustMode && centerBox()} />
				<span class="tabular-nums">{adjustHeight}px</span>
			</label>
			<hr class="my-1 border-white/20" />
			<div class="font-semibold">Typography</div>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">Number</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="20" max="300" step="1" bind:value={fontSizePx} />
				<span class="tabular-nums">{fontSizePx}px</span>
			</label>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">Label</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="8" max="72" step="1" bind:value={labelFontPx} />
				<span class="tabular-nums">{labelFontPx}px</span>
			</label>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">Date</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="8" max="72" step="1" bind:value={dateFontPx} />
				<span class="tabular-nums">{dateFontPx}px</span>
			</label>
			<label class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span class="opacity-80">Gap</span>
				<input class="h-2 w-48 cursor-pointer accent-rose-500" type="range" min="0" max="60" step="1" bind:value={labelGapPx} />
				<span class="tabular-nums">{labelGapPx}px</span>
			</label>
			<div class="pt-2">
				<button class="inline-flex items-center gap-2 rounded bg-white/90 px-3 py-1.5 font-semibold text-burgundy hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" onclick={() => replayWithDelay(5000)} disabled={replayPending} aria-label="Replay counters after 5 seconds">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
					{replayPending ? 'Queued (5s)' : 'Play (5s)'}
				</button>
			</div>
			<p class="opacity-80">Drag the frame or this panel to reposition.</p>
		</div>
	{/if}

	<section
		class={adjustMode
			? 'absolute select-none cursor-move overflow-hidden bg-[#121214] bg-cover bg-center'
			: 'relative w-full h-[100svh] overflow-hidden bg-[#121214] bg-cover bg-center'}
		bind:this={container}
		onpointerdown={onFramePointerDown}
		role="group"
		aria-label="Gaza casualties spotlight"
		style={`background-image: url('${BG_IMAGE}');${adjustMode ? ` width:${adjustWidth}px;height:${adjustHeight}px;left:${adjustX}px;top:${adjustY}px;touch-action:none;` : ''}`}
	>
		<div
			class="pointer-events-none absolute inset-0"
			style="background: radial-gradient(120% 90% at 12% 15%, rgba(171,56,80,.45), transparent 60%), linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.78) 100%); background-repeat: no-repeat, no-repeat; background-size: 140% 140%, 100% 100%; background-position: 0% 0%, 0% 0%; animation: gradientDrift 14s ease-in-out infinite alternate;"
		></div>

		<div
			class="cq relative z-[1] grid h-full w-full grid-rows-[1fr_auto] place-items-center p-3 sm:p-4 md:p-6 lg:p-10"
		>
			<h1 id="title" class="sr-only">Gaza casualties spotlight</h1>

			<div
				class="totals-grid grid w-full grid-flow-row items-center gap-4 md:grid-flow-col md:justify-around md:gap-8 lg:gap-16"
			>
				{#each TOTALS as d}
					<section
						class="grid w-full place-items-center text-center md:w-auto"
						aria-label={d.label}
					>
						<div
							class="num font-serif text-5xl font-bold leading-tight text-white drop-shadow-md sm:text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl"
							data-counter
							aria-live="polite"
							style={adjustMode ? `font-size:${fontSizePx}px` : ''}
						>
							0
						</div>
						<div
							class="label mt-1 font-mono text-xs tracking-wide text-white/90 sm:text-sm md:mt-2 md:text-base"
							style={adjustMode ? `margin-top:${labelGapPx}px;font-size:${labelFontPx}px` : ''}
						>
							{d.label}
						</div>
					</section>
				{/each}
			</div>
			<div
				class="date-pill mt-2 rounded bg-black/40 px-2 py-1 text-xs text-white/95 shadow-sm backdrop-blur-sm sm:text-sm lg:mt-4"
				aria-label="Data timeframe"
				style={adjustMode ? `font-size:${dateFontPx}px` : ''}
			>
				{DATE_RANGE}
			</div>
		</div>
	</section>
</main>

<style>
	/* subtle animated overlay */
	@keyframes gradientDrift {
		0% {
			background-position:
				0% 0%,
				0% 0%;
		}
		100% {
			background-position:
				20% 15%,
				0% 0%;
		}
	}

	/* Container query setup */
	.cq { container-type: inline-size; }

	@container (max-width: 560px) {
		.totals-grid { grid-auto-flow: row; justify-items: center; gap: 0.5rem; }
		.num { font-size: 2.25rem; line-height: 1.1; }
		.label { margin-top: 0.25rem; font-size: 0.75rem; }
		.date-pill { font-size: 0.75rem; }
	}
	@container (max-width: 380px) {
		.num { font-size: 1.75rem; }
		.label { font-size: 0.7rem; }
	}
</style>
