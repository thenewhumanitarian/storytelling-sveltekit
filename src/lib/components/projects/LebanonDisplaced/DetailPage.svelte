<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div use:storyblokEditable={blok}>
	{#each blok.body as item}
		<StoryblokComponent blok={item} />
	{/each}
</div>
