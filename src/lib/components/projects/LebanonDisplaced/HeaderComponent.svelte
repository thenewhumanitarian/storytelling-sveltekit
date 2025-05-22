<script>
	import { onMount } from 'svelte';

	import Logo from '$lib/components/icons/Logo.svelte';
	import ShareIcons from '$lib/components/icons/ShareIcons.svelte';
	import LanguageSwitch from '$lib/components/projects/LebanonDisplaced/LanguageSwitch.svelte';

	let backLinkHref = '/stories/2025/05/22/lebanon-displacement-diaries/home';
	let isOnHomePage = true;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const path = window.location.pathname;
			const isArabic = path.includes('/ar/');
			const isOnHomePage = path.endsWith('/home') || path.endsWith('/home/');

			if (!isOnHomePage) {
				backLinkHref = isArabic
					? '/stories/2025/05/22/lebanon-displacement-diaries/ar/home'
					: '/stories/2025/05/22/lebanon-displacement-diaries/home';
			}
		}

		// Check if already on Homepage
		if (typeof window !== 'undefined') {
			const path = window.location.pathname;
			isOnHomePage = path.endsWith('/home') || path.endsWith('/home/');
		}
	});
</script>

<header class={'torn-paper torn-paper--top bg-brown'}>
	<div class="flex w-full flex-row items-center justify-between sm:px-2">
		<div class="flex h-6 w-auto gap-2">
			<ShareIcons />
		</div>
		<div class="absolute left-1/2 -translate-x-1/2">
			<Logo />
		</div>
		<div class="flex w-16 items-center justify-end gap-2 text-right">
			<div
				class={`back--button group hidden transition-all duration-200 ease-in-out hover:bg-burgundy hover:text-white ${isOnHomePage ? 'sm:hidden' : 'sm:block'}`}
			>
				<a
					data-sveltekit-reload
					data-sveltekit-preload-data
					data-sveltekit-preload
					href={backLinkHref}
					class="relative flex items-center gap-1 px-2 py-0 focus:outline-none focus:ring-2 focus:ring-burgundy"
					aria-label="Back"
					title="Back to home"
				>
					<span aria-hidden="true">↩</span>
					<span
						class="sr-only group-hover:absolute group-hover:left-1/2 group-hover:top-full group-hover:mt-1 group-hover:-translate-x-1/2 group-hover:bg-white group-hover:px-2 group-hover:py-1 group-hover:text-xs group-hover:text-lebblack"
					>
						Back
					</span>
				</a>
			</div>
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
		box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
		border-bottom: solid 0.5px #282828;
	}

	.back--button {
		border: solid 1px #6b7280;
		padding: 0.5rem 0.25rem;
	}

	@media screen and (max-width: 475px) {
		header {
			background-repeat: no-repeat;
			background-position: top center;
			background-size: cover;
			height: 4rem;
			padding: 0 0.5rem 0rem 0.75rem;
		}
	}

	:global(.torn-paper) {
		position: absolute;
		left: 0;
		width: 100%;
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
	}
	.background-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
