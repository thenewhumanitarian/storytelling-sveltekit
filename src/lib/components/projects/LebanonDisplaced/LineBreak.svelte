<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
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
					src={`${blok.image.filename}/m/60x0`}
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
	}

	.line-break-image {
		width: 2rem;
		position: relative;
		opacity: 0.8;
	}

	.line-break-image--wrapper.before {
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
