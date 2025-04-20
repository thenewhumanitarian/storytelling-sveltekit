<script lang="ts">
	import { onMount } from 'svelte';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { reinitStoryblok } from '$lib/utils/storyblok';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';

	let { data } = $props();
	let story = $state(data.story);

	onMount(async () => {
		if (
			// Check if we are in the Storyblok editor or preview mode
			typeof window !== 'undefined' &&
			story?.id &&
			(document.body.classList.contains('is-storyblok-editor') ||
				window.location.search.includes('_storyblok'))
		) {
			console.log('Storyblok editor mode detected');
			// Re-initialize Storyblok with the current story ID
			await reinitStoryblok();

			// Re-initialize the Storyblok bridge
			useStoryblokBridge(story.id, (newStory) => {
				story = {
					...story,
					content: { ...newStory.content },
					timestamp: new Date().getTime()
				};
			});

			// Wait for the next animation frame to ensure the Storyblok bridge is fully initialized
			await new Promise((r) => requestAnimationFrame(r));
			story = { ...story };
		}
	});
</script>

<SEO pageTitle={story?.content?.pageTitle} />

{#if data.error}
	<div class="bg-red-600 p-4 text-center text-white">⚠️ {data.error.message}</div>
{:else if story}
	{#key story.timestamp}
		<StoryblokComponent blok={story.content} />
	{/key}
{:else}
	<div class="text-center">Loading content...</div>
{/if}
