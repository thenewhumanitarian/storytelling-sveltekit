<script lang="ts">
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import type { PageData } from './$types';

	import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';

	const { data }: { data: PageData } = $props();

	// Use `let` since these will be updated
	let story = $state(data.story);

	// Use the STORYBLOK_IS_PREVIEW environment variable to determine if the Visual Editor should be enabled
	const ENABLE_VISUAL_EDITOR = PUBLIC_ENABLE_VISUAL_EDITOR;

	$effect(() => {
		if (ENABLE_VISUAL_EDITOR && story?.id) {
			useStoryblokBridge(story.id, (newStory) => {
				story.content = newStory.content;
			});
		}
	});

	// Reactive effect: Initialize the Storyblok Bridge when the story is available and the preview mode is enabled.
	$effect(() => {
		if (ENABLE_VISUAL_EDITOR && story && story.id) {
			useStoryblokBridge(
				story.id,
				(newStory) => {
					story.content = newStory.content;
				},
				{
					// Optionally adjust or remove preventClicks if you want elements to be clickable
					preventClicks: true,
					resolveLinks: 'url',
					language: 'default'
				}
			);
		}
	});
</script>

<SEO pageTitle={story.content.pageTitle} />

{#if data.error}
	<div class="bg-red-600 text-center text-white">⚠️ Error: {data.error.message}</div>
{:else if story?.content}
	<StoryblokComponent blok={story.content} />
{:else}
	<div class="hidden">Getting Story ready...</div>
{/if}
