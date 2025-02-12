<script lang="ts">
	import Logo from '$lib/components/icons/Logo.svelte';
</script>

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
