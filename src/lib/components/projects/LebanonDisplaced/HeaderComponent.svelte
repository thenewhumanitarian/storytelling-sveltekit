<script>
	import Logo from '$lib/components/icons/Logo.svelte';
	import ShareIcons from '$lib/components/icons/ShareIcons.svelte';
	import LanguageSwitch from '$lib/components/projects/LebanonDisplaced/LanguageSwitch.svelte';
</script>

<header class={'torn-paper torn-paper--top bg-brown'}>
	<div class="flex w-full flex-row items-center justify-between sm:px-2">
		<div class="flex h-6 w-auto gap-2">
			<ShareIcons />
		</div>
		<div class="absolute left-1/2 -translate-x-1/2">
			<Logo />
		</div>
		<div class="w-16 text-right">
			<LanguageSwitch />
		</div>
	</div>
	<link href="https://cdn.knightlab.com/libs/soundcite/latest/css/player.css" rel="stylesheet" />
</header>

<style>
	header {
		height: 4.5rem;
		z-index: 555;
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 0.8rem 0rem 0.8rem;
		width: 100%;
		top: 0;
		background-image: url('/assets/ldd/patterns/paper-texture--landscape.webp');
		background-size: cover;
		border-bottom: solid 0.5px #282828;
		/* box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1); */
		/* background-color: #ffe0b5; */
		/* background-color: transparent; */
		/* background-color: rgba(232, 193, 136, 1); */
		/* backdrop-filter: blur(10px); */
	}

	@media screen and (max-width: 1350px) {
		header {
			/* padding-bottom: 2rem; */
			/* background-image: url('/assets/ldd/patterns/torn-paper--bottom--small.webp'); */
		}
	}

	/* @media screen and (max-width: 1200px) {
		header {
			height: 4.5rem;
			padding-bottom: 1.8rem;
		}
	} */

	/* @media screen and (max-width: 900px) {
		header {
			height: 6rem;
			padding-bottom: 1rem;
		}
	} */

	@media screen and (max-width: 475px) {
		header {
			background-repeat: no-repeat;
			background-position: top center;
			background-size: cover;
			height: 4rem;
			padding: 0 0.5rem 0rem 0.75rem;
			/* padding-bottom: 0.7rem; */
		}
	}

	:global(.torn-paper) {
		position: absolute;
		left: 0;
		width: 100%;
		height: 25vh;
		z-index: 1;
		background-position: top center;
		background-size: cover;
	}
	:global(.torn-paper--top) {
		top: 0;
		background-position: bottom center;
		display: flex;
		align-items: center;
		justify-content: center;
		background-size: cover;
		/* background-image: url('/assets/ldd/patterns/torn-cardboard--top.png'); */
		/* background-image: url('/assets/ldd/patterns/torn-paper--top--small.webp'); */
	}
	.background-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
