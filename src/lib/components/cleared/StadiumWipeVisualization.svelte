<script lang="ts">
	/**
	 * StadiumWipeVisualization - Image scrolly with horizontal wipe
	 *
	 * Step 0: image2.jpg (family in shelter) with dark veil
	 * Step 1: Cross-fade to stadium-full.jpg (Narendra Modi Stadium, packed crowd) with dark veil
	 * Step 2: Horizontal wipe reveals stadium-empty.jpg (empty Modi Stadium)
	 *
	 * Wipe uses CSS clip-path driven by scroll progress within step 2.
	 */

	interface CreditInfo {
		label: string;
		detail?: string;
	}

	interface Props {
		activeStep: number;
		scrollProgress?: number;
		fadeInProgress?: number;
		credits?: CreditInfo[];
	}

	let { activeStep, scrollProgress = 0, fadeInProgress = 0, credits }: Props = $props();

	const totalSteps = 3;
	const stepFraction = 1 / totalSteps;

	// Calculate wipe progress for step 2 (0->1 as we scroll through that step)
	let wipeProgress = $derived(() => {
		if (activeStep < 2) return 0;
		if (activeStep > 2) return 1;
		// Within step 2: map scroll position to 0-1
		const stepStart = 2 * stepFraction;
		const raw = (scrollProgress - stepStart) / stepFraction;
		return Math.max(0, Math.min(1, raw));
	});

	// Clip-path: inset(0 RIGHT 0 0) - RIGHT grows from 0% to 100% for left-to-right wipe
	let clipRight = $derived(`${wipeProgress() * 100}%`);

	// Veil configs per step
	const veilConfigs = [
		{ top: 0.55, center: 0.38, bottom: 0.55, warm: 0 },     // Step 0: shelter image
		{ top: 0.48, center: 0.32, bottom: 0.50, warm: 0.12 },   // Step 1: full Modi Stadium
		{ top: 0.30, center: 0.18, bottom: 0.38, warm: 0.25 },   // Step 2: wipe to empty
	];

	let veil = $derived(veilConfigs[activeStep] ?? veilConfigs[0]);

	let overlayGradient = $derived(
		`linear-gradient(
			to bottom,
			rgba(0, 0, 0, ${veil.top}) 0%,
			rgba(0, 0, 0, ${veil.center}) 35%,
			rgba(0, 0, 0, ${veil.center}) 65%,
			rgba(0, 0, 0, ${veil.bottom}) 100%
		)`
	);

	// Fade to cream on the final portion of scroll (step 2)
	let fadeProgress = $derived(() => {
		if (activeStep !== 2) return 0;
		const fadeStart = 0.85;
		if (scrollProgress < fadeStart) return 0;
		return Math.min(1, (scrollProgress - fadeStart) / (1 - fadeStart));
	});
</script>

<div class="stadium-visualization">
	<!-- Contained 16:9 frame for images -->
	<div class="stadium-frame">
		<!-- Layer 1: Empty Modi Stadium - always underneath, revealed by wipe -->
		<img
			src="/images/cleared/stadium/stadium-empty.jpg"
			alt="Empty Narendra Modi Stadium representing displaced population"
			class="stadium-image stadium-empty"
		/>

		<!-- Layer 2: Full Modi Stadium - clips away left-to-right during step 2 -->
		<img
			src="/images/cleared/stadium/stadium-full.jpg"
			alt="Narendra Modi Stadium packed with 132,000 people"
			class="stadium-image stadium-full"
			style:clip-path="inset(0 {clipRight} 0 0)"
		/>

		<!-- Layer 3: image2.jpg (shelter) - visible on step 0, fades out on step 1 -->
		<img
			src="/images/cleared/stadium/image2.jpg"
			alt="Family in makeshift shelter after eviction"
			class="stadium-image stadium-shelter"
			class:faded={activeStep >= 1}
		/>

		<!-- Dark veil overlay -->
		<div
			class="stadium-veil"
			style:background={overlayGradient}
		></div>

		<!-- Vignette -->
		<div class="stadium-vignette"></div>

		<!-- Film grain -->
		<div class="stadium-grain"></div>

		<!-- Image credit bubble -->
		{#if credits?.[activeStep]}
			<div class="credit-bubble" class:has-detail={credits[activeStep].detail}>
				<span class="credit-label">{credits[activeStep].label}</span>
				{#if credits[activeStep].detail}
					<span class="credit-detail">{credits[activeStep].detail}</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Fade-from-cream: gradient covering top half (full viewport) -->
	{#if fadeInProgress > 0}
		<div class="fade-from-cream" style:opacity={fadeInProgress}></div>
	{/if}

	<!-- Fade to cream at section end (full viewport) -->
	{#if fadeProgress() > 0}
		<div class="fade-to-cream" style:opacity={fadeProgress()}></div>
	{/if}
</div>

<style>
	.stadium-visualization {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #f5f0eb;
		overflow: hidden;
	}

	/* Contained 16:9 frame */
	.stadium-frame {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: calc(100% - 4rem);
		max-width: 64rem;
		aspect-ratio: 16 / 9;
		border-radius: 4px;
		overflow: hidden;
	}

	.stadium-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 30%;
	}

	/* Bottom layer: empty stadium, always present */
	.stadium-empty {
		z-index: 1;
		filter: saturate(0.8);
	}

	/* Middle layer: full stadium, clips left-to-right during wipe */
	.stadium-full {
		z-index: 2;
		opacity: 1;
	}

	/* Top layer: shelter image, fades out */
	.stadium-shelter {
		z-index: 3;
		opacity: 1;
		transition: opacity 900ms ease;
	}

	.stadium-shelter.faded {
		opacity: 0;
	}

	/* Dark veil overlay (inside frame) */
	.stadium-veil {
		position: absolute;
		inset: 0;
		z-index: 4;
		transition: background 700ms ease;
		pointer-events: none;
	}

	/* Vignette (inside frame) */
	.stadium-vignette {
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

	/* Film grain (inside frame) */
	.stadium-grain {
		position: absolute;
		inset: 0;
		z-index: 6;
		opacity: 0.035;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		background-size: 128px 128px;
	}

	/* Fade-from-cream overlay - gradient covering top half (full viewport) */
	.fade-from-cream {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: linear-gradient(to bottom, #f5f0eb 0%, transparent 50%);
		pointer-events: none;
		transition: opacity 100ms linear;
	}

	/* Fade to cream - gradient covering bottom half (full viewport) */
	.fade-to-cream {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: linear-gradient(to bottom, transparent 50%, #f5f0eb 100%);
		pointer-events: none;
		transition: opacity 100ms linear;
	}

	@media (max-width: 640px) {
		.stadium-frame {
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			transform: none;
			aspect-ratio: auto;
			border-radius: 0;
		}
	}

	@media (min-width: 641px) {
		.fade-from-cream,
		.fade-to-cream {
			display: none;
		}
	}

	/* Image credit bubble */
	.credit-bubble {
		position: absolute;
		bottom: 10px;
		right: 10px;
		z-index: 7;
		background: rgba(0, 0, 0, 0.55);
		color: rgba(255, 255, 255, 0.85);
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.6rem;
		letter-spacing: 0.02em;
		padding: 4px 10px;
		border-radius: 100px;
		pointer-events: none;
		white-space: nowrap;
		transition: opacity 300ms ease;
	}

	.credit-bubble.has-detail {
		border-radius: 6px;
		padding: 5px 10px;
		white-space: normal;
		max-width: 280px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.credit-detail {
		font-size: 0.52rem;
		opacity: 0.7;
		line-height: 1.3;
	}

	@media (max-width: 640px) {
		.credit-bubble {
			bottom: 8px;
			right: 8px;
			font-size: 0.55rem;
			padding: 3px 8px;
		}

		.credit-bubble.has-detail {
			max-width: 220px;
		}

		.credit-detail {
			font-size: 0.48rem;
		}
	}
</style>
