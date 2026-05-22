<script lang="ts">
	import { onMount } from 'svelte';
	import Swiper from 'swiper';
	import { A11y, FreeMode, Navigation, Thumbs } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/free-mode';
	import 'swiper/css/navigation';
	import 'swiper/css/thumbs';
	import type { EventFilm } from '$lib/events/types';

	interface Props {
		film: EventFilm;
	}

	let { film }: Props = $props();

	let mainEl = $state<HTMLElement | undefined>(undefined);
	let thumbsEl = $state<HTMLElement | undefined>(undefined);
	let nextEl = $state<HTMLElement | undefined>(undefined);
	let prevEl = $state<HTMLElement | undefined>(undefined);

	const galleryImages = $derived.by(() => [
		{
			src: '/images/events/who-owns-the-narrative/film-gallery/film-poster-1-1280w.webp',
			srcset:
				'/images/events/who-owns-the-narrative/film-gallery/film-poster-1-640w.webp 640w, /images/events/who-owns-the-narrative/film-gallery/film-poster-1-960w.webp 960w, /images/events/who-owns-the-narrative/film-gallery/film-poster-1-1280w.webp 1280w',
			alt: film.posterAlt ?? `${film.title} film still`
		},
		{
			src: '/images/events/who-owns-the-narrative/film-gallery/film-poster-2-1280w.webp',
			srcset:
				'/images/events/who-owns-the-narrative/film-gallery/film-poster-2-640w.webp 640w, /images/events/who-owns-the-narrative/film-gallery/film-poster-2-960w.webp 960w, /images/events/who-owns-the-narrative/film-gallery/film-poster-2-1280w.webp 1280w',
			alt: `${film.title} film still`
		},
		{
			src: '/images/events/who-owns-the-narrative/film-gallery/film-poster-3-960w.webp',
			srcset:
				'/images/events/who-owns-the-narrative/film-gallery/film-poster-3-360w.webp 360w, /images/events/who-owns-the-narrative/film-gallery/film-poster-3-640w.webp 640w, /images/events/who-owns-the-narrative/film-gallery/film-poster-3-960w.webp 960w',
			alt: `${film.title} film still`
		},
		{
			src: '/images/events/who-owns-the-narrative/film-gallery/film-poster-4-960w.webp',
			srcset:
				'/images/events/who-owns-the-narrative/film-gallery/film-poster-4-360w.webp 360w, /images/events/who-owns-the-narrative/film-gallery/film-poster-4-640w.webp 640w, /images/events/who-owns-the-narrative/film-gallery/film-poster-4-960w.webp 960w',
			alt: `${film.title} film still`
		}
	]);

	onMount(() => {
		if (!mainEl || !thumbsEl || !nextEl || !prevEl) return;

		const thumbsSwiper = new Swiper(thumbsEl, {
			modules: [FreeMode, A11y],
			loop: true,
			spaceBetween: 10,
			slidesPerView: 3,
			freeMode: true,
			watchSlidesProgress: true,
			slideToClickedSlide: true,
			a11y: {
				enabled: true
			}
		});

		const mainSwiper = new Swiper(mainEl, {
			modules: [Navigation, Thumbs, A11y],
			loop: true,
			spaceBetween: 0,
			navigation: {
				nextEl,
				prevEl
			},
			thumbs: {
				swiper: thumbsSwiper
			},
			a11y: {
				enabled: true,
				prevSlideMessage: 'Previous film image',
				nextSlideMessage: 'Next film image'
			}
		});

		return () => {
			mainSwiper.destroy(true, true);
			thumbsSwiper.destroy(true, true);
		};
	});
</script>

<section
	class="border-y border-[var(--event-ink)]/10 bg-[var(--event-ink)] px-6 py-16 text-white lg:px-10 lg:py-24"
>
	<div
		class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start"
	>
		<div class="film-gallery min-w-0 lg:mt-0">
			<div
				bind:this={mainEl}
				class="swiper film-gallery-main"
				style:--swiper-navigation-color="#fff"
			>
				<div class="swiper-wrapper">
					{#each galleryImages as image, imageIndex (`main-${image.src}`)}
						<div class="swiper-slide">
							<img
								src={image.src}
								srcset={image.srcset}
								sizes="(min-width: 1024px) 520px, 100vw"
								alt={image.alt}
								loading={imageIndex === 0 ? 'eager' : 'lazy'}
								fetchpriority={imageIndex === 0 ? 'high' : 'auto'}
							/>
						</div>
					{/each}
				</div>

				<button
					bind:this={prevEl}
					class="film-gallery-nav film-gallery-nav--prev"
					type="button"
					aria-label="Previous film image"
				></button>
				<button
					bind:this={nextEl}
					class="film-gallery-nav film-gallery-nav--next"
					type="button"
					aria-label="Next film image"
				></button>
			</div>

			<div
				bind:this={thumbsEl}
				class="swiper film-gallery-thumbs"
				aria-label="Film image thumbnails"
			>
				<div class="swiper-wrapper">
					{#each galleryImages as image (`thumb-${image.src}`)}
						<div class="swiper-slide">
							<img src={image.src} srcset={image.srcset} sizes="160px" alt="" loading="lazy" />
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div>
			<p class="font-sans text-xs font-semibold tracking-[0.25em] text-[#c4a882] uppercase">
				Film screening
			</p>
			<h2 class="mt-3 font-serif text-3xl leading-tight md:text-4xl">{film.title}</h2>
			<p class="mt-2 font-sans text-sm text-white/60">
				{film.year} · {film.runtime} · Directed by {film.director}
			</p>

			<p class="mt-6 font-sans text-base leading-relaxed text-white/85 md:text-lg">
				{film.description}
			</p>

			{#if film.awards?.length}
				<ul class="mt-6 space-y-2">
					{#each film.awards as award (award)}
						<li class="flex gap-2 font-sans text-sm text-[#c4a882]">
							<span aria-hidden="true">★</span>
							{award}
						</li>
					{/each}
				</ul>
			{/if}

			{#if film.credits?.length}
				<div class="mt-6 border-t border-white/15 pt-6">
					{#each film.credits as credit (credit)}
						<p class="font-sans text-sm text-white/60">{credit}</p>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.film-gallery,
	.film-gallery :global(.swiper),
	.film-gallery :global(.swiper-slide),
	.film-gallery img {
		border-radius: 0;
	}

	.film-gallery {
		overflow: hidden;
		background: transparent;
	}

	.film-gallery-main {
		position: relative;
		aspect-ratio: 16 / 9;
		width: 100%;
	}

	.film-gallery :global(.swiper-slide) {
		background: transparent;
	}

	.film-gallery img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.film-gallery-thumbs {
		height: clamp(4.75rem, 9vw, 6.5rem);
		margin-top: 0.55rem;
		padding: 0;
		box-sizing: border-box;
	}

	.film-gallery-thumbs :global(.swiper-slide) {
		width: 33.333%;
		cursor: pointer;
		opacity: 0.34;
		transition:
			opacity 180ms ease,
			filter 180ms ease;
		filter: saturate(0.72);
	}

	.film-gallery-thumbs :global(.swiper-slide-thumb-active) {
		opacity: 0.82;
		filter: saturate(1.05);
	}

	.film-gallery-nav {
		position: absolute;
		top: 50%;
		z-index: 5;
		width: 2.75rem;
		height: 2.75rem;
		border: 0;
		border-radius: 0;
		background: rgb(18 13 11 / 0.28);
		color: #fff;
		transform: translateY(-50%);
		transition:
			background 160ms ease,
			color 160ms ease;
	}

	.film-gallery-nav:hover {
		background: rgb(160 60 80 / 0.62);
	}

	.film-gallery-nav::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0.95rem;
		height: 0.95rem;
		border-top: 3px solid currentColor;
		border-left: 3px solid currentColor;
	}

	.film-gallery-nav--prev {
		left: 0.85rem;
	}

	.film-gallery-nav--prev::before {
		transform: translate(-35%, -50%) rotate(-45deg);
	}

	.film-gallery-nav--next {
		right: 0.85rem;
	}

	.film-gallery-nav--next::before {
		transform: translate(-65%, -50%) rotate(135deg);
	}

	@media (max-width: 640px) {
		.film-gallery-nav {
			width: 2.35rem;
			height: 2.35rem;
		}
	}
</style>
