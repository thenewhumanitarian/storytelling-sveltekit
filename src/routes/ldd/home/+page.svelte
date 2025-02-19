<script lang="ts">
	import { useStoryblok } from '$lib/storyblok';
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const story = $state(data.story);
	let loaded = $state(false);
	const datetime = new Date();

	onMount(async () => {
		await useStoryblok();
		loaded = true;

		useStoryblokBridge(
			data.story.id,
			(newStory) => {
				story.content = newStory.content;
			},
			{
				// resolveRelations: ["popular-articles.articles"],
				preventClicks: true,
				resolveLinks: 'url'
			}
		);
	});

	import ContentWrapper from '$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import HorizontalScroll from '$lib/components/projects/LebanonDisplaced/HorizontalScroll.svelte';
	// import MouseoverBox from '$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte';
</script>

{#if data.error}
	ERROR {data.error.message}
{/if}

{#if !loaded}
	<div class="text-center">Loading...</div>
{:else if story && story.content}
	<StoryblokComponent blok={story.content} />
{:else}
	<div>Getting Story</div>
{/if}

<!-- <ContentWrapper>
	<h1 class="text-xl sm:text-3xl">A few ideas and prototypes for this project.</h1>
</ContentWrapper> -->

<!-- <ContentWrapper backgroundColor={'transparent'}>
	<MouseoverBox object={false} photo={false} />
</ContentWrapper> -->

<ContentWrapper>
	<h2>From the bottom.</h2>
	<FadeIn yOffset={50} blurAmount={10}>
		<p>Hello, I fade in smoothly!</p>
	</FadeIn>
	<code>
		yOffset={50} blurAmount={10}
	</code>
</ContentWrapper>

<ContentWrapper>
	<h2>Default</h2>
	<FadeIn>
		<p>This is the default without setting anything special.</p>
	</FadeIn>
</ContentWrapper>

<ContentWrapper>
	<h2>With delay...</h2>
	<FadeIn delay={1000} duration={1000} blurAmount={10}>
		<p>This paragraph fades in slightly later.</p>
	</FadeIn>
	<code>delay={1000} duration={1000} blurAmount={10}</code>
</ContentWrapper>

<HorizontalScroll />

<ContentWrapper>
	<h2>From the far left</h2>
	<FadeIn xOffset={-1000}>
		<p>This here comes from the far left.</p>
	</FadeIn>
	<code>xOffset=-1000</code>
</ContentWrapper>

<ContentWrapper>
	<h2>From the top left</h2>
	<FadeIn blurAmount={10} xOffset={-50} yOffset={-50}>
		<p>This here comes from the top left and is also un-blurring.</p>
	</FadeIn>
	<code>blurAmount={10} xOffset={-50} yOffset={-50}</code>
</ContentWrapper>

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
