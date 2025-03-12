<script lang="ts">
	import HeaderComponent from '$lib/components/projects/LebanonDisplaced/HeaderComponent.svelte';
	import FooterComponent from '$lib/components/projects/LebanonDisplaced/FooterComponent.svelte';
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<HeaderComponent />

<main>
	<div class="intro-spacer"></div>
	<!-- <div class="background-image">
		<enhanced:img src="$lib/assets/ldd/bg-example-1.jpg" alt="Scrapbook background example" />
	</div> -->
	<slot />
</main>

<FooterComponent />

<style>
	main {
		margin: 0;
		overflow: hidden;
		background-color: #f8cd4d;
		margin-bottom: 4rem;
	}

	@media screen and (max-width: 640px) {
		main {
			margin-top: 7rem;
			padding-top: 0;
		}
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

	.intro-spacer {
		height: 7rem;
		background-color: #ebe4cb;
	}
</style>
