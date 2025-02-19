<script lang="ts">
	// import Logo from '$lib/components/icons/LogoInverted.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<div class="background-image">
	<enhanced:img src="$lib/assets/ldd/bg-example-1.jpg" alt="Scrapbook background example" />
</div>

<header>
	<Logo />
</header>

<main>
	<slot />
</main>

<footer>
	<p>Footer tbd.</p>
</footer>

<style>
	header {
		z-index: 9999;
		position: fixed;
		display: flex;
		justify-content: center;
		padding: 0.75rem;
		width: 100%;
		top: 0;
		background: rgba(232, 193, 136, 1);
		box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
		/* backdrop-filter: blur(10px); */
	}

	main {
		margin: 0 0 3rem 0;
		padding-top: 7rem;
		overflow: hidden;
		/* border: 1px solid #eee; */
	}

	footer {
		display: flex;
		justify-content: center;
		padding: 0.75rem;
		width: 100%;
		bottom: 0;
		background: black;
		color: white;
		box-shadow: 0px -10px 30px rgba(0, 0, 0, 0.2);
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
