<script lang="ts">
	import { useStoryblok } from '$lib/storyblok';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	// ✅ Environment variable for SSR vs. Visual Editor
	const ENABLE_VISUAL_EDITOR = import.meta.env.PUBLIC_ENABLE_VISUAL_EDITOR === 'true';

	// ✅ Reactive State
	const story = $state(data.story);
	const loaded = $state(false);

	// ✅ Enable Storyblok Bridge *only* in preview mode
	$effect(() => {
		if (ENABLE_VISUAL_EDITOR && story?.id) {
			useStoryblokBridge(story.id, (newStory) => {
				story.content = newStory.content;
			});
		}
	});

	import ContentWrapper from '$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import HorizontalScroll from '$lib/components/projects/LebanonDisplaced/HorizontalScroll.svelte';
</script>

{#if data.error}
	<div class="text-center text-red-600">⚠️ Error: {data.error.message}</div>
{/if}

{#if !story}
	<div class="text-center">📦 Loading Story...</div>
{:else}
	<StoryblokComponent blok={story.content} />
{/if}

<HorizontalScroll />

<style>
	h1 {
		font-weight: bold;
	}
	h1,
	h2 {
		margin: 0;
	}
	h2 {
		font-family: 'Pacifico', cursive;
		font-size: 1.8rem;
		line-height: 1.25;
	}

	@media screen and (max-width: 640px) {
		h2 {
			font-size: 1.4rem;
			line-height: 1;
		}
	}
	code {
		color: #282828;
		background: #ddd;
		padding: 0.5rem 1rem;
	}

</style>
