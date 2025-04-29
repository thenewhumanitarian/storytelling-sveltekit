<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public';

	let baseUrl = PUBLIC_BASE_URL || 'https://localhost:5173';

	const { items, lang } = $props();
	const repeatedItems = Array.from({ length: 10 }, () => items[(Math.random() * items.length) | 0]);

	let scrollWrapper: HTMLDivElement;
	let isDown = false;
	let startX: number;
	let scrollLeft: number;
	let isDragging = false;

	onMount(() => {
		const el = scrollWrapper;
		if (!el) return;

		const handleMouseLeave = () => {
			isDown = false;
			el.classList.remove('dragging');
		};

		let clickStartTime = 0;
		let clickThreshold = 200; // milliseconds
		let moveThreshold = 5; // pixels

		let startXCoord = 0;

		const handleMouseDown = (e: MouseEvent) => {
			isDown = true;
			isDragging = false;
			clickStartTime = Date.now();
			startX = e.pageX - el.offsetLeft;
			startXCoord = e.pageX;
			scrollLeft = el.scrollLeft;
			el.classList.add('dragging');
		};

		const handleMouseUp = (e: MouseEvent) => {
			const clickDuration = Date.now() - clickStartTime;
			const moved = Math.abs(e.pageX - startXCoord) > moveThreshold;

			isDown = false;
			isDragging = false;
			el.classList.remove('dragging');

			if (clickDuration < clickThreshold && !moved) {
				// It was a genuine click — allow it
				return;
			}

			// It was a drag — prevent navigation
			e.preventDefault();
			e.stopImmediatePropagation();
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDown) return;
			e.preventDefault();
			isDragging = true;
			const x = e.pageX - el.offsetLeft;
			const walk = (x - startX) * 1.5;
			el.scrollLeft = scrollLeft - walk;
		};

		el.addEventListener('mousedown', handleMouseDown);
		el.addEventListener('mouseleave', handleMouseLeave);
		el.addEventListener('mouseup', handleMouseUp);
		el.addEventListener('mousemove', handleMouseMove);

		return () => {
			el.removeEventListener('mousedown', handleMouseDown);
			el.removeEventListener('mouseleave', handleMouseLeave);
			el.removeEventListener('mouseup', handleMouseUp);
			el.removeEventListener('mousemove', handleMouseMove);
		};
	});

	function handleClick(e: MouseEvent) {
		if (isDragging) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}
</script>

<div
	bind:this={scrollWrapper}
	class="horizontal-scroll-wrapper my-6 h-auto w-full overflow-x-auto pb-8 hover:cursor-move sm:my-12"
	dir={lang === 'ar' ? 'rtl' : 'ltr'}
>
	<div class="horizontal-scroll-content flex h-full gap-6">
		<div class="w-[20px] shrink-0"></div>
		{#each repeatedItems as item, i (i)}
			<a
				data-sveltekit-reload
				onclick={handleClick}
				href={`/stories/2025/lebanon-displacement-diaries/${lang === 'en' ? '' : `${lang}/`}diaries/${item.slug.startsWith('/') ? item.slug.slice(1) : item.slug}`}
				class="related-diaries--container pointer-events-none relative flex h-full max-w-[280px] shrink-0 select-none flex-col justify-start border-[0.5px] border-black bg-brown p-4 text-lebblack shadow transition-all duration-300 ease-in-out hover:shadow-xl sm:w-[280px]"
			>
				{#if item.content?.previewImage?.filename}
					<img
						src={`${item.content.previewImage.filename}/m/640x360/filters:format(jpg):quality(50)`}
						alt={item.content.pageTitle}
						class="mb-4 w-full object-cover"
					/>
				{/if}
				<span
					class="pointer-events-auto mb-1 inline-block font-serif text-xl font-bold hover:text-burgundy hover:underline"
				>
					{item.content.pageTitle}
				</span>
				<p class="line-clamp-5 font-amman text-base text-gray-700">
					{item.content.previewText || item.content.pageDescription}
				</p>
				<div
					class={`read-more-tag pointer-events-auto absolute top-0 z-50 flex origin-left items-center justify-center bg-lebgreen px-2 py-1`}
				>
					<h3 class="m-0 inline p-0 text-base text-white hover:underline">Read</h3>
				</div>
			</a>
		{/each}
		<div class="w-[20px] shrink-0"></div>
	</div>
</div>

<style>
	.related-diaries--container img {
		aspect-ratio: auto;
	}
	.horizontal-scroll-wrapper::-webkit-scrollbar {
		height: 12px;
		background: #ffe0b5;
	}
	.horizontal-scroll-wrapper::-webkit-scrollbar-thumb {
		background: #9f3e52;
		cursor: grab;
	}

	.read-more-tag {
		transform: rotate(0deg);
		transition: all 0.5s linear;
	}

	.read-more-tag {
		right: 0;
		left: unset;
	}

	:global(.arabic .horizontal-scroll-content .read-more-tag) {
		left: 0;
		right: unset;
	}
</style>
