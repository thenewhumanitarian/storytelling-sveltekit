<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte'; // ✅ correct import
	import { richTextResolver } from '@storyblok/richtext';

	import InlineImage from '$lib/components/projects/LebanonDisplaced/InlineImage.svelte';
	import PullQuote from '$lib/components/projects/LebanonDisplaced/PullQuote.svelte';
	import LineBreak from '$lib/components/projects/LebanonDisplaced/LineBreak.svelte';
	import { mount } from 'svelte';

	const { blok, className } = $props();

	function escapeHTML(str: string) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	const { render } = richTextResolver({
		resolvers: {
			blok: (node) => {
				const blok = node.attrs?.body?.[0];
				if (blok?.component === 'inlineImage') {
					return `<inline-image data-blok="${escapeHTML(JSON.stringify(blok))}"></inline-image>`;
				}
				if (blok?.component === 'pullQuote') {
					return `<pull-quote data-blok='${escapeHTML(JSON.stringify(blok))}'></pull-quote>`;
				}
				if (blok?.component === 'lineBreak') {
					return `<line-break data-blok='${escapeHTML(JSON.stringify(blok))}'></line-break>`;
				}
				return '';
			}
		}
	});

	// ✅ Wrap customElements in onMount
	onMount(() => {
		if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
			if (!customElements.get('inline-image')) {
				customElements.define(
					'inline-image',
					class extends HTMLElement {
						connectedCallback() {
							const blok = JSON.parse(this.getAttribute('data-blok') || '{}');
							mount(InlineImage, { target: this, props: { blok } });
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
							mount(PullQuote, { target: this, props: { blok } });
						}
					}
				);
			}

			if (!customElements.get('line-break')) {
				customElements.define(
					'line-break',
					class extends HTMLElement {
						connectedCallback() {
							const blok = JSON.parse(this.getAttribute('data-blok') || '{}');
							mount(LineBreak, { target: this, props: { blok } });
						}
					}
				);
			}
		}
	});
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
		font-family: 'GT Sectra Bold', sans-serif;
		margin-bottom: 0;
		font-size: 4rem;
		line-height: 0.875;
		margin-bottom: 0.75rem;
		letter-spacing: -2px;
	}
	:global(.storyblok--richtext h2) {
		margin: 0 0 1rem 0;
		font-family: 'GT Sectra Bold', sans-serif;
		font-weight: 900;
		font-size: 2rem;
	}

	:global(.storyblok--richtext h3) {
		margin: 0 0 1.25rem 0;
		font-family: 'GT Sectra Bold', serif;
		font-size: 1.4rem;
	}

	:global(.storyblok--richtext p) {
		display: block;
		white-space: normal;
		font-size: 1.1rem;
		word-wrap: break-word;
		overflow-wrap: break-word;
		font-weight: medium;
		line-height: 1.25;
	}

	:global(.storyblok--richtext a:hover) {
		text-decoration: underline;
	}

	/* Responsive font sizes */
	@media screen and (max-width: 640px) {
		:global(.storyblok--richtext h1) {
			font-size: 2.3rem !important;
		}
		:global(.storyblok--richtext h2) {
			font-size: 1.8rem !important;
			line-height: 1;
		}

		:global(.storyblok--richtext h3) {
			font-size: 1.2rem !important;
			line-height: 1.3;
		}
	}
	:global(.storyblok--richtext > img) {
		float: left;
		max-width: 50%;
		margin-left: -25%;
		padding-right: 2.5%;
	}

	:global(.storyblok--richtext hr) {
		border-color: #282828;
		margin: 1rem auto !important;
	}

	@media screen and (max-width: 945px) {
		:global(.storyblok--richtext > img) {
			width: 100%;
			margin: 2rem auto;
			float: none;
			max-width: 100%;
		}
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}

	:global(.storyblok--richtext p:not(:last-child)) {
		margin-bottom: 1rem;
	}

	:global(
		.storyblok--richtext
			*:not(figure, .inline-image-wrapper, .pull-quote-container, blockquote p):last-child
	) {
		margin-bottom: 0;
	}

	:global(.font-sans *) {
		font-family: 'Roboto', sans-serif;
	}
	:global(.font-serif *) {
		font-family: 'GT Sectra Bold', serif;
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
