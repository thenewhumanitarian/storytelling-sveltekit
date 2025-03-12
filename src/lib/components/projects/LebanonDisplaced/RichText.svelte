<script lang="ts">
	import { storyblokEditable, renderRichText } from '@storyblok/svelte';

	const { blok, className } = $props();
</script>

<div
	class={`storyblok--richtext w-full ${blok.textAlign || 'text-left'} ${blok.fontFamily || 'font-sans'} ${className} ${blok.textColor}`}
	use:storyblokEditable={blok}
>
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
	:global(.storyblok--richtext h1) {
		font-weight: bold;
		font-family: 'ff-amman-serif-pro', serif;
	}
	:global(.storyblok--richtext h1) {
		margin-bottom: 0.75rem;
	}
	:global(.storyblok--richtext h2) {
		margin: 0;
		font-family: 'ff-amman-serif-pro', serif;
		font-weight: 900;
		font-size: 2rem;
	}

	:global(.storyblok--richtext h3) {
		margin: 0;
		font-family: 'ff-amman-serif-pro', serif;
		font-weight: 900;
		font-size: 1.1rem;
	}

	:global(.storyblok--richtext p) {
		display: block;
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}
	:global(.storyblok--richtext.h2-pacifico h2) {
		font-family: 'ff-amman-serif-pro', serif;
		font-size: 1.8rem;
		line-height: 1.25;
		margin-bottom: 0;
	}

	:global(.storyblok--richtext .font-amman *) {
		font-family: 'ff-amman-serif-pro', serif !important;
	}

	@media screen and (max-width: 640px) {
		:global(h2) {
			font-size: 1.4rem;
			line-height: 1;
		}
	}

	:global(.font-sans *) {
		font-family: 'Roboto', sans-serif;
	}
	:global(.font-serif *) {
		font-family: 'GT Sectra Fine', serif;
	}
	:global(.font-pacifico *) {
		font-family: 'ff-amman-serif-pro', serif;
	}
</style>
