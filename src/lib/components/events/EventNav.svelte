<script lang="ts">
	import { onMount } from 'svelte';
	import type { EventMeta } from '$lib/events/types';
	import type { EventCheckoutConfig } from '$lib/events/eventbrite';
	import RegisterCTA from '$lib/components/events/RegisterCTA.svelte';
	import ShareIcons from '$lib/components/icons/ShareIcons.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		meta: EventMeta;
		checkout: EventCheckoutConfig;
	}

	let { meta, checkout }: Props = $props();

	let navEl = $state<HTMLElement | undefined>(undefined);
	let scrolled = $state(false);
	let mouseX = $state(0.5);

	const registerHref = $derived(checkout.enabled ? '#register' : meta.registrationUrl);
	const shareTitle = $derived(`${meta.title} | The New Humanitarian Events`);
	const shareMessage = $derived(`${meta.title}: ${meta.description}`);

	onMount(() => {
		const syncNavHeight = () => {
			const height = navEl?.getBoundingClientRect().height ?? 64;
			document.documentElement.style.setProperty('--event-nav-h', `${Math.round(height)}px`);
		};

		const onScroll = () => {
			scrolled = window.scrollY > 24;
			syncNavHeight();
		};
		syncNavHeight();
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', syncNavHeight, { passive: true });

		const onMove = (e: MouseEvent) => {
			if (!navEl) return;
			const rect = navEl.getBoundingClientRect();
			mouseX = (e.clientX - rect.left) / rect.width;
		};
		window.addEventListener('mousemove', onMove, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', syncNavHeight);
			window.removeEventListener('mousemove', onMove);
		};
	});
</script>

<header
	bind:this={navEl}
	class={cn(
		'fixed top-0 right-0 left-0 z-50 transition-[background,backdrop-filter,box-shadow,border-color] duration-500',
		scrolled
			? 'border-b border-white/10 bg-[#1a1210]/80 shadow-lg shadow-black/20 backdrop-blur-xl'
			: 'border-b border-white/10 bg-[#1a1210]/88 shadow-lg shadow-black/10 backdrop-blur-xl'
	)}
	style:--event-nav-h="4rem"
	style:--nav-glow-x="{mouseX * 100}%"
>
	<!-- Cursor-reactive glow line -->
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#8b2942]/60 to-transparent opacity-100 transition-opacity duration-500"
		style:left="calc(var(--nav-glow-x) - 20%)"
		style:width="40%"
		aria-hidden="true"
	></div>

	<div
		class="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 lg:px-10 lg:py-4"
	>
		<ShareIcons
			title={shareTitle}
			message={shareMessage}
			url={meta.wwwEventUrl}
			initiallyExpanded={true}
			showMobileLabel={false}
			class="h-7 min-w-0 justify-self-start overflow-hidden sm:h-8"
			iconClass="text-white/75 transition-colors hover:text-white"
		/>

		<a
			href="https://www.thenewhumanitarian.org"
			class="group flex min-w-0 items-center justify-self-center"
			aria-label="The New Humanitarian"
		>
			<img
				src="/images/tnh-logo.svg"
				alt=""
				class="h-6 w-auto brightness-0 invert transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_rgba(196,168,130,0.35)] sm:h-8"
				width="120"
				height="32"
			/>
		</a>

		<div class="flex min-w-0 shrink-0 items-center justify-self-end">
			<RegisterCTA
				href={registerHref}
				label="Register"
				variant="primary"
				class="!rounded-none !bg-white !px-3 !py-2 !text-[0.68rem] !leading-none !text-[#8b2942] shadow-[0_0_0_1px_rgb(255_255_255_/_0.24)] transition-colors hover:!bg-[#f7f4ef] hover:!scale-100 active:!scale-100 sm:!px-6 sm:!py-3 sm:!text-xs"
			/>
		</div>
	</div>
</header>
