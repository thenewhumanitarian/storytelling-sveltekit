<script lang="ts">
	import type { EventMeta, EventSpeaker } from '$lib/events/types';
	import type { EventCheckoutConfig } from '$lib/events/eventbrite';
	import { reveal } from '$lib/attachments/reveal';
	import RegisterCTA from '$lib/components/events/RegisterCTA.svelte';

	interface Props {
		meta: EventMeta;
		checkout: EventCheckoutConfig;
		speakers: EventSpeaker[];
	}

	let { meta, checkout }: Props = $props();

	const registerHref = $derived(checkout.enabled ? '#register' : meta.registrationUrl);
	const eventDateShort = $derived(
		new Date(meta.startDate).toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'long',
			timeZone: 'America/New_York'
		})
	);
	const eventTime = $derived(
		new Date(meta.startDate).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			timeZone: 'America/New_York'
		})
	);
</script>

<section
	class="event-hero relative isolate flex h-svh overflow-hidden bg-[#f7f4ef] px-6 pb-6 pt-24 text-[#1a1210] sm:px-8 lg:px-12 lg:pb-8 lg:pt-28"
	aria-labelledby="event-hero-title"
>
	<div class="hero-paper pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div class="hero-mark hero-mark--one pointer-events-none absolute" aria-hidden="true"></div>
	<div class="hero-mark hero-mark--two pointer-events-none absolute" aria-hidden="true"></div>

	<div class="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col">
		<p
			class="max-w-3xl font-sans text-[0.65rem] font-bold tracking-[0.34em] text-[#a03c50] uppercase sm:text-xs"
			{@attach reveal({ y: 14 })}
		>
			{meta.subtitle}
		</p>

		<div class="hero-title-wrap mt-5" {@attach reveal({ y: 18, delay: 90 })}>
			<h1 id="event-hero-title" class="sr-only">{meta.title}</h1>
			<img
				src="/images/events/who-owns-the-narrative/title/event-title.svg"
				alt=""
				aria-hidden="true"
				class="hero-title-art hero-title-art--spacer"
				fetchpriority="high"
			/>
			<img
				src="/images/events/who-owns-the-narrative/title/event-title.svg"
				alt=""
				aria-hidden="true"
				class="hero-title-art hero-title-art--type"
			/>
			<img
				src="/images/events/who-owns-the-narrative/title/event-title.svg"
				alt=""
				aria-hidden="true"
				class="hero-title-art hero-title-art--underline"
			/>
			<img
				src="/images/events/who-owns-the-narrative/title/event-title.svg"
				alt=""
				aria-hidden="true"
				class="hero-title-art hero-title-art--pencil"
			/>
		</div>

		<div
			class="mt-5 grid flex-1 content-end gap-6 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)] lg:items-end lg:gap-12"
		>
			<div class="max-w-3xl" {@attach reveal({ y: 18, delay: 170 })}>
				<p class="font-sans text-base leading-relaxed text-[#3d3632] sm:text-lg lg:text-xl">
					{meta.description}
				</p>
			</div>

			<div
				class="hero-details-grid border-y-2 border-[#a03c50] py-4 sm:border sm:px-5 lg:py-5"
				{@attach reveal({ y: 18, delay: 240 })}
			>
				<div>
					<p class="font-sans text-[0.65rem] font-bold tracking-[0.28em] text-[#a03c50] uppercase">
						Event details
					</p>
					<p class="hero-date mt-2 leading-[0.85]">{eventDateShort}</p>
					<p class="mt-3 font-sans text-sm font-semibold tracking-[0.14em] uppercase">
						{eventTime} EDT
					</p>
				</div>

				<div class="hero-location font-sans text-sm leading-relaxed text-[#2d2724] sm:text-base">
					<p class="font-bold tracking-[0.1em] uppercase">Victor Borge Hall</p>
					<p>Scandinavia House</p>
					<p>{meta.location.address}</p>
					<p>{meta.location.city}</p>
				</div>

				<div class="hero-cta pointer-events-auto">
					<RegisterCTA href={registerHref} label="Reserve your spot" variant="primary" />
				</div>
			</div>
		</div>

		<a
			href="#intro"
			class="pointer-events-auto mt-8 inline-flex w-fit items-center gap-2 font-sans text-xs font-semibold tracking-[0.22em] text-[#a03c50] uppercase transition-colors hover:text-[#1a1210]"
			{@attach reveal({ y: 8, delay: 320 })}
		>
			Scroll to explore
			<span aria-hidden="true">↓</span>
		</a>
	</div>
</section>

<style>
	.hero-paper {
		background:
			radial-gradient(ellipse 56% 42% at 76% 22%, rgb(160 60 80 / 0.1), transparent 70%),
			radial-gradient(ellipse 38% 30% at 18% 88%, rgb(240 120 30 / 0.1), transparent 72%),
			linear-gradient(180deg, #fbfaf7 0%, #f6f1ea 58%, #efe7df 100%);
	}

	.hero-paper::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, rgb(160 60 80 / 0.13) 1px, transparent 1.35px);
		background-position: bottom 12% left 6%;
		background-size: 10px 10px;
		mask-image: radial-gradient(ellipse 28rem 18rem at 16% 82%, black, transparent 72%);
	}

	.hero-paper::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(90deg, transparent 0 12%, rgb(221 221 221 / 0.5) 12.08%, transparent 12.14%),
			linear-gradient(180deg, transparent 0 58%, rgb(160 60 80 / 0.1) 58.1%, transparent 58.2%);
		opacity: 0.55;
	}

	.hero-mark {
		border: 1px solid rgb(41 41 41 / 0.1);
		background: rgb(255 255 255 / 0.42);
		box-shadow: 0 24px 50px rgb(41 41 41 / 0.08);
	}

	.hero-mark--one {
		top: 17%;
		right: 5%;
		width: min(26vw, 19rem);
		aspect-ratio: 3 / 1;
		transform: rotate(-7deg);
	}

	.hero-mark--two {
		right: 16%;
		bottom: 14%;
		width: min(20vw, 14rem);
		aspect-ratio: 2.6 / 1;
		transform: rotate(5deg);
	}

	.hero-title-wrap {
		--hero-title-x: 9%;

		position: relative;
		margin-left: auto;
		width: min(100%, clamp(46rem, 58vw, 70rem));
		overflow: hidden;
	}

	.hero-title-art {
		display: block;
		width: 118%;
		max-width: none;
		height: auto;
		margin-left: auto;
		filter: drop-shadow(0 18px 28px rgb(41 41 41 / 0.08));
		transform: translateX(var(--hero-title-x));
	}

	.hero-title-art--spacer {
		opacity: 0;
	}

	.hero-title-art--type,
	.hero-title-art--underline,
	.hero-title-art--pencil {
		position: absolute;
		top: 0;
		right: 0;
	}

	.hero-title-art--type {
		clip-path: inset(0 12% 34% 0);
		opacity: 0;
		animation: hero-title-type-in 780ms cubic-bezier(0.2, 0.78, 0.16, 1) 160ms forwards;
	}

	.hero-title-art--underline {
		clip-path: inset(64% 0 0 15%);
		opacity: 0;
		transform: translateX(var(--hero-title-x)) scaleX(0.05);
		transform-origin: 30% 76%;
		animation: hero-title-line-in 860ms cubic-bezier(0.2, 0.78, 0.16, 1) 620ms forwards;
	}

	.hero-title-art--pencil {
		clip-path: inset(16% 0 12% 72%);
		opacity: 0;
		transform: translateX(calc(var(--hero-title-x) + 18%));
		animation: hero-title-pencil-in 900ms cubic-bezier(0.18, 0.82, 0.2, 1) 940ms forwards;
	}

	@keyframes hero-title-type-in {
		from {
			opacity: 0;
			filter: blur(6px) drop-shadow(0 18px 28px rgb(41 41 41 / 0.08));
			transform: translateX(var(--hero-title-x)) translateY(0.75rem) scale(1.012);
		}
		to {
			opacity: 1;
			filter: blur(0) drop-shadow(0 18px 28px rgb(41 41 41 / 0.08));
			transform: translateX(var(--hero-title-x)) translateY(0) scale(1);
		}
	}

	@keyframes hero-title-line-in {
		from {
			opacity: 0;
			transform: translateX(var(--hero-title-x)) scaleX(0.05);
		}
		40% {
			opacity: 1;
		}
		to {
			opacity: 1;
			transform: translateX(var(--hero-title-x)) scaleX(1);
		}
	}

	@keyframes hero-title-pencil-in {
		from {
			opacity: 0;
			transform: translateX(calc(var(--hero-title-x) + 18%));
		}
		25% {
			opacity: 1;
		}
		to {
			opacity: 1;
			transform: translateX(var(--hero-title-x));
		}
	}

	.hero-date {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(2.85rem, 4.8vw, 4.35rem);
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.hero-location {
		padding-top: 1.75rem;
	}

	.hero-details-grid {
		display: grid;
		grid-template-columns: minmax(10rem, 0.85fr) minmax(12rem, 1fr);
		gap: 1.5rem;
		background: rgb(247 244 239 / 0.46);
		backdrop-filter: blur(3px);
	}

	.hero-cta {
		grid-column: 1 / -1;
	}

	@media (min-width: 640px) {
		.hero-cta {
			justify-self: start;
		}
	}

	@media (max-width: 760px) {
		.hero-title-wrap {
			--hero-title-x: 20%;
		}

		.hero-title-art {
			width: 124%;
		}

		.hero-title-art--type {
			clip-path: inset(0 18% 34% 0);
		}

		.hero-title-art--underline {
			clip-path: inset(64% 0 0 14%);
			transform-origin: 34% 76%;
		}

		.hero-title-art--pencil {
			clip-path: inset(16% 0 12% 70%);
		}

		.hero-details-grid {
			grid-template-columns: 1fr;
		}

		.hero-location {
			padding-top: 0;
		}

		.hero-mark {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-title-art--type,
		.hero-title-art--underline,
		.hero-title-art--pencil {
			animation: none;
			opacity: 1;
		}

		.hero-title-art--underline,
		.hero-title-art--pencil {
			transform: translateX(var(--hero-title-x));
		}
	}
</style>
