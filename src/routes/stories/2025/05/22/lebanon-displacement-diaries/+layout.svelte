<script lang="ts">
	import { onMount, setContext } from 'svelte';

	/* Get language from URL */
	import { page } from '$app/state';
	const pageRoute = page.route.id;
	const lang = pageRoute && pageRoute.includes('/ar/') ? 'ar' : 'en';

	import HeaderComponent from '$lib/components/projects/LebanonDisplaced/HeaderComponent.svelte';
	import FooterComponent from '$lib/components/projects/LebanonDisplaced/FooterComponent.svelte';
	import Lightbox from '$lib/components/projects/LebanonDisplaced/Lightbox.svelte';

	setContext('lang', lang);

	let { children } = $props();

	onMount(() => {
		/* Add class to body if in Storyblok editor */
		function isStoryblokEditor() {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.has('_storyblok');
		}

		if (isStoryblokEditor()) {
			document.body.classList.add('is-storyblok-editor');
		}
	});
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="robots" content="index, follow" />
</svelte:head>

<HeaderComponent />

<main>
	{@render children()}
	<Lightbox />
</main>

<FooterComponent />

<style>
	main {
		/* margin: 0; */
		overflow: hidden;
		margin-top: 4rem;
		padding-top: 2rem;
		padding-bottom: 2rem;
		background-color: #afb87e;
		background-image: url('/assets/ldd/patterns/example-backgropund--repetitive--sofia--small.webp');
		background-repeat: repeat;
	}

	/* :global(main > div.storyblok__outline > div:last-child) {
		padding-bottom: 10rem;
		margin-bottom: -10rem;
		background: white;
	} */

	.background-image {
		position: fixed;
		z-index: -1;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
	}

	.background-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Deactivate links in Storyblok editor */
	:global(.is-storyblok-editor a, .is-storyblok-editor button) {
		pointer-events: none;
	}
</style>
