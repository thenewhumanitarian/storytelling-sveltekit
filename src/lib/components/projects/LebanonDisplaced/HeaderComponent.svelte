<script>
	import Logo from '$lib/components/icons/Logo.svelte';
</script>

<header class={'torn-paper torn-paper--top'}>
	<Logo />
</header>

<style>
	header {
		height: 6rem;
		z-index: 9999;
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 1rem 0.7rem 1rem;
		width: 100%;
		top: 0;
		background-color: transparent;
		/* background-color: rgba(232, 193, 136, 1); */
		/* box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2); */
		/* backdrop-filter: blur(10px); */
	}
	:global(.torn-paper) {
		position: absolute;
		left: 0;
		width: 100%;
		height: 25vh;
		z-index: 1;
		background-position: top center;
		background-size: contain;
	}
	:global(.torn-paper--top) {
		top: 0;
		background-position: bottom center;
		background-image: url('/assets/ldd/patterns/torn-paper--top@2x.png');
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.background-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
