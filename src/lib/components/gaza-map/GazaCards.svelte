<script lang="ts">
	import { onMount } from 'svelte';
	import type { IncidentData } from './types';
	import GazaCard from './GazaCard.svelte';

	// Props
	let {
		incidentsData,
		selectedMarkerId,
		onCardInView
	}: {
		incidentsData: IncidentData[];
		selectedMarkerId: number | null;
		onCardInView: (id: number) => void;
	} = $props();

	// console.log(incidentsData);

	export function scrollToCard(id: number) {
		const el = container.querySelector(`[data-id="${id}"]`) as HTMLElement;
		if (el && container) {
			const TIMELINE_HEIGHT = 120; // px, must match the timeline SVG height
			const containerRect = container.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const containerScrollTop = container.scrollTop;
			const elOffsetTop = elRect.top - containerRect.top + containerScrollTop;
			const elHeight = elRect.height;
			const containerHeight = containerRect.height - TIMELINE_HEIGHT;
			const scrollTo = elOffsetTop - (containerHeight / 2) + (elHeight / 2);
			container.scrollTo({
				top: scrollTo,
				behavior: 'smooth'
			});
		}
	}

	let container: HTMLElement;
	let lastInViewId: number | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingCardId: number | null = null;

	function goToPrevCard() {
		const index = incidentsData.findIndex((i) => i.chronoId === selectedMarkerId);
		if (index > 0) {
			const prevId = incidentsData[index - 1].chronoId;
			scrollToCard(prevId);
		}
	}

	function goToNextCard() {
		const index = incidentsData.findIndex((i) => i.chronoId === selectedMarkerId);
		if (index < incidentsData.length - 1 && index !== -1) {
			const nextId = incidentsData[index + 1].chronoId;
			scrollToCard(nextId);
		}
	}

	function debounceTrigger(id: number) {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		pendingCardId = id;

		debounceTimer = setTimeout(() => {
			if (pendingCardId !== null && pendingCardId !== lastInViewId) {
				// console.log(`🕓 Debounced trigger: ${pendingCardId}`);
				lastInViewId = pendingCardId;
				onCardInView?.(pendingCardId);
			}
			debounceTimer = null;
		}, 250);
	}

	onMount(() => {
		const cards = container.querySelectorAll('.js-stack-cards__item');

		const observer = new IntersectionObserver(
			(entries) => {
				const intersecting = entries
					.filter((e) => e.isIntersecting)
					.map((e) => ({
						id: Number((e.target as HTMLElement).dataset.id),
						top: e.boundingClientRect.top
					}))
					.sort((a, b) => a.top - b.top);

				entries.forEach((entry) => {
					const id = Number((entry.target as HTMLElement).dataset.id);
					// console.log(
					// 	`📌 Card ${id} ${entry.isIntersecting ? 'entered' : 'left'}, top: ${entry.boundingClientRect.top.toFixed(1)}`
					// );

					if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
						const index = incidentsData.findIndex((i) => i.chronoId === id);
						if (index > 0) {
							const prevId = incidentsData[index - 1].chronoId;
							// console.log(`⬆️ Scrolled up, will trigger: ${prevId}`);
							debounceTrigger(prevId);
						}
					}
				});

				if (intersecting.length > 0) {
					const topCardId = intersecting[0].id;
					// console.log(`👀 Top visible card: ${topCardId}`);
					debounceTrigger(topCardId);
				}
			},
			{
				root: container,
				threshold: 1
			}
		);

		cards.forEach((card) => observer.observe(card));
	});
</script>

<div
	bind:this={container}
	class="stack-cards js-stack-cards fixed right-0 top-0 z-10 h-full w-1/2 overflow-y-scroll scrollbar-none bg-transparent pb-36 pt-6 shadow-lg"
>
	<div class="fixed right-0 top-0 z-50 flex h-10 w-1/2 items-center justify-between bg-white px-4">
		<button
			class={`text-sm text-zinc-600 transition-opacity duration-500 ${selectedMarkerId === 0 ? 'pointer-events-none opacity-50' : ''}`}
			onclick={goToPrevCard}>↑ Up</button
		>
		<button
			class={`text-sm text-zinc-600 transition-opacity duration-500 ${selectedMarkerId && selectedMarkerId === incidentsData.length - 1 ? 'pointer-events-none opacity-50' : ''}`}
			onclick={goToNextCard}>Down ↓</button
		>
	</div>
	{#each incidentsData as incident (incident.chronoId)}
		<GazaCard {incident} {selectedMarkerId} />
	{/each}
</div>

<style>
/* Hide scrollbar for all browsers */
.stack-cards::-webkit-scrollbar {
	display: none;
}
.stack-cards {
	scrollbar-width: none;
	-ms-overflow-style: none;
}
</style>
