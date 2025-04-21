<script lang="ts">
	import { StoryblokComponent } from '@storyblok/svelte';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';
	import { onMount } from 'svelte';
	import { useStoryblokBridge } from '@storyblok/svelte';
	import { reinitStoryblok } from '$lib/utils/storyblok';

	export let data;
	let { story } = data;

	// Enable Storyblok bridge ONLY in editor mode (client-side)
	onMount(async () => {
		if (
			typeof window !== 'undefined' &&
			story?.id &&
			(document.body.classList.contains('is-storyblok-editor') ||
				window.location.search.includes('_storyblok'))
		) {
			console.log('Storyblok editor mode detected');
			await reinitStoryblok();
			useStoryblokBridge(story.id, (newStory) => {
				story = {
					...story,
					content: { ...newStory.content },
					timestamp: new Date().getTime()
				};
			});
		}
	});
</script>

<SEO pageTitle={story?.content?.pageTitle} />

{#if data?.error}
	<div class="bg-red-600 p-4 text-center text-white">⚠️ {data.error.message}</div>
{:else if story}
	<StoryblokComponent blok={story.content} />
{:else}
	<div class="text-center">Loading content...</div>
{/if}
