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
	}

	@keyframes pulseArrow {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1);
			opacity: 0.7;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}



	:global(*:not(.arabic) .soundcite-pause:before) {
		border-left: 0.75em double #9f3e52;
		padding-left: 0;
		margin-right: 0;
	}

	:global(*:not(.arabic) .soundcite-play:before) {
		border-right: none;
		border-left: 0.75em solid #9f3e52;
		margin: 0 6.5px 0 2px;

		/* Animation */
		animation: pulseArrow 1.5s ease-in-out infinite;
		transform-origin: center;
		display: inline-block;
		will-change: opacity;
	}

	:global(.arabic .soundcite-play:before) {
		border-left: none;
		border-right: 0.75em solid #9f3e52;
		margin: 0 2px 0 5px !important;

		/* Animation */
		animation: pulseArrow 1.5s ease-in-out infinite;
		transform-origin: center;
		display: inline-block;
		will-change: opacity;
	}

	:global(.arabic .soundcite-pause:before) {
		border-right: 0.75em double #9f3e52 !important;
		border-left: none !important;
		margin-left: 5px !important;
		margin-left: 7px;
	}
</style>
