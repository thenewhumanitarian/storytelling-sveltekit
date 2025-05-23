<script lang="ts">
	import { onMount } from 'svelte';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { reinitStoryblok } from '$lib/utils/storyblok';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';
	import HorizontalScroll from '$lib/components/projects/LebanonDisplaced/HorizontalScroll.svelte';

	export let data;
	let { story, relatedDiaries } = data;

	let contentBlocks = story?.content?.body || [];
	let footerBlocks = story?.content?.footer || [];

	// Enable Storyblok bridge in editor mode
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
				contentBlocks = newStory.content.body;
				footerBlocks = newStory.content.footer;
			});
		}
	});
</script>

<SEO
	pageTitle={story?.content?.pageTitle}
	pageTitlePrefix={'Lebanon Displacement Diaries | '}
	pageDescription={story?.content?.pageDescription}
	pageImage={story?.content?.socialImage?.filename
		? `${story.content.socialImage.filename}/m/1000x552/filters:format(jpg):quality(50)`
		: story.content.socialImage.filename}
/>

{#if data?.error}
	<div class="bg-red-600 p-4 text-center text-white">⚠️ {data.error.message}</div>
{:else if story}
	{#each contentBlocks as blok}
		<StoryblokComponent {blok} />
	{/each}

	{#if story.content.textAnnotations?.length}
		{#each story.content.textAnnotations as annotation}
			<StoryblokComponent blok={annotation} />
		{/each}
	{/if}

	{#if relatedDiaries?.length > 0}
		<section class="related-diaries-wrapper mb-8 mt-16">
			<HorizontalScroll items={relatedDiaries} lang="ar" />
		</section>
	{/if}

	{#if footerBlocks.length > 0}
		<footer class="footer-content">
			{#each footerBlocks as blok}
				<StoryblokComponent {blok} />
			{/each}
		</footer>
	{/if}
{:else}
	<div class="text-center">Loading content...</div>
{/if}

<style>
	:global(.footer-content *:only-child) {
		margin-bottom: 0 !important;
	}
</style>
