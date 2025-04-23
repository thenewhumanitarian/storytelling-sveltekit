<script lang="ts">
	import { onMount } from 'svelte';

	const { items, lang } = $props();
	const repeatedItems = Array.from({ length: 10 }, () => items[0]);

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
	class="horizontal-scroll-wrapper my-12 h-auto w-full overflow-x-auto pb-8 hover:cursor-move"
	dir={lang === 'ar' ? 'rtl' : 'ltr'}
>
	<div class="horizontal-scroll-content flex h-full gap-6">
		<div class="w-[20px] shrink-0"></div>
		{#each repeatedItems as item, i (i)}
			<a
				onclick={handleClick}
				href={`/stories/2025/lebanon-displacement-diaries/diaries/${item.slug}`}
				class="related-diaries--container pointer-events-none relative flex h-full w-[280px] shrink-0 select-none flex-col justify-start border-[0.5px] border-black bg-brown p-4 text-lebblack shadow transition-all duration-300 ease-in-out hover:shadow-xl sm:w-[280px]"
			>
				{#if item.content?.socialImage?.filename}
					<img
						src={`${item.content.socialImage.filename}/m/300x200`}
						alt={item.content.pageTitle}
						class="mb-4 h-[200px] w-full object-cover"
					/>
				{/if}
				<h3
					class="pointer-events-auto mb-1 text-xl font-bold hover:text-burgundy hover:underline"
				>
					{item.content.pageTitle}
				</h3>
				<p class="line-clamp-5 text-sm text-gray-700">{item.content.pageDescription}</p>
				<div
					class={`read-more-tag pointer-events-auto absolute -right-2 top-2 z-50 flex origin-left items-center justify-center`}
				>
					<h3 class="m-0 inline p-0 text-lebgreen group-hover:underline">Read</h3>
				</div>
			</a>
		{/each}
		<div class="w-[20px] shrink-0"></div>
	</div>
</div>

<style>
	.horizontal-scroll-wrapper::-webkit-scrollbar {
		height: 12px;
		background: #ffe0b5;
	}
	.horizontal-scroll-wrapper::-webkit-scrollbar-thumb {
		background: #9f3e52;
		cursor: grab;
	}

	/* Read more tag */
	.read-more-tag {
		transform: rotate(0deg);
		transition: transform 0.5s ease-in-out;
		background-image: url('/assets/ldd/patterns/tag--read-more.png');
		background-size: 100%;
		background-repeat: no-repeat;
		aspect-ratio: 241/107;
		height: 2.8rem;
		bottom: -1rem;
	}

	.read-more-tag {
		transform: rotate(0deg);
		transition: all 0.5s linear;
	}

	.related-diaries--container:hover .read-more-tag {
		transform: rotate(3deg);
		transform-origin: 50%;
	}
</style>
