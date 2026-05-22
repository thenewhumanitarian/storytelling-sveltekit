<script lang="ts">
	import { onMount } from 'svelte';
	import type { EventMeta } from '$lib/events/types';
	import type { EventCheckoutConfig } from '$lib/events/eventbrite';
	import RegisterCTA from '$lib/components/events/RegisterCTA.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		meta: EventMeta;
		checkout: EventCheckoutConfig;
	}

	let { meta, checkout }: Props = $props();

	let navEl = $state<HTMLElement | undefined>(undefined);
	let scrolled = $state(false);
	let mouseX = $state(0.5);
	let shareCopied = $state(false);

	const eventLabel = $derived(
		new Date(meta.startDate).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			timeZone: 'America/New_York'
		})
	);

	const registerHref = $derived(checkout.enabled ? '#register' : meta.registrationUrl);

	async function shareEvent() {
		if (typeof window === 'undefined') return;

		const url = window.location.href.split('#')[0];
		const title = `${meta.title} | The New Humanitarian Events`;
		const text = meta.description;

		if (navigator.share) {
			try {
				await navigator.share({ title, text, url });
				return;
			} catch {
				// Fall through to clipboard when native share is dismissed or unavailable.
			}
		}

		await navigator.clipboard?.writeText(url);
		shareCopied = true;
		window.setTimeout(() => {
			shareCopied = false;
		}, 1800);
	}

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
			: 'border-b border-transparent bg-transparent'
	)}
	style:--event-nav-h="4rem"
	style:--nav-glow-x="{mouseX * 100}%"
>
	<!-- Cursor-reactive glow line -->
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#8b2942]/60 to-transparent opacity-0 transition-opacity duration-500"
		class:opacity-100={scrolled}
		style:left="calc(var(--nav-glow-x) - 20%)"
		style:width="40%"
		aria-hidden="true"
	></div>

	<div class="relative flex items-center justify-between gap-4 px-6 py-3 lg:px-10 lg:py-4">
		<a
			href="https://www.thenewhumanitarian.org"
			class="group flex items-center gap-3"
			aria-label="The New Humanitarian"
		>
			<img
				src="/images/tnh-logo.svg"
				alt=""
				class="h-7 w-auto brightness-0 invert transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_rgba(196,168,130,0.35)] sm:h-8"
				width="120"
				height="32"
			/>
			<span
				class="hidden font-sans text-[0.65rem] tracking-[0.2em] text-white/40 uppercase transition-colors group-hover:text-[#c4a882]/80 sm:inline"
			>
				Events
			</span>
		</a>

		<!-- Centre pill — visible when not scrolled deeply into hero -->
		<a
			href="#intro"
			class={cn(
				'hidden rounded-full border border-white/15 px-4 py-1.5 font-sans text-[0.65rem] tracking-[0.15em] text-white/70 uppercase transition-all duration-300 hover:border-[#c4a882]/40 hover:text-white md:inline-flex',
				scrolled && 'opacity-0 pointer-events-none translate-y-[-4px]'
			)}
		>
			{eventLabel} · NYC · {meta.title}
		</a>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="inline-flex h-11 items-center justify-center gap-2 border border-white/30 px-3 font-sans text-xs font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:border-white hover:bg-white hover:text-[#3c332f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4"
				aria-label="Share this event"
				onclick={shareEvent}
			>
				<svg
					aria-hidden="true"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="square"
					stroke-linejoin="miter"
				>
					<path d="M4 12v8h16v-8" />
					<path d="M12 16V4" />
					<path d="M7 9l5-5 5 5" />
				</svg>
				<span class="hidden sm:inline">{shareCopied ? 'Copied' : 'Share'}</span>
			</button>

			<RegisterCTA
				href={registerHref}
				label="Register"
				variant="primary"
				class="!rounded-none !bg-white !px-5 !py-3 !text-xs !text-[#8b2942] shadow-[0_0_0_1px_rgb(255_255_255_/_0.24)] transition-colors hover:!bg-[#f7f4ef] hover:!scale-100 active:!scale-100 sm:!px-6"
			/>
		</div>
	</div>
</header>
