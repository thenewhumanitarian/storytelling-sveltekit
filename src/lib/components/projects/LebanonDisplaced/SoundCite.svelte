<script lang="ts">
	import { onMount, tick, getContext } from 'svelte';
	import { storyblokEditable } from '@storyblok/svelte';

	let { blok = {} } = $props();
	let soundciteElement: HTMLSpanElement | null = null;

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	const text = blok.text;
	const url = blok.audio?.filename || '';
	const start = 0;
	const end = null;
	const plays = 1;

	onMount(async () => {
		await tick();

		if (!window.soundciteScriptLoaded) {
			window.soundciteScriptLoaded = true;

			window.SOUNDCITE_CONFIG = {
				background_color: '255,224,181' // e.g., bright yellow; use RGB format
			};

			// Set SoundCite config for isRtl
			window.SOUNDCITE_CONFIG.isRtl = isRtl;

			const script = document.createElement('script');
			script.src = '/scripts/SoundCite.js';
			script.async = true;
			script.onload = () => {
				if (window.soundcite) {
					window.soundcite.clips = [];
					window.soundcite = null;
				}
			};
			document.body.appendChild(script);
		}
	});
</script>

<div>
	<h2 class="text-left">{blok.title}</h2>
	<p
		use:storyblokEditable={blok}
		bind:this={soundciteElement}
		class="soundcite text-left"
		data-url={url}
		data-start={start}
		{...end !== null ? { 'data-end': end } : {}}
		{...plays !== 1 ? { 'data-plays': plays } : {}}
	>
		{text}
	</p>
</div>

<style>
	.soundcite {
		display: inline-block;
		cursor: pointer;
		color: inherit;
		border-radius: 0px !important;
		padding: 0.75rem 0.5rem;
		font-family: 'ff-amman-serif-pro', serif;
		font-size: 1.2rem;
		/* margin: 0.5rem 0; */
		/* line-height: 1.5; */
		/* text-decoration: underline; */
	}

	:global(.arabic .soundcite-play:before) {
		border-left: none;
		border-right: 0.75em solid black;
		padding-left: 0.5rem;
	}

	:global(.arabic .soundcite-pause:before) {
		padding-left: 0.5rem;
		border-left: none;
		border-right: 0.75em double black;
	}
</style>
