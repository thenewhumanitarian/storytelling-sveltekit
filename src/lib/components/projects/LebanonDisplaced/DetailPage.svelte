<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div use:storyblokEditable={blok}>
	{#each blok.body as item}
		<div>
			<StoryblokComponent blok={item} />
		</div>
	{/each}
</div>
