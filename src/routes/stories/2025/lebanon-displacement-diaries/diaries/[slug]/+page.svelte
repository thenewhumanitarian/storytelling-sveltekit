<script lang="ts">
	import { StoryblokComponent } from '@storyblok/svelte';
	import SEO from '$lib/components/projects/LebanonDisplaced/SEO.svelte';

	let { data } = $props();
</script>

<SEO pageTitle={data.story?.content?.pageTitle} />

{#if data.error}
	<div class="bg-red-600 p-4 text-center text-white">⚠️ {data.error.message}</div>
{:else if data.story}
	<StoryblokComponent blok={data.story.content} />
{:else}
	<div class="text-center">Loading content...</div>
{/if}
