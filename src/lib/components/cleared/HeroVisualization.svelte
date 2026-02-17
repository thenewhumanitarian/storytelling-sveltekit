<script lang="ts">
	/**
	 * HeroVisualization - Single image with src swapping
	 * Images change via direct calls from parent
	 */

	interface Props {
		currentImage: string;
		fadeProgress?: number; // 0-1, controls fade-to-black overlay
		useContain?: boolean; // For stadium images - use object-fit: contain on desktop
	}

	let { currentImage, fadeProgress = 0, useContain = false }: Props = $props();
</script>

<div class="hero-visualization">
	{#if currentImage}
		<img src={currentImage} alt="Assam eviction scene" class="hero-image" class:contain-mode={useContain} />
	{:else}
		<div class="placeholder-bg"></div>
	{/if}
	<div class="hero-overlay"></div>
	{#if fadeProgress > 0}
		<div class="fade-overlay" style:opacity={fadeProgress}></div>
	{/if}
</div>

<style>
	.hero-visualization {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #000;
	}

	.hero-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Contain mode for stadium images - show full width with dark background */
	.hero-image.contain-mode {
		object-fit: contain;
		background: #0a0a0a;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
	}

	/* On mobile, crop from left with cover behavior */
	@media (max-width: 768px) {
		.hero-image.contain-mode {
			object-fit: cover;
			object-position: left center;
		}
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.5) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.5) 100%
		);
	}

	.fade-overlay {
		position: absolute;
		inset: 0;
		background: #f5f0eb;
		pointer-events: none;
	}

	.placeholder-bg {
		position: absolute;
		inset: 0;
		background: #f5f0eb;
	}
</style>
