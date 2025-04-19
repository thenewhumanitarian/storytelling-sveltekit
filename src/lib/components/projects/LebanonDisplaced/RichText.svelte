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
