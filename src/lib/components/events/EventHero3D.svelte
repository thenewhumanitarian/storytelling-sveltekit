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
	<img
		src="/images/events/who-owns-the-narrative/title/event--title--transparent.png"
		alt=""
		aria-hidden="true"
		class="hero-title-art pointer-events-none absolute z-0"
		fetchpriority="high"
		width="1509"
		height="495"
		{@attach reveal({ y: 18, delay: 90 })}
	/>

	<div class="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col">
		<h1 id="event-hero-title" class="sr-only">{meta.title}</h1>
		<p
			class="max-w-3xl font-sans text-[0.65rem] font-bold tracking-[0.34em] text-[#a03c50] uppercase sm:text-xs"
			{@attach reveal({ y: 14 })}
		>
			{meta.subtitle}
		</p>

		<div
			class="hero-content-grid grid flex-1 content-end gap-7 lg:grid-cols-[minmax(22rem,30rem)_minmax(0,1fr)] lg:items-end lg:gap-14"
		>
			<div class="hero-details-grid" {@attach reveal({ y: 18, delay: 170 })}>
				<div class="hero-event-block">
					<div class="min-w-0">
						<p
							class="font-sans text-[0.65rem] font-bold tracking-[0.28em] text-[#a03c50] uppercase"
						>
							Date
						</p>
						<p class="hero-date mt-2 leading-[0.85]">{eventDateShort}</p>
						<p class="mt-3 font-sans text-sm font-semibold tracking-[0.14em] uppercase">
							{eventTime} EDT · New York
						</p>
					</div>
				</div>

				<div class="hero-location font-sans text-sm leading-relaxed text-[#2d2724]">
					<p class="hero-location-label">Venue</p>
					<p class="font-bold tracking-[0.1em] uppercase">Victor Borge Hall</p>
					<p>Scandinavia House · {meta.location.address} · {meta.location.city}</p>
				</div>

				<div class="hero-cta pointer-events-auto">
					<RegisterCTA
						href={registerHref}
						label="Reserve your spot"
						variant="primary"
						class="!rounded-none"
					/>
				</div>
			</div>

			<div class="hero-description max-w-3xl lg:pb-5" {@attach reveal({ y: 18, delay: 240 })}>
				<p class="hero-description-kicker">Live conversation · Film screening · Refreshments</p>
				<p class="mt-4 font-sans text-base leading-relaxed text-[#2d2724] sm:text-lg lg:text-xl">
					{meta.description}
				</p>
			</div>
		</div>

		<a
			href="#intro"
			class="pointer-events-auto mx-auto mt-8 inline-flex w-fit items-center gap-2 font-sans text-xs font-semibold tracking-[0.22em] text-[#a03c50] uppercase transition-colors hover:text-[#1a1210]"
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

	.hero-title-art {
		display: block;
		top: clamp(9rem, 22vh, 15rem);
		right: 0;
		width: min(64rem, 66vw);
		max-width: none;
		height: auto;
		filter: drop-shadow(0 18px 28px rgb(41 41 41 / 0.08));
	}

	.hero-date {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(2.6rem, 4vw, 3.65rem);
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.hero-location {
		padding-top: 0.25rem;
	}

	.hero-details-grid {
		display: grid;
		gap: 1rem;
		border-top: 4px solid #a03c50;
		border-bottom: 1px solid rgb(26 18 16 / 0.18);
		background:
			linear-gradient(90deg, rgb(160 60 80 / 0.08), transparent 42%),
			rgb(251 250 247 / 0.78);
		padding: clamp(1rem, 2vw, 1.35rem) 0;
		box-shadow: 0 22px 48px rgb(41 41 41 / 0.07);
		backdrop-filter: blur(4px);
	}

	.hero-event-block {
		padding-inline: clamp(0.95rem, 1.8vw, 1.25rem);
	}

	.hero-location {
		border-top: 1px solid rgb(26 18 16 / 0.14);
		padding: 0.9rem clamp(0.95rem, 1.8vw, 1.25rem) 0;
	}

	.hero-location-label,
	.hero-description-kicker {
		font-family: var(--font-sans, sans-serif);
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #a03c50;
	}

	.hero-cta {
		grid-column: 1 / -1;
		padding-inline: clamp(0.95rem, 1.8vw, 1.25rem);
	}

	.hero-description {
		border-left: 4px solid #a03c50;
		padding-left: clamp(1rem, 2.4vw, 1.65rem);
	}

	@media (min-width: 640px) {
		.hero-cta {
			justify-self: start;
		}
	}

	@media (max-width: 760px) {
		.hero-title-art {
			top: clamp(7.75rem, 15vh, 8.75rem);
			right: -3.5rem;
			width: min(26rem, 92vw);
		}

		.hero-content-grid {
			padding-top: clamp(9rem, 27vh, 12rem);
		}

		.hero-details-grid {
			grid-template-columns: 1fr;
		}

		.hero-location {
			padding-top: 0;
		}

		.hero-description {
			border-left-width: 3px;
		}
	}

	@media (max-height: 780px) and (min-width: 761px) {
		.hero-title-art {
			top: clamp(8rem, 17vh, 11rem);
			width: min(48rem, 52vw);
		}

		.hero-details-grid {
			gap: 0.8rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-title-art {
			transition: none;
		}
	}
</style>
