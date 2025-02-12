<script lang="ts">
	import Logo from '$lib/components/icons/Logo.svelte';
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

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
</style>
