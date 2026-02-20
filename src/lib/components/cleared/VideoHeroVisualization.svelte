<script lang="ts">
	/**
	 * VideoHeroVisualization - Video background hero with editorial overlays
	 *
	 * Replaces HeroVisualization for the hero section. Uses a looping
	 * background video instead of cross-fading images, keeping the same
	 * multi-layer overlay system (cream fade, dark veil, warm tint,
	 * vignette, grain, fade-to-cream).
	 */

	interface Props {
		currentStep: number;
		fadeProgress?: number;
		fadeInProgress?: number;
		scrollProgress?: number;
		videoSrc: string;
		overlayConfig?: { top: number; center: number; bottom: number; warm: number }[];
		showCreamOverlay?: boolean;
	}

	let { currentStep, fadeProgress = 0, fadeInProgress = 0, scrollProgress = 0, videoSrc, overlayConfig, showCreamOverlay = true }: Props = $props();

	// Cream overlay: visible on step 0, fades to 0 as we scroll toward step 1
	let creamOpacity = $derived(
		currentStep === 0
			? Math.max(0, 0.75 * (1 - scrollProgress / 0.15))
			: 0
	);

	// Veil intensity per step - kept minimal so video stays visible throughout
	const defaultVeilConfigs = [
		{ top: 0, center: 0, bottom: 0, warm: 0 },   // Step 0: cream overlay handles this
		{ top: 0, center: 0, bottom: 0, warm: 0 },   // Step 1: video plays behind text
		{ top: 0, center: 0, bottom: 0, warm: 0 },   // Step 2: video plays behind text
	];

	let veil = $derived((overlayConfig ?? defaultVeilConfigs)[currentStep] ?? (overlayConfig ?? defaultVeilConfigs)[0]);

	// Build the overlay gradient CSS
	let overlayGradient = $derived(
		`linear-gradient(
			to bottom,
			rgba(0, 0, 0, ${veil.top}) 0%,
			rgba(0, 0, 0, ${veil.center}) 35%,
			rgba(0, 0, 0, ${veil.center}) 65%,
			rgba(0, 0, 0, ${veil.bottom}) 100%
		)`
	);

	// Warm tint overlay opacity
	let warmOverlayOpacity = $derived(veil.warm);
</script>

<div class="hero-visualization">
	<!-- Background video -->
	<video
		autoplay
		muted
		loop
		playsinline
		preload="auto"
		class="hero-video"
		aria-hidden="true"
	>
		<source src={videoSrc} type="video/mp4" />
	</video>

	<!-- Cream overlay: light wash over video on step 0, fades on scroll (hero only) -->
	{#if showCreamOverlay && creamOpacity > 0}
		<div class="hero-cream-overlay" style:opacity={creamOpacity}></div>
	{/if}

	<!-- Fade-from-cream: gradient covering top half (mirrors fade-to-cream) -->
	{#if fadeInProgress > 0}
		<div class="fade-from-cream" style:opacity={fadeInProgress}></div>
	{/if}

	<!-- Dark veil overlay (gradient, transitions between steps) -->
	<div
		class="hero-veil"
		style:background={overlayGradient}
	></div>

	<!-- Warm tint overlay (shifts from brown toward cream tones) -->
	{#if warmOverlayOpacity > 0}
		<div
			class="hero-warm-tint"
			style:opacity={warmOverlayOpacity}
		></div>
	{/if}

	<!-- Subtle vignette for editorial depth -->
	<div class="hero-vignette"></div>

	<!-- Film grain texture for cinematic quality -->
	<div class="hero-grain"></div>

	<!-- Final fade-to-cream overlay (driven by scroll progress on last step) -->
	{#if fadeProgress > 0}
		<div class="fade-to-cream" style:opacity={fadeProgress}></div>
	{/if}
</div>

<style>
	.hero-visualization {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #1a1714;
		overflow: hidden;
		transition: background 700ms ease;
		animation: heroMountFade 1s ease forwards;
	}

	@keyframes heroMountFade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.hero-video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 30%;
		z-index: 1;
	}

	/* Cream overlay - light wash on step 0, fades on scroll */
	.hero-cream-overlay {
		position: absolute;
		inset: 0;
		z-index: 7;
		background: #f5f0eb;
		pointer-events: none;
	}

	/* Dark veil overlay - transitions smoothly between step configs */
	.hero-veil {
		position: absolute;
		inset: 0;
		z-index: 3;
		transition: background 700ms ease;
		pointer-events: none;
	}

	/* Warm tint overlay - shifts from deep brown toward cream tones */
	.hero-warm-tint {
		position: absolute;
		inset: 0;
		z-index: 4;
		background: linear-gradient(
			to bottom,
			rgba(62, 48, 36, 0.55) 0%,
			rgba(80, 62, 42, 0.35) 40%,
			rgba(100, 80, 55, 0.30) 60%,
			rgba(62, 48, 36, 0.50) 100%
		);
		transition: opacity 700ms ease;
		pointer-events: none;
	}

	/* Subtle vignette for editorial depth */
	.hero-vignette {
		position: absolute;
		inset: 0;
		z-index: 5;
		background: radial-gradient(
			ellipse at center,
			transparent 45%,
			rgba(0, 0, 0, 0.18) 100%
		);
		pointer-events: none;
	}

	/* Film grain overlay for cinematic texture */
	.hero-grain {
		position: absolute;
		inset: 0;
		z-index: 6;
		opacity: 0.035;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		background-size: 128px 128px;
	}

	/* Fade-from-cream overlay - gradient covering top half */
	.fade-from-cream {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: linear-gradient(to bottom, #f5f0eb 0%, transparent 50%);
		pointer-events: none;
		transition: opacity 100ms linear;
	}

	/* Final cream fade overlay - gradient covering bottom half */
	.fade-to-cream {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: linear-gradient(to bottom, transparent 50%, #f5f0eb 100%);
		pointer-events: none;
		transition: opacity 100ms linear;
	}
</style>
