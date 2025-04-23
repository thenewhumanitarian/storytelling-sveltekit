<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	// import FadeIn from '$lib/components/animations/FadeIn.svelte';
	const { blok } = $props();
</script>

<div
	class="line-break-container group border-t-[0.5px] border-lebblack font-serif font-bold text-lebblack"
	use:storyblokEditable={blok}
>
	{#if blok.image?.filename}
		<div class="line-break-image--wrapper before bg-grass">
			<div class="line-break-image--container">
				<img
					class="line-break-image before"
					src={`${blok.image.filename}/m/40x0`}
					alt={blok.image.alt || 'Photo alt text is missing.'}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.line-break-container {
		position: relative;
		text-align: center;
		margin: 2.5rem auto;
	}

	.line-break-image--wrapper {
		position: absolute;
		width: auto;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		/* box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px; */
	}

	.line-break-image {
		width: 2rem;
		position: relative;
		opacity: 0.8;
		/* will-change: opacity, width, filter;
		transition: all 0.8s;
		transition-behavior: cubic-bezier(0.4, 0, 0.2, 1); */
	}

	.line-break-container:hover .line-break-image {
		opacity: 0.8;
		width: 1.4rem;
		filter: none;
	}

	.line-break-image--wrapper.before {
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	@keyframes floatEffect {
		0% {
			transform: translateY(-0.5px);
			scale: 1;
		}
		50% {
			transform: translateY(0.5px);
			scale: 1.015;
		}
		100% {
			scale: 1;
			transform: translateY(-0.5px);
		}
	}
</style>
