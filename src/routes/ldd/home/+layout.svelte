<script lang="ts">
	import Logo from '$lib/components/icons/Logo.svelte';
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<div class="background-image">
	<enhanced:img src="$lib/assets/ldd/example-background.jpg" alt="Scrapbook background example" />
</div>

<header>
	<Logo />
</header>

<main>
	<slot />
</main>

<style>
	header {
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	main {
		margin: 0 3rem 3rem;
		border: 1px solid #ccc;
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
</style>
