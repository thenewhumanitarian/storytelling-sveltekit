<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();
</script>

<div class="animation-container" use:storyblokEditable={blok && blok._editable ? blok : undefined}>
	{#if blok.images}
		{#each blok.images as item, i (item._uid)}
			<StoryblokComponent blok={item} {i} style="grid-column: span {item.colSpan || 1};" />
		{/each}
	{/if}
</div>

<style>
	.animation-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		overflow: hidden;
	}
</style>
