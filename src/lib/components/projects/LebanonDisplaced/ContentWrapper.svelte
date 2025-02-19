<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();
</script>

<div class="content-wrapper" use:storyblokEditable={blok && blok._editable ? blok : undefined}>
	{#if blok}
		{#each blok.items as item (item._uid)}
			{#if item.component !== 'contentWrapper'}
				<StoryblokComponent blok={item} />
			{/if}
		{/each}
	{:else}
		<slot />
	{/if}
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
		margin: 0 auto 2rem auto;
		/* aspect-ratio: 3/2; */
	}

	/* Avoid margin-bottom when two .content-wrapper are next to each other */
	.content-wrapper + .content-wrapper {
		margin: 0 auto 2rem auto;
	}

	.content-wrapper:last-child {
		margin-bottom: 0;
	}

	div:not(:first-child) {
		margin-top: 2rem;
	}
	div:nth-child(odd) {
		background-color: rgba(255, 255, 255, 0.95);
	}

	div:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.95);
	}
</style>
