<script lang="ts">
	import { onMount } from 'svelte';
	import { storyblokEditable } from '@storyblok/svelte';
	import { richTextResolver } from '@storyblok/richtext';
	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';

	const { blok } = $props();

	const { render } = richTextResolver();

	function escapeRegExp(string: string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	onMount(() => {
		if (!blok?.identifier || !blok?.text) return;

		// console.log('TextAnnotation mounted', blok);

		const searchWord = blok.identifier.toLowerCase();
		const tooltipContent = blok.text ? render(blok.text) : '';
		const targetOccurrence = blok.occurrence ? parseInt(blok.occurrence) : null;

		let globalMatchIndex = 0; // 🧠 Global counter across all matches

		const regex = new RegExp(`(${escapeRegExp(blok.identifier)})`, 'gi');

		// 🚀 Find all .content-wrapper elements
		const contentWrappers = document.querySelectorAll('.content-wrapper');

		contentWrappers.forEach((wrapper) => {
			const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT);
			const textNodes: Text[] = [];
			let node;
			while ((node = walker.nextNode())) {
				textNodes.push(node as Text);
			}

			textNodes.forEach((node) => {
				const nodeText = node.textContent;
				if (!nodeText || !nodeText.toLowerCase().includes(searchWord)) return;
				if (node.parentElement?.closest('.text-annotation')) return;

				const parts = nodeText.split(regex);

				if (parts.length <= 1) return;

				const frag = document.createDocumentFragment();

				parts.forEach((part) => {
					if (part.toLowerCase() === searchWord) {
						globalMatchIndex += 1;

						const shouldHighlight = !targetOccurrence || globalMatchIndex === targetOccurrence;

						if (shouldHighlight) {
							const span = document.createElement('span');
							span.textContent = part;
							span.classList.add('text-annotation');
							tippy(span, {
								content: tooltipContent,
								allowHTML: true,
								placement: 'top',
								interactiveDebounce: 50,
								inertia: true,
								theme: 'light',
								delay: [100, 50]
								// interactive: true,
							});
							frag.appendChild(span);
						} else {
							frag.appendChild(document.createTextNode(part));
						}
					} else {
						frag.appendChild(document.createTextNode(part));
					}
				});

				node.parentNode?.replaceChild(frag, node);
			});
		});
	});
</script>

<div use:storyblokEditable={blok} class="hidden"></div>

<style>
	/* Example: override light-border theme */
	:global(.tippy-box[data-theme~='light']) {
		background-color: #636845;
		font-style: normal; /* specifically fix italic inheritance */
		font-weight: normal;
		font-size: 1rem;
		padding: 0.1rem 0;
		border-radius: 0;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		/* background-color: #f8e1bc; */
		/* color: #282828; */
	}

	:global(.tippy-content *) {
		color: white !important;
	}

	/* Fix the arrow color (svg fill) */
	:global(.tippy-box[data-theme~='light'][data-placement^='top'] > .tippy-arrow::before) {
		border-top-color: #636845 !important;
		/* border-topa-color: #f8e1bc !important; */
	}

	:global(.tippy-box[data-theme~='light'][data-placement^='bottom'] > .tippy-arrow::before) {
		border-bottom-color: #636845 !important;
		/* border-bottom-color: #f8e1bc !important; */
	}

	:global(.tippy-content) {
		display: block;
		width: 100%;
		padding: 0.3rem 0.5rem;
		border-radius: 2px;
	}

	:global(.tippy-content > p) {
		margin: 0;
		/* font-family: 'ff-amman-serif-pro', serif; */
	}

	:global(.tippy-content *) {
		text-decoration: none;
		font-size: 0.9rem !important;
		font-family: 'Roboto', sans-serif !important;
		width: 100%;
		text-align: left;
	}

	:global(.arabic .tippy-content *) {
		text-align: right;
		direction: rtl;
	}

	/* Annotated text */
	:global(.text-annotation) {
		cursor: help;
		display: inline-flex;
		align-items: center;
		background-color: rgba(248, 225, 188, 0.5);
		margin: 0 0.05rem;
		padding: 0 0.15rem;
		border-radius: 0.15rem;
		transition: background 0.3s ease;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}
	:global(.text-annotation:hover) {
		background-color: rgba(248, 225, 188, 0.8);
	}
</style>
