<script lang="ts">
	/**
	 * HeroVisualization - "The Editorial Reveal"
	 *
	 * Design: Step 0 shows the image behind a cream overlay with dark text.
	 * As the reader scrolls, the cream fades out revealing the photograph.
	 * Subsequent steps use full-bleed images with dark overlays that
	 * progressively warm toward cream on the final step.
	 *
	 * Visual effects:
	 *   - Cream overlay on step 0 (fades out with scroll)
	 *   - Cross-fading images (clean, no Ken Burns)
	 *   - Progressive veil: dark -> warm brown -> cream
	 *   - Subtle vignette for editorial depth
	 *   - Grain texture overlay for cinematic quality
	 */

	interface Props {
		currentStep: number;
		images: string[];
		fadeProgress?: number; // 0-1, controls final fade-to-cream on last step
		scrollProgress?: number; // 0-1, overall scroll position across hero section
	}

	let { currentStep, images, fadeProgress = 0, scrollProgress = 0 }: Props = $props();

	// Cream overlay: visible on step 0, fades to 0 as we scroll toward step 1
	let creamOpacity = $derived(
		currentStep === 0
			? Math.max(0, 0.75 * (1 - scrollProgress / 0.15))
			: 0
	);

	// Track previous image for cross-fade
	let displayedImage = $state('');
	let previousImage = $state('');
	let isCrossFading = $state(false);
	let crossFadeTimer: ReturnType<typeof setTimeout> | undefined;

	// Cross-fade when currentStep changes the image
	$effect(() => {
		const newImage = images[currentStep] ?? '';
		if (newImage !== displayedImage) {
			// Only cross-fade if at least one side has a real image
			if (newImage || displayedImage) {
				previousImage = displayedImage;
				isCrossFading = true;

				// Clear any existing timer
				if (crossFadeTimer) clearTimeout(crossFadeTimer);

				// End cross-fade after transition duration
				crossFadeTimer = setTimeout(() => {
					isCrossFading = false;
					previousImage = '';
				}, 900);
			}
			displayedImage = newImage;
		}
	});

	// Veil intensity per step: [top, center, bottom] opacity values + warm tint
	// Step 0 has no veil (cream bg); steps 1-5 progress from dark to warm
	const veilConfigs = [
		{ top: 0, center: 0, bottom: 0, warm: 0 },              // Step 0: cream overlay handles this
		{ top: 0, center: 0, bottom: 0, warm: 0 },              // Step 1: spacer (no veil)
		{ top: 0.55, center: 0.38, bottom: 0.55, warm: 0 },      // Step 2: Dhalpur shooting
		{ top: 0.50, center: 0.35, bottom: 0.52, warm: 0 },      // Step 3: Dhalpur aftermath
		{ top: 0.48, center: 0.32, bottom: 0.50, warm: 0.12 },   // Step 4: campaign stats
		{ top: 0.42, center: 0.28, bottom: 0.48, warm: 0.30 },   // Step 5: Wembley
		{ top: 0.35, center: 0.22, bottom: 0.42, warm: 0.45 },   // Step 6: rate statistic
	];

	let veil = $derived(veilConfigs[currentStep] ?? veilConfigs[0]);

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
	<!-- Previous image (fading out during cross-fade) -->
	{#if isCrossFading && previousImage}
		<img
			src={previousImage}
			alt=""
			class="hero-image hero-image-previous"
			aria-hidden="true"
		/>
	{/if}

	<!-- Current image -->
	{#if displayedImage}
		<img
			src={displayedImage}
			alt="Assam eviction scene"
			class="hero-image hero-image-current"
			class:entering={isCrossFading}
		/>
	{/if}

	<!-- Cream overlay: light wash over image on step 0, fades on scroll -->
	{#if creamOpacity > 0}
		<div class="hero-cream-overlay" style:opacity={creamOpacity}></div>
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

	/* Base image styles - both layers share these */
	.hero-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 30%;
	}

	/* Current image — clean cross-fade only */
	.hero-image-current {
		z-index: 2;
		opacity: 1;
		transition: opacity 900ms ease;
		will-change: opacity;
	}

	.hero-image-current.entering {
		animation: fadeIn 900ms ease forwards;
	}

	/* Previous image sits below and fades out */
	.hero-image-previous {
		z-index: 1;
		opacity: 1;
		animation: fadeOut 900ms ease forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	/* Cream overlay — light wash on step 0, fades on scroll */
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

	/* Warm tint overlay - shifts from deep brown toward cream tones
	   Uses a gradient that foreshadows the #f5f0eb article body */
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

	/* Final cream fade overlay */
	.fade-to-cream {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: #f5f0eb;
		pointer-events: none;
		transition: opacity 100ms linear;
	}
</style>
