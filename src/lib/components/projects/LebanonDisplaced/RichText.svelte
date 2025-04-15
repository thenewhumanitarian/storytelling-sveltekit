<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { mount } from 'svelte'; // ✅ this is key
	import { richTextResolver } from '@storyblok/richtext';

	import InlineImage from '$lib/components/projects/LebanonDisplaced/InlineImage.svelte';
	import PullQuote from '$lib/components/projects/LebanonDisplaced/PullQuote.svelte';

	const { blok, className } = $props();

	const { render } = richTextResolver({
		resolvers: {
			blok: (node) => {
				const blok = node.attrs?.body?.[0];
				if (blok?.component === 'inlineImage') {
					return `<inline-image data-blok='${JSON.stringify(blok)}'></inline-image>`;
				}
				if (blok?.component === 'pullQuote') {
					return `<pull-quote data-blok='${JSON.stringify(blok)}'></pull-quote>`;
				}
				return '';
			}
		}
	});

	if (!customElements.get('inline-image')) {
		customElements.define(
			'inline-image',
			class extends HTMLElement {
				connectedCallback() {
					const blok = JSON.parse(this.getAttribute('data-blok') || '{}');
					mount(InlineImage, {
						target: this,
						props: { blok }
					});
				}
			}
		);
	}

	if (!customElements.get('pull-quote')) {
		customElements.define(
			'pull-quote',
			class extends HTMLElement {
				connectedCallback() {
					const blok = JSON.parse(this.getAttribute('data-blok') || '{}');
					mount(PullQuote, {
						target: this,
						props: { blok }
					});
				}
			}
		);
	}
</script>

<div
	class={`storyblok--richtext w-full ${blok.textAlign || 'text-left'} ${blok.fontFamily || 'font-sans'} ${className} ${blok.textColor} ${blok.fontSize}`}
	use:storyblokEditable={blok}
>
	{#if blok.text}
		{@html render(blok.text)}
	{:else if blok}
		{@html render(blok)}
	{/if}
</div>

<style>
	:global(.storyblok--richtext) {
		display: block;
	}
	:global(.storyblok--richtext h1) {
		font-weight: bold;
		font-family: 'GT Sectra Fine', sans-serif;
		font-weight: bold;
		/* font-family: 'ff-amman-serif-pro', serif; */
		margin-bottom: 0;
		font-size: 4rem;
		line-height: 0.875;
		margin-bottom: 0.75rem;
		letter-spacing: -2px;
	}
	:global(.storyblok--richtext h2) {
		margin: 0 0 1rem 0;
		font-family: 'GT Sectra Fine', sans-serif;
		font-weight: bold;
		/* font-family: 'ff-amman-serif-pro', serif; */
		font-weight: 900;
		font-size: 2rem;
	}
	:global(.storyblok--richtext h3) {
		margin: 0 0 1rem 0;
		font-weight: bold;
		line-height: auto;
		font-family: 'GT Sectra Bold', serif;
		font-size: 1.4rem;
	}
	:global(.storyblok--richtext > img) {
		float: left;
		max-width: 50%;
		margin-left: -25%;
		padding-right: 2.5%;
	}

	@media screen and (max-width: 945px) {
		:global(.storyblok--richtext > img) {
			width: 100%;
			margin: 2rem auto;
			float: none;
			max-width: 100%;
		}
	}

	@media screen and (max-width: 640px) {
		:global(.storyblok--richtext h1) {
			font-size: 2.3rem !important;
		}
		:global(.storyblok--richtext h2) {
			font-size: 1.8rem !important;
		}
	}

	:global(.storyblok--richtext p) {
		display: block;
		white-space: normal;
		font-size: 1.2rem;
		word-wrap: break-word;
		overflow-wrap: break-word;
		font-weight: medium;
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}
	:global(.storyblok--richtext.h2-pacifico h2) {
		font-family: 'GT Sectra Bold', serif;
		/* font-family: 'ff-amman-serif-pro', serif; */
		font-size: 1.8rem;
		line-height: 1.25;
		margin-bottom: 0;
	}

	:global(.storyblok--richtext .font-amman *) {
		font-family: 'GT Sectra Bold', serif !important;
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
		font-family: 'GT Sectra Bold', serif;
		/* font-family: 'ff-amman-serif-pro', serif; */
	}

	/* Arabic text styles */
	:global(.arabic *) {
		direction: rtl;
	}

	:global(.arabic *:not(.text-center, .text-right)) {
		text-align: right;
	}

	:global(.arabic *.text-center *, .arabic.text-center *) {
		text-align: center;
	}
</style>
