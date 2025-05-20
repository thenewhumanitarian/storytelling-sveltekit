<script lang="ts">
	import { onMount } from 'svelte';

	const { items, lang } = $props();
	const isRtl = lang === 'ar';
	const repeatedItems = items;

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
		let clickThreshold = 200;
		let moveThreshold = 5;
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

			if (clickDuration < clickThreshold && !moved) return;

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
		{#each items as item, i (item.uuid || i)}
			<a
				data-sveltekit-reload
				onclick={handleClick}
				href={`/stories/2025/05/22/lebanon-displacement-diaries/${lang === 'en' ? '' : `${lang}/`}diaries/${item.slug.startsWith('/') ? item.slug.slice(1) : item.slug}`}
				class="related-diaries--container pointer-events-none relative flex max-w-[280px] shrink-0 select-none flex-col justify-between border-[0.5px] border-black bg-brown p-2 text-lebblack shadow transition-all duration-300 ease-in-out hover:shadow-xl sm:w-[280px]"
			>
				{#if item.content?.previewImage?.filename}
					<div class="aspect-[4/3] w-full bg-transparent">
						<img
							src={`${item.content.previewImage.filename}/m/644x540/filters:format(webp):quality(50)`}
							alt={item.content.pageTitle}
							class="h-full w-full object-cover"
						/>
					</div>
				{/if}

				<div class="mb-3 mt-2 flex flex-grow flex-col justify-start">
					<span
						class="pointer-events-auto font-amman text-xl font-bold text-lebgreen hover:underline"
					>
						{item.content.pageTitleShort || item.content.pageTitle}
					</span>
					<p class="mt-1 line-clamp-5 font-amman text-base text-black">
						{item.content.previewText || item.content.pageDescription}
					</p>
				</div>

				<div
					class="read-more-tag pointer-events-auto z-50 flex origin-left items-center justify-center"
				>
					<h3
						class="m-0 w-full bg-lebgreen px-2 py-1 text-center text-sm font-bold text-white shadow hover:underline"
					>
						{isRtl ? 'قراءة' : 'Read'}
					</h3>
				</div>
			</a>
		{/each}
		<div class="w-[20px] shrink-0"></div>
	</div>
</div>

<style>
	.related-diaries--container {
		background-image: url('/assets/ldd/patterns/paper-texture--portrait.webp');
		background-size: cover;
	}

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
		bottom: 0.5rem;
		right: 0.5rem;
		left: unset;
	}

	:global(.arabic .horizontal-scroll-content .read-more-tag) {
		left: 0.5rem;
		right: unset;
	}
</style>
