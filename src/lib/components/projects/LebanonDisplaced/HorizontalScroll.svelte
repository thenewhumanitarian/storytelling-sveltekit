<script lang="ts">
	import { onMount } from 'svelte';

	const { items, lang } = $props();
	const repeatedItems = Array.from({ length: 10 }, () => items[0]);

	let scrollWrapper: HTMLDivElement;

	onMount(() => {
		const el = scrollWrapper;
		if (!el) return;

		const handleWheel = (e: WheelEvent) => {
			if (e.deltaY === 0) return;
			e.preventDefault();
			el.scrollLeft += lang === 'ar' ? -e.deltaY : e.deltaY;
		};

		el.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			el.removeEventListener('wheel', handleWheel);
		};
	});
</script>

<div
	bind:this={scrollWrapper}
	class="horizontal-scroll-wrapper my-12 h-auto w-full overflow-x-auto pb-8"
	dir={lang === 'ar' ? 'rtl' : 'ltr'}
>
	<div class="horizontal-scroll-content flex h-full gap-6">
		<div class="w-[20px] shrink-0"></div>

		{#each repeatedItems as item, i (i)}
			<a
				href={`/stories/2025/lebanon-displacement-diaries/diaries/${item.slug}`}
				class="flex h-full w-240px sm:w-[280px] shrink-0 flex-col justify-start border-[0.5px] border-black bg-[#ffe0b5] p-4 shadow hover:shadow-xl transition-all duration-300 ease-in-out"

			>
				{#if item.content?.socialImage?.filename}
					<img
						src={`${item.content.socialImage.filename}/m/300x200`}
						alt={item.content.pageTitle}
						class="mb-4 h-[200px] w-full object-cover"
					/>
				{/if}
				<h3 class="text-xl font-semibold mb-1">{item.content.pageTitle}</h3>
				<p class="line-clamp-5 text-sm text-gray-700">{item.content.pageDescription}</p>
			</a>
		{/each}

		<div class="w-[20px] shrink-0"></div>
	</div>
</div>

<style>
	.horizontal-scroll-wrapper::-webkit-scrollbar {
		height: 10px;
		background: #ffe0b5;
	}
	.horizontal-scroll-wrapper::-webkit-scrollbar-thumb {
		background: #9f3e52;
		cursor: grab;
	}
</style>
