<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok, children } = $props();
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class={`content-wrapper ${blok?.backgroundColor || 'bg-white'} ${blok?.backgroundOpacity || ''} ${blok?.size}`}
>
	<div class="content-wrapper--container">
		{#if blok}
			{#each blok.items as item (item._uid)}
				{#if item.component !== 'contentWrapper'}
					<StoryblokComponent blok={item} />
				{/if}
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	</div>
</div>

<style>
	.content-wrapper {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		flex-direction: column;
		row-gap: 1rem;
		width: 80%;
		max-width: 800px;
		margin: 2rem auto;
		/* aspect-ratio: 3/2; */
	}

	@media screen and (max-width: 640px) {
		.content-wrapper {
			width: 90%;
		}
	}

	/* Avoid margin-bottom when two .content-wrapper are next to each other */
	/* @css-ignore */
	:global(.content-wrapper + .content-wrapper) {
		margin: 0 auto 2rem auto;
	}

	div:not(:first-child) {
		margin-top: 2rem;
	}

	.content-wrapper.full {
		width: 100%;
		max-width: 100%;
		margin: 0;
	}

	.content-wrapper--container {
		width: 100%;
	}

	.content-wrapper.full > .content-wrapper--container {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 0;
	}
</style>
