<script lang="ts">
	import { onMount } from 'svelte';
	import { reinitStoryblok } from '$lib/utils/storyblok';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import type { PageData } from './$types';

	// import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';

	const { data }: { data: PageData } = $props();

	// Use `let` since these will be updated
	let { story } = data;

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

{#if data.error}
	<div class="bg-red-600 text-center text-white">⚠️ Error: {data.error.message}</div>
{:else if story?.content}
	{#each contentBlocks as blok}
		<StoryblokComponent {blok} />
	{/each}

	{#if footerBlocks.length > 0}
		<footer class="footer-content">
			{#each footerBlocks as blok}
				<StoryblokComponent {blok} />
			{/each}
		</footer>
	{/if}

	{#if story.content.textAnnotations?.length}
		{#each story.content.textAnnotations as annotation}
			<StoryblokComponent blok={annotation} />
		{/each}
	{/if}
{:else}
	<div class="hidden">Getting Story ready...</div>
{/if}

<style>
	:global(.footer-content *:only-child) {
		margin-bottom: 0 !important;
	}
</style>
