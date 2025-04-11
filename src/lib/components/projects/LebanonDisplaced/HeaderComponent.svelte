<script>
	import Logo from '$lib/components/icons/Logo.svelte';
	import ShareIcons from '$lib/components/icons/ShareIcons.svelte';
	import LanguageSwitch from '$lib/components/projects/LebanonDisplaced/LanguageSwitch.svelte';
</script>

<header class={'torn-paper torn-paper--top'}>
	<div class="flex w-full flex-row items-center justify-between">
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
		height: 7rem;
		z-index: 9999;
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 1rem 2rem 1rem;
		width: 100%;
		top: 0;
		/* background-color: #ffe0b5; */
		/* background-color: transparent; */
		/* background-color: rgba(232, 193, 136, 1); */
		/* box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2); */
		/* backdrop-filter: blur(10px); */
	}

	@media screen and (max-width: 640px) {
		header {
			background-repeat: no-repeat;
			background-position: top center;
			background-size: cover;
			padding-bottom: 0.7rem;
			height: 5rem;
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
