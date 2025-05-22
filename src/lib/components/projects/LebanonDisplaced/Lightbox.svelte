<script lang="ts">
	import { tick, getContext, onMount, onDestroy } from 'svelte';
	import Swiper from 'swiper';
	import { Navigation, Pagination, Keyboard, Zoom } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';
	import 'swiper/css/zoom';

	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	let swiperEl: HTMLDivElement;
	let swiper: Swiper | undefined;
	let videoEls: (HTMLVideoElement | undefined)[] = [];

	const playIcon =
		'<svg fill="current" style="fill: current;" class="play icon fill-current w-full h-auto" height="30" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_5_2)"><path d="M66.6667 11.1093C81.4013 11.1093 95.5307 16.9635 105.953 27.38C116.37 37.8019 122.224 51.932 122.224 66.6667C122.224 81.4013 116.37 95.5307 105.953 105.953C95.5315 116.37 81.4013 122.224 66.6667 122.224C51.932 122.224 37.8027 116.37 27.38 105.953C16.9633 95.5315 11.1093 81.4013 11.1093 66.6667C11.125 51.9373 16.9843 37.8173 27.4013 27.4013C37.8184 16.9853 51.9373 11.1253 66.6667 11.1093ZM66.6667 0C48.984 0 32.0267 7.026 19.5267 19.5267C7.02667 32.0273 0 48.9853 0 66.6667C0 84.348 7.026 101.307 19.5267 113.807C32.0273 126.307 48.9853 133.333 66.6667 133.333C84.348 133.333 101.307 126.307 113.807 113.807C126.307 101.306 133.333 84.348 133.333 66.6667C133.333 48.9853 126.307 32.0267 113.807 19.5267C101.306 7.02667 84.348 0 66.6667 0ZM50 94.4427V38.8907L100 67.4787L50 94.4427Z" fill="white"/></g><defs><clipPath id="clip0_5_2"><rect width="133.333" height="133.333" fill="white"/></clipPath></defs></svg>';

	const stopIcon =
		'<svg fill="current" style="fill: current;" class="stop icon fill-current w-full h-auto" width="100%" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66.6667 0.666664C30.4013 0.666664 0.802673 30.2653 0.802673 66.5307C0.802673 102.796 30.272 132.395 66.6667 132.395C102.932 132.395 132.531 102.925 132.531 66.5307C132.531 30.2653 102.932 0.666664 66.6667 0.666664ZM66.6667 121.197C36.5307 121.197 12 96.6667 12 66.5307C12 36.3947 36.5307 11.864 66.6667 11.864C96.8027 11.864 121.333 36.3947 121.333 66.5307C121.469 96.6667 96.932 121.197 66.6667 121.197Z" fill="white"/><path d="M44 44H89V89H44V44Z" fill="white"/></svg>';

	const audioOnIcon =
		'<svg fill="current" style="fill: current;" class="stop icon fill-current w-full h-auto" width="100%" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66.6667 0.666656C30.4013 0.666656 0.802673 30.2653 0.802673 66.5307C0.802673 102.796 30.272 132.395 66.6667 132.395C102.932 132.395 132.531 102.925 132.531 66.5307C132.531 30.2653 102.932 0.666656 66.6667 0.666656ZM66.6667 121.197C36.5307 121.197 12 96.6667 12 66.5307C12 36.3947 36.5307 11.864 66.6667 11.864C96.8027 11.864 121.333 36.3947 121.333 66.5307C121.469 96.6667 96.932 121.197 66.6667 121.197Z" fill="white"/><path d="M60.0827 34.416L40.192 49.9787L25.796 50.2078C23.52 50.2443 21.6971 52.0985 21.6971 54.3745V79.5252C21.6971 81.8689 23.6293 83.7544 25.9731 83.6918L40.1917 83.3168L60.0824 98.8795C62.8168 101.02 66.8168 99.0722 66.8168 95.5983V37.697C66.8168 34.2282 62.8223 32.2753 60.0827 34.416ZM81.776 47.9947L75.0989 55.9895C78.276 58.6405 80.0938 62.5311 80.0938 66.6613C80.0938 70.7811 78.2812 74.6665 75.1198 77.3176L81.8124 85.302C87.3436 80.6665 90.5103 73.8697 90.5103 66.662C90.5103 59.438 87.3281 52.6347 81.776 47.9947ZM95.0364 32.8693L88.6615 41.1089C96.6407 47.2808 101.219 56.5929 101.219 66.6663C101.219 76.734 96.6459 86.0463 88.6719 92.2183L95.0468 100.458C105.588 92.2964 111.635 79.9845 111.635 66.6659C111.63 53.3481 105.583 41.0307 95.0364 32.8693Z" fill="white"/></svg>';

	const audioOffIcon =
		'<svg fill="current" style="fill: current;" class="stop icon fill-current w-full h-auto" width="100%" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66.6667 0.666656C30.4013 0.666656 0.802673 30.2653 0.802673 66.5307C0.802673 102.796 30.272 132.395 66.6667 132.395C102.932 132.395 132.531 102.925 132.531 66.5307C132.531 30.2653 102.932 0.666656 66.6667 0.666656ZM66.6667 121.197C36.5307 121.197 12 96.6667 12 66.5307C12 36.3947 36.5307 11.864 66.6667 11.864C96.8027 11.864 121.333 36.3947 121.333 66.5307C121.469 96.6667 96.932 121.197 66.6667 121.197Z" fill="white"/><path opacity="0.8" d="M60.0827 34.416L40.192 49.9787L25.796 50.2078C23.52 50.2443 21.6971 52.0985 21.6971 54.3745V79.5252C21.6971 81.8689 23.6293 83.7544 25.9731 83.6918L40.1917 83.3168L60.0824 98.8795C62.8168 101.02 66.8168 99.0722 66.8168 95.5983V37.697C66.8168 34.2282 62.8223 32.2753 60.0827 34.416ZM81.776 47.9947L75.0989 55.9895C78.276 58.6405 80.0938 62.5311 80.0938 66.6613C80.0938 70.7811 78.2812 74.6665 75.1198 77.3176L81.8124 85.302C87.3436 80.6665 90.5103 73.8697 90.5103 66.662C90.5103 59.438 87.3281 52.6347 81.776 47.9947ZM95.0364 32.8693L88.6615 41.1089C96.6407 47.2808 101.219 56.5929 101.219 66.6663C101.219 76.734 96.6459 86.0463 88.6719 92.2183L95.0468 100.458C105.588 92.2964 111.635 79.9845 111.635 66.6659C111.63 53.3481 105.583 41.0307 95.0364 32.8693Z" fill="white"/><rect x="107.388" y="19" width="11" height="125" transform="rotate(45 107.388 19)" fill="black"/></svg>';

	const state = $state<{
		index: number | null;
		isVisible: boolean;
		showCaption: boolean;
		imagesLoaded: boolean[];
		videoIsPlaying: boolean;
		videoAudio: boolean;
		isZoomed: boolean;
	}>({
		index: null,
		isVisible: false,
		showCaption: true,
		imagesLoaded: [],
		videoIsPlaying: true,
		videoAudio: true,
		isZoomed: false
	});

	$effect(() => {
		state.index = $currentIndex;
		state.isVisible = $currentIndex !== null;
	});

	const close = () => currentIndex.set(null);

	function handleToggleAudio(index: number) {
		const video = videoEls[index];
		state.videoAudio = !state.videoAudio;

		if (video) {
			video.muted = !state.videoAudio;
			video.volume = state.videoAudio ? 1 : 0;
			console.log('Audio toggled, muted:', video.muted);
		}
	}

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

	// Handle video play/pause
	function handleVideoPlayPause(index: number) {
		console.log('Video play/pause clicked');
		if (state.videoIsPlaying) {
			videoEls[index].pause();
			videoEls[index].currentTime = 0;
		} else {
			videoEls[index].play().catch(() => {});
		}
		state.videoIsPlaying = !state.videoIsPlaying;
	}

	$effect(() => {
		if (!state.isVisible && swiper) {
			swiper.destroy(true, true);
			swiper = undefined;

			state.imagesLoaded = []; // Optional: reset if Lightbox is closed
		}
	});

	$effect(() => {
		if (!state.isVisible || state.index === null) return;

		(async () => {
			await tick(); // Ensure DOM is updated

			lightboxItems.set(buildLightboxItemsFromDOM());

			// Only initialize if not already filled
			if (state.imagesLoaded.length !== $lightboxItems.length) {
				state.imagesLoaded = $lightboxItems.map(() => false);
			}

			if (!swiper) {
				swiper = new Swiper(swiperEl, {
					modules: [Navigation, Pagination, Keyboard, Zoom],
					zoom: true,
					initialSlide: state.index ?? 0,
					mousewheel: { forceToAxis: true },
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

				// ✅ One-time initial autoplay if initial slide is a video
				const initialIndex = state.index ?? 0;
				const initialItem = $lightboxItems[initialIndex];
				const initialVideo = videoEls[initialIndex];

				if (initialItem?.type === 'video' && initialVideo) {
					initialVideo.muted = !state.videoAudio;
					initialVideo
						.play()
						.then(() => {
							console.log('Initial video playing:', initialVideo.src);
						})
						.catch(console.error);
					state.videoIsPlaying = true;
				}

				swiper.on('zoomChange', (swiperInstance, scale) => {
					state.isZoomed = scale > 1;
				});

				swiper.on('slideChange', () => {
					currentIndex.set(swiper.realIndex);
					swiper.pagination?.update?.();

					videoEls.forEach((video, i) => {
						if (!video) return;
						if (i === swiper.realIndex) {
							console.log('Playing video');
							video.muted = !state.videoAudio;
							video
								.play()
								.then(() => {
									console.log('Playing:', video.src, 'Muted:', video.muted);
								})
								.catch(console.error);
							state.videoIsPlaying = true;
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
							<figure class="media-figure bg-transparent">
								<div class="swiper-zoom-container sm:bg-lebgreen">
									<img
										src={`${item.src}/m/1024x0`}
										alt={item.caption || 'Photo alt text is missing.'}
										class="max-h-full w-full object-contain"
										loading="lazy"
										onload={() => (state.imagesLoaded[i] = true)}
										style={`width: 100%; aspect-ratio: ${item.width} / ${item.height};`}
									/>
								</div>
								{#if !state.isZoomed && state.imagesLoaded[i]}
									<div
										class={`absolute top-0.5 flex items-center justify-center gap-1 ${isRtl ? 'right-2' : 'left-2'}`}
									>
										<button
											class={`caption-toggle transition:all pb-[2px] text-lg text-white opacity-90 duration-500 hover:text-burgundy hover:opacity-100 lg:text-2xl`}
											onclick={() => {
												swiper?.zoom?.toggle?.();
											}}
										>
											⛶
										</button>
									</div>
								{/if}
								{#if item.caption && !state.isZoomed}
									<div class="flex flex-row">
										{#if state.showCaption && state.imagesLoaded[i]}
											<figcaption
												class="media-caption"
												style={`text-align: ${isRtl ? 'right' : 'left'}`}
												dir={isRtl ? 'rtl' : 'ltr'}
											>
												{decodeHTML(item.caption)}
											</figcaption>
										{/if}

										{#if state.imagesLoaded[i] && !state.isZoomed}
											{#if state.showCaption}
												<div
													class={`absolute top-2 flex items-center justify-center gap-1 ${isRtl ? 'left-3' : 'right-3'}`}
												>
													<button
														class={`caption-toggle transition:all pb-[2px] text-sm text-white opacity-90 duration-500 hover:underline hover:opacity-100 `}
														onclick={() => (state.showCaption = !state.showCaption)}
													>
														{state.showCaption ? 'Hide caption' : 'Show caption'}
													</button>
													<span class="text-sm text-burgundy">{state.showCaption ? '◉' : '◎'}</span>
												</div>
											{:else}
												<div
													class={`absolute top-2 flex items-center justify-center gap-1 ${isRtl ? 'left-3' : 'right-3'}`}
												>
													<button
														class={`caption-toggle transition:all bg-opacity-70 pb-[2px] text-sm text-white opacity-90 duration-500 hover:underline hover:opacity-100 `}
														onclick={() => (state.showCaption = !state.showCaption)}
													>
														{state.showCaption ? 'Hide caption' : 'Show caption'}
													</button>
													<span class="text-sm text-burgundy">{state.showCaption ? '◉' : '◎'}</span>
												</div>
											{/if}
										{/if}
									</div>
								{/if}
							</figure>
							<div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
						{:else if item.type === 'video'}
							<figure class="media-figure bg-transparent">
								<video
									src={item.src}
									playsinline
									loop
									controls={false}
									class="max-h-full"
									loading="lazy"
									muted={!state.videoAudio}
									bind:this={videoEls[i]}
								/>
								<div
									class={`video--controls flex items-center justify-center pt-2 sm:pt-2 ${isRtl ? 'right-2' : 'left-2'}`}
								>
									<button class="video--play z-10" onclick={() => handleVideoPlayPause(i)}>
										<span class="video--icons relative block h-6 w-6 sm:h-8 sm:w-8">
											{#if state.videoIsPlaying}
												{@html stopIcon}
											{:else}
												{@html playIcon}
											{/if}
										</span>
									</button>
									<button class="video--audio z-10" onclick={() => handleToggleAudio(i)}>
										<span class="video--icons relative block h-6 w-6 sm:h-8 sm:w-8">
											{#if state.videoAudio}
												{@html audioOnIcon}
											{:else}
												{@html audioOffIcon}
											{/if}
										</span>
									</button>
								</div>
								{#if item.caption}
									<div class="flex flex-row">
										{#if state.showCaption}
											<figcaption
												class="media-caption video"
												style={`text-align: ${isRtl ? 'right' : 'left'}`}
												dir={isRtl ? 'rtl' : 'ltr'}
											>
												{decodeHTML(item.caption)}
											</figcaption>
										{/if}

										{#if state.showCaption && state.imagesLoaded[i]}
											<div
												class={`absolute top-2 flex items-center justify-center gap-1 ${isRtl ? 'left-3' : 'right-3'}`}
											>
												<button
													class={`caption-toggle transition:all bg-opacity-70 pb-[2px] text-sm text-white opacity-90 duration-500 hover:underline hover:opacity-100 `}
													onclick={() => (state.showCaption = !state.showCaption)}
												>
													{state.showCaption ? 'Hide caption' : 'Show caption'}
												</button>
												<span class="text-sm text-burgundy">{state.showCaption ? '◉' : '◎'}</span>
											</div>
										{:else}
											<div
												class={`absolute top-2 flex items-center justify-center gap-1 ${isRtl ? 'left-3' : 'right-3'}`}
											>
												<button
													class={`caption-toggle transition:all bg-opacity-70 pb-[2px] text-sm text-white opacity-90 duration-500 hover:underline hover:opacity-100 `}
													onclick={() => (state.showCaption = !state.showCaption)}
												>
													{state.showCaption ? 'Hide caption' : 'Show caption'}
												</button>
												<span class="text-sm text-burgundy">{state.showCaption ? '◉' : '◎'}</span>
											</div>
										{/if}
									</div>
								{/if}
							</figure>
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

	.video--icons {
		opacity: 0.8;
		transition: all 0.3s ease-in-out;
	}

	.video--icons:hover {
		opacity: 1;
	}

	:global(.swiper-wrapper) {
		top: 7%;
		height: 90%;
	}

	:global(.swiper-pagination-bullets) {
		top: 1.5rem !important; /* move bullets up */
		bottom: unset !important;
	}

	@media screen and (max-width: 640px) {
		:global(.swiper-pagination-bullets) {
			top: 0.8rem !important; /* move bullets up */
		}
	}

	:global(.swiper-pagination-bullet-active) {
		background-color: #9f3e52;
		width: 5rem;
		height: 1rem;
		border-radius: 1px;
	}

	.video--controls {
		position: absolute;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	.video--play,
	.video--audio {
		color: white;
		border: none;
		font-size: 2rem;
		cursor: pointer;
	}

	@media screen and (max-width: 640px) {
		.video--play,
		.video--audio {
			font-size: 1.4rem;
		}

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
		background-image: url('/assets/ldd/patterns/example-backgropund--repetitive--sofia--small.webp');
		background-repeat: repeat;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		overflow: hidden;
		/* padding: 2rem; */
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
		max-width: 90vw;
		/* max-height: 85vh; */
	}

	@media screen and (max-width: 640px) {
		.media-figure img,
		.media-figure video {
			max-width: 100%;
			/* max-height: 80vh; */
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
		font-size: 1rem;
		box-sizing: border-box;
		font-family: 'ff-amman-serif-pro', 'Roboto', sans-serif !important;
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
		object-fit: cover;
		box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 10px -10px;
		max-height: 80vh;
	}

	@media screen and (max-width: 500px) {
		.lightbox-media img,
		.lightbox-media video {
			box-shadow: none;
		}
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
		right: 0.5rem;
		background: none;
		border: none;
		color: white;
		font-size: 5rem;
		z-index: 1001;
		cursor: pointer;
		will-change: color;
		transition: color 0.5s;
	}

	@media screen and (max-width: 640px) {
		.lightbox-close {
			font-size: 3.5rem;
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
