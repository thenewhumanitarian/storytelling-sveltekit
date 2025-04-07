<script lang="ts">
	import { onMount } from 'svelte';

	import HeaderComponent from '$lib/components/projects/LebanonDisplaced/HeaderComponent.svelte';
	import FooterComponent from '$lib/components/projects/LebanonDisplaced/FooterComponent.svelte';

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
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<HeaderComponent />

<main>
	<!-- <div class="background-image">
		<enhanced:img src="$lib/assets/ldd/bg-example-1.jpg" alt="Scrapbook background example" />
	</div> -->
	{@render children()}
</main>

<FooterComponent></FooterComponent>

<style>
	main {
		/* margin: 0; */
		overflow: hidden;
		padding-bottom: 4rem;
		padding-top: 2rem;
		margin-top: 4rem;
		background-color: #a6af71;
	}

	:global(main > div.storyblok__outline > div:last-child) {
		padding-bottom: 10rem;
		margin-bottom: -10rem;
		/* background: white; */
	}

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
	:global(.is-storyblok-editor a) {
		pointer-events: none;
	}
</style>
