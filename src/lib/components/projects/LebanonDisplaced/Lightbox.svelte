<script lang="ts">
	import { tick, getContext, onMount, onDestroy } from 'svelte';
	import Swiper from 'swiper';
	import { Navigation, Pagination, Keyboard } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';

	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	let swiperEl: HTMLDivElement;
	let swiper: Swiper | undefined;
	let videoEls: (HTMLVideoElement | undefined)[] = [];

	const state = $state<{
		index: number | null;
		isVisible: boolean;
		showCaption: boolean;
	}>({
		index: null,
		isVisible: false,
		showCaption: true
	});

	$effect(() => {
		state.index = $currentIndex;
		state.isVisible = $currentIndex !== null;
	});

	const close = () => currentIndex.set(null);

	function buildLightboxItemsFromDOM(): LightboxItem[] {
		const elements = Array.from(document.querySelectorAll('[data-lightbox]')) as HTMLElement[];
		const seen = new Set<string>();

		return elements
			.map((el) => {
				const src = el.getAttribute('data-lightbox-src') || '';
				if (!src || seen.has(src)) return null;
				seen.add(src);

				return {
					src,
					type: (el.getAttribute('data-lightbox-type') || 'image') as 'image' | 'video',
					width: parseInt(el.getAttribute('data-lightbox-width') || '0', 10),
					height: parseInt(el.getAttribute('data-lightbox-height') || '0', 10),
					caption: el.getAttribute('data-lightbox-caption') || '' // ✅ always string
				} satisfies LightboxItem;
			})
			.filter(Boolean) as LightboxItem[];
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		onDestroy(() => window.removeEventListener('keydown', handleKeydown));
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	$effect(() => {
		if (!state.isVisible || state.index === null) return;

		(async () => {
			await tick(); // Ensure DOM is updated

			lightboxItems.set(buildLightboxItemsFromDOM());

			if (!swiper) {
				swiper = new Swiper(swiperEl, {
					modules: [Navigation, Pagination, Keyboard],
					initialSlide: state.index ?? 0,
					// simulateTouch: true,
					// threshold: 10,
					// zoom: {
					// 	maxRatio: 3,
					// 	minRatio: 1
					// },
					// grabCursor: true,
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev'
					},
					pagination: {
						el: '.swiper-pagination',
						clickable: true
					},
					keyboard: {
						enabled: true
					},
					hashNavigation: {
						watchState: true
					},
					observer: true,
					observeSlideChildren: true
				});

				swiper.on('slideChange', () => {
					currentIndex.set(swiper.realIndex);
					swiper.pagination?.update?.();

					videoEls.forEach((video, i) => {
						if (!video) return;
						if (i === swiper.realIndex) {
							video.play().catch(() => {});
						} else {
							video.pause();
							video.currentTime = 0;
						}
					});
				});
			} else {
				swiper.slideTo(state.index, 0);
			}
		})();
	});

	$effect(() => {
		if (!state.isVisible && swiper) {
			swiper.destroy(true, true);
			swiper = undefined;
		}
	});

	$effect(() => {
		if (!swiper || !$lightboxItems.length) return;
		videoEls.forEach((video, i) => {
			if (!video) return;
			i === swiper.realIndex ? video.play().catch(() => {}) : video.pause();
		});
	});

	function decodeHTML(html: string): string {
		const txt = document.createElement('textarea');
		txt.innerHTML = html;
		return txt.value;
	}
</script>

<!-- Lightbox UI -->
{#if state.isVisible && state.index !== null && $lightboxItems[state.index]}
	<div
		class="lightbox-overlay"
		role="dialog"
		tabindex="0"
		onclick={(e) => (e.preventDefault(), e.stopPropagation(), close())}
	>
		<div
			bind:this={swiperEl}
			class="swiper lightbox-swiper"
			role="region"
			onclick={(e) => (e.preventDefault(), e.stopPropagation())}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			<div class="swiper-wrapper">
				{#each $lightboxItems as item, i}
					<div class="swiper-slide lightbox-media">
						{#if item.type === 'image'}
							<figure class="media-figure bg-brown">
								<div
									style={`width: 100%; aspect-ratio: ${item.width} / ${item.height};`}
									class="absolute left-0 top-0 h-full w-full sm:bg-lebgreen"
								></div>
								<img
									src={`${item.src}/m/1024x0`}
									alt={item.alt || 'Photo alt text is missing.'}
									loading="lazy"
									class="block sm:hidden"
								/>
								<img
									src={`${item.src}/m/1024x0`}
									alt={item.alt || 'Photo alt text is missing.'}
									loading="lazy"
									class="absolute left-0 top-0 hidden h-full w-full object-contain sm:block"
								/>
								{#if item.caption}
									<div class="flex flex-row">
										{#if state.showCaption}
											<figcaption
												class="media-caption"
												style={`text-align: ${isRtl ? 'right' : 'left'}`}
												dir={isRtl ? 'rtl' : 'ltr'}
											>
												{decodeHTML(item.caption)}
											</figcaption>
										{/if}
										<button
											class={`caption-toggle absolute -bottom-7 ${isRtl ? 'left-0' : 'right-0'} bg-opacity-70 px-3 py-1 text-sm text-white opacity-80 hover:underline hover:opacity-100`}
											onclick={() => (state.showCaption = !state.showCaption)}
										>
											{state.showCaption ? 'Hide caption' : 'Show caption'}
										</button>
									</div>
								{/if}
							</figure>
						{:else if item.type === 'video'}
							<video src={item.src} controls playsinline bind:this={videoEls[i]} class="max-h-full">
								<track kind="captions" src="captions.vtt" srclang="en" label="English" />
							</video>
						{/if}
					</div>
				{/each}
			</div>
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
			<div class="swiper-pagination"></div>
		</div>
		<button class="lightbox-close" onclick={(e) => (e.preventDefault(), close())}>×</button>
	</div>
{/if}

<style>
	:global(.swiper-pagination-bullet) {
		background: white;
		width: 1rem;
		height: 1rem;
		border-radius: 1px;
		opacity: 1;
	}

	:global(.swiper-wrapper) {
		top: 7%;
		height: 90%;
	}

	:global(.swiper-pagination-bullets) {
		top: 0 !important; /* move bullets up */
		bottom: unset !important;
	}

	:global(.swiper-pagination-bullet-active) {
		background-color: #9f3e52;
		width: 5rem;
		height: 1rem;
		border-radius: 1px;
	}
	@media screen and (max-width: 640px) {
		:global(.swiper-pagination) {
			padding: 0 1.5rem;
		}
		:global(.swiper-pagination-bullet) {
			width: 0.6rem;
			height: 0.6rem;
		}
		:global(.swiper-pagination-bullet-active) {
			width: 1.8rem;
			height: 0.6rem;
		}
		:global(
			.swiper-horizontal > .swiper-pagination-bullets .swiper-pagination-bullet,
			.swiper-pagination-horizontal.swiper-pagination-bullets .swiper-pagination-bullet
		) {
			margin: 0 0.125rem;
		}
	}

	.lightbox-overlay {
		z-index: 9999;
		position: fixed;
		inset: 0;
		background: #ffe0b5;
		background-image: url('/assets/ldd/patterns/example-backgropund--repetitive--sofia--small.png');
		background-repeat: repeat;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		box-sizing: border-box;
		overflow: hidden;
		/* background-image: url('/assets/ldd/patterns/beige-paper-texture.png'); */
		/* background-size: cover; */
	}

	.lightbox-overlay:hover {
		cursor: grab;
	}

	.media-figure {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
	}

	.media-figure img,
	.media-figure video {
		display: block;
		object-fit: contain;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		max-width: 90vw;
		max-height: 85vh;
	}

	@media screen and (max-width: 640px) {
		.media-figure img,
		.media-figure video {
			max-width: 100%;
			max-height: 100%;
		}
	}

	.media-caption {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: rgba(255, 255, 255, 0.9);
		padding: 0.25rem 0.5rem;
		color: #282828;
		text-align: start;
		font-size: 0.9rem;
		box-sizing: border-box;
		/* transform: translateX(-50%); */
		/* max-width: 90vw; */
	}

	.swiper {
		width: 100%;
		height: 100%;
	}

	.swiper.lightbox-swiper {
		max-width: 100vw;
		max-height: 100vh;
	}

	:global(.swiper-slide) {
		width: 100% !important;
	}

	.swiper-slide.lightbox-media {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.lightbox-media img,
	.lightbox-media video {
		/* max-width: 90vw;
		max-height: 90vh; */
		object-fit: contain;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	.swiper-button-prev,
	.swiper-button-next {
		color: white;
		z-index: 30 !important;
		will-change: color;
		transition: color 0.5s;
	}

	.swiper-pagination-bullet {
		background: black;
	}

	.lightbox-close {
		position: fixed;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		color: white;
		font-size: 4rem;
		z-index: 1001;
		cursor: pointer;
		will-change: color;
		transition: color 0.5s;
	}

	@media screen and (max-width: 640px) {
		.lightbox-close {
			top: 0.75rem;
			right: 0.5rem;
		}
	}

	.lightbox-close:hover,
	.swiper-button-next:hover,
	.swiper-button-prev:hover {
		color: #9f3e52;
	}
</style>
