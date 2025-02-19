<script lang="ts">
	import { storyblokEditable, renderRichText } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div class="storyblok--richtext" use:storyblokEditable={blok}>
	{@html renderRichText(blok.text)}
</div>

<style>
	.storyblok--richtext {
		display: block;
	}
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
