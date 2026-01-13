<script lang="ts">
	/**
	 * HeroVisualization - Single image with src swapping
	 * Images change via direct calls from parent
	 */

	interface Props {
		currentImage: string;
		fadeProgress?: number; // 0-1, controls fade-to-black overlay
	}

	let { currentImage, fadeProgress = 0 }: Props = $props();
</script>

<div class="hero-visualization">
	<img src={currentImage} alt="Assam eviction scene" class="hero-image" />
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
		background: #0a0a0a;
		pointer-events: none;
	}
</style>
