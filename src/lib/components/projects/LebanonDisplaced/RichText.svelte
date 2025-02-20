<script lang="ts">
	import { storyblokEditable, renderRichText } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div class="storyblok--richtext h2-pacifico" use:storyblokEditable={blok}>
	{#if blok.text}
		{@html renderRichText(blok.text)}
	{:else if blok}
		{@html renderRichText(blok)}
	{/if}
</div>

<style>
	:global(.storyblok--richtext) {
		display: block;
	}
	.storyblok--richtext h1 {
		font-weight: bold;
	}
	.storyblok--richtext h1,
	.storyblok--richtext h2 {
		margin: 0;
	}
	:global(.storyblok--richtext.h2-pacifico h2) {
		font-family: 'Pacifico', cursive;
		font-size: 1.8rem;
		line-height: 1.25;
		margin-bottom: 0;
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
