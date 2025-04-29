<script lang="ts">
	import { tick, getContext, onMount, onDestroy } from 'svelte';

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	import Swiper from 'swiper';
	import { Navigation, Pagination, Keyboard } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';

	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	// Update LightboxItem type to include 'alt' property
	type LightboxItem = {
		type: 'image' | 'video';
		src: string;
		width?: number;
		height?: number;
		alt?: string; // Add 'alt' property
		caption?: string;
	};

	let swiperEl: HTMLDivElement;
	let swiper: Swiper | undefined;

	// Stop all videos when the lightbox is closed
	$effect(() => {
		if (!state.isVisible && swiper) {
			swiper.destroy(true, true);
			swiper = undefined;
		}
	});

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
			}
		};
		window.addEventListener('keydown', handleKeydown);

		onDestroy(() => {
			window.removeEventListener('keydown', handleKeydown);
		});
	});

	const state = $state<{
		index: number | null;
		isVisible: boolean;
	}>({
		index: null,
		isVisible: false
	});

	$effect(() => {
		state.index = $currentIndex;
		state.isVisible = $currentIndex !== null;
	});

	const close = () => currentIndex.set(null);

	$effect(async () => {
		if (!state.isVisible || state.index === null) return;

		await tick(); // Ensure DOM

		if (!swiper) {
			swiper = new Swiper(swiperEl, {
				modules: [Navigation, Pagination, Keyboard],
				initialSlide: state.index ?? 0,
				zoom: {
					maxRatio: 3,
					minRatio: 1
				},
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

				// 🔇 Pause all videos except the active one
				videoEls.forEach((video, i) => {
					if (!video) return;
					if (i === swiper.realIndex) {
						video.play().catch(() => {});
					} else {
						video.pause();
						video.currentTime = 0; // optional: reset video to beginning
					}
				});
			});
		} else {
			swiper.slideTo(state.index, 0);
		}
	});

	$effect(() => {
		if (!state.isVisible && swiper) {
			swiper.destroy(true, true);
			swiper = undefined;
		}
	});

	let videoEls: (HTMLVideoElement | undefined)[] = [];

	$effect(() => {
		if (!swiper || !$lightboxItems.length) return;

		videoEls.forEach((video, i) => {
			if (!video) return;

			if (i === swiper.realIndex) {
				video.play().catch(() => {});
			} else {
				video.pause();
			}
		});
	<div
		class="lightbox-overlay"
		role="dialog"
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
			}
		}}
	>
			e.stopPropagation();
			close();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
		<div
			bind:this={swiperEl}
			class="swiper lightbox-swiper"
			role="region"
			dir={isRtl ? 'rtl' : 'ltr'}
		>
				e.stopPropagation();
			}}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			<div class="swiper-wrapper">
				{#each $lightboxItems as item, i}
					<div class="swiper-slide lightbox-media">
						{#if item.type === 'image'}
							<figure
								class="media-figure bg-brown"
								style={`aspect-ratio: ${item.width} / ${item.height};`}
							>
								<div class="h-full w-full bg-lebgreen absolute top-0 left-0 -z-1"></div>
								<img
									src={`${item.src}/m/1024x0`}
									alt={item.alt || 'Photo alt text is missing.'}
									loading="lazy"
								/>
								<img
									src={`${item.src}/m/1024x0`}
									alt={item.alt || 'Photo alt text is missing.'}
									loading="lazy"
									class="absolute top-0 left-0 w-full h-full object-contain"
								/>
								{#if item.caption}
									<figcaption
										class="media-caption"
										style={`text-align: ${isRtl ? 'right' : 'left'}`}
										dir={isRtl ? 'rtl' : 'ltr'}
									>
										{decodeHTML(item.caption)}
									</figcaption>
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

			<!-- Navigation -->
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
			<div class="swiper-pagination"></div>
		</div>

		<!-- Close Button -->
		<button
			class="lightbox-close"
			type="button"
			onclick={(e) => {
				e.preventDefault();
				close();
			}}
		>
			×
		</button>
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
	.lightbox-overlay {
		z-index: 9999;
		position: fixed;
		inset: 0;
		background: #ffe0b5;
		background-image: url('/assets/ldd/patterns/example-backgropund--repetitive--sofia--small.png');
		background-repeat: repeat;
		/* background-image: url('/assets/ldd/patterns/beige-paper-texture.png'); */
		/* background-size: cover; */
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		box-sizing: border-box;
		overflow: hidden;
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

	.lightbox-close:hover,
	.swiper-button-next:hover,
	.swiper-button-prev:hover {
		color: #9f3e52;
	}
</style>
