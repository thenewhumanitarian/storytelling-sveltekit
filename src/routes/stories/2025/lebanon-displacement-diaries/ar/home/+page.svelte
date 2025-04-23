<script lang="ts">
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import type { PageData } from '../$types';

	import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';
	import { useStoryblok } from '$lib/utils/storyblok';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';

	const { data }: { data: PageData } = $props();

	let story = $state(data.story);

	const ENABLE_VISUAL_EDITOR = PUBLIC_ENABLE_VISUAL_EDITOR === 'true';

	// Initialize Storyblok client-side if needed
	$effect(async () => {
		if (ENABLE_VISUAL_EDITOR && typeof window !== 'undefined') {
			await useStoryblok();
		}
	});

	// Setup Storyblok Bridge for live preview
	$effect(() => {
		if (ENABLE_VISUAL_EDITOR && story?.id) {
			useStoryblokBridge(
				story.id,
				(newStory) => {
					story.content = newStory.content;
				},
				{
					preventClicks: true,
					resolveLinks: 'url',
					language: 'ar'
				}
			);
		}
	});
</script>

<SEO
	pageTitle={story?.content?.pageTitle}
	pageDescription={story?.content?.pageDescription}
	pageImage={story?.content?.socialImage?.filename
		? `${story.content.socialImage.filename}/m/1000x552/filters:format(jpg):quality(50)`
		: story.content.socialImage.filename}
/>

{#if data.error}
	<div class="bg-red-600 text-center text-white">⚠️ Error: {data.error.message}</div>
{:else if story?.content}
	<StoryblokComponent blok={story.content} />
{:else}
	<div class="hidden">Getting Story ready...</div>
{/if}
