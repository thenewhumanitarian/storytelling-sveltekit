<script lang="ts">
	import { onMount } from 'svelte';
	import type { IncidentData } from './types';
	import GazaCard from './GazaCard.svelte';
	import GazaCardModal from './GazaCardModal.svelte';

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

	let isMobile = $state(false);

	function updateIsMobile() {
		isMobile = window.innerWidth < 640;
	}

	onMount(() => {
		updateIsMobile();
		window.addEventListener('resize', updateIsMobile);

		// Ensure first card is active on mobile load
		if (
			isMobile &&
			incidentsData.length > 0 &&
			(selectedMarkerId === null || selectedMarkerId === undefined)
		) {
			onCardInView(incidentsData[0].chronoId);
		}

		return () => window.removeEventListener('resize', updateIsMobile);
	});

	export function scrollToCard(id: number) {
		if (isMobile) {
			// Mobile: horizontal stack
			const el = mobileContainer.querySelector(`[data-id="${id}"]`) as HTMLElement;
			if (el && mobileContainer) {
				const containerRect = mobileContainer.getBoundingClientRect();
				const elRect = el.getBoundingClientRect();
				const containerScrollLeft = mobileContainer.scrollLeft;
				const elOffsetLeft = elRect.left - containerRect.left + containerScrollLeft;
				const elWidth = elRect.width;
				const containerWidth = containerRect.width;
				const scrollTo = elOffsetLeft - containerWidth / 2 + elWidth / 2;
				mobileContainer.scrollTo({
					left: scrollTo,
					behavior: 'smooth'
				});
			}
		} else {
			// Desktop: vertical stack
			const el = container.querySelector(`[data-id="${id}"]`) as HTMLElement;
			if (el && container) {
				const TIMELINE_HEIGHT = 160; // px, updated to match the new timeline height (140 + 40)
				const containerRect = container.getBoundingClientRect();
				const elRect = el.getBoundingClientRect();
				const containerScrollTop = container.scrollTop;
				const elOffsetTop = elRect.top - containerRect.top + containerScrollTop;
				const elHeight = elRect.height;
				const containerHeight = containerRect.height - TIMELINE_HEIGHT;
				const scrollTo = elOffsetTop - containerHeight / 2 + elHeight / 2;
				container.scrollTo({
					top: scrollTo,
					behavior: 'smooth'
				});
			}
		}
	}

	let container: HTMLElement;
	let lastInViewId: number | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingCardId: number | null = null;

	let mobileContainer: HTMLElement;
	let lastCenteredId: number | null = null;
	function handleMobileScroll() {
		const cards = mobileContainer.querySelectorAll('[data-id]');
		let minDiff = Infinity;
		let centeredId = null;
		cards.forEach((card) => {
			const rect = (card as HTMLElement).getBoundingClientRect();
			const diff = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);
			if (diff < minDiff) {
				minDiff = diff;
				centeredId = Number((card as HTMLElement).dataset.id);
			}
		});
		if (centeredId !== null && centeredId !== lastCenteredId) {
			lastCenteredId = centeredId;
			onCardInView(centeredId);
		}
	}

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

	let modalOpen = $state(false);
	let modalIncident: IncidentData | null = $state(null);

	function openModal(incident: IncidentData) {
		modalIncident = incident;
		modalOpen = true;
	}
	function closeModal() {
		modalOpen = false;
	}
	function goToModalPrev() {
		if (!modalIncident) return;
		const idx = incidentsData.findIndex((i) => i.chronoId === modalIncident!.chronoId);
		if (idx > 0) {
			const prev = incidentsData[idx - 1];
			modalIncident = prev;
			onCardInView(prev.chronoId);
		}
	}
	function goToModalNext() {
		if (!modalIncident) return;
		const idx = incidentsData.findIndex((i) => i.chronoId === modalIncident!.chronoId);
		if (idx < incidentsData.length - 1) {
			const next = incidentsData[idx + 1];
			modalIncident = next;
			onCardInView(next.chronoId);
		}
	}

	let isDragging = false;
	let dragStartX = 0;
	let dragStartScrollLeft = 0;

	function handleDesktopMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // Only left mouse button
		isDragging = true;
		dragStartX = e.clientX;
		dragStartScrollLeft = container.scrollLeft;
		container.classList.add('dragging');
		document.body.style.cursor = 'grabbing';
	}
	function handleDesktopMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const dx = e.clientX - dragStartX;
		container.scrollLeft = dragStartScrollLeft - dx;
	}
	function handleDesktopMouseUp() {
		isDragging = false;
		container.classList.remove('dragging');
		document.body.style.cursor = '';
	}

	onMount(() => {
		// Desktop drag-to-scroll events
		container.addEventListener('mousedown', handleDesktopMouseDown);
		window.addEventListener('mousemove', handleDesktopMouseMove);
		window.addEventListener('mouseup', handleDesktopMouseUp);

		return () => {
			window.removeEventListener('resize', updateIsMobile);
			container.removeEventListener('mousedown', handleDesktopMouseDown);
			window.removeEventListener('mousemove', handleDesktopMouseMove);
			window.removeEventListener('mouseup', handleDesktopMouseUp);
		};
	});
</script>

<div
	bind:this={container}
	class="fixed top-0 right-0 z-10 hidden w-full h-full pt-10 overflow-y-scroll bg-transparent shadow-lg stack-cards js-stack-cards scrollbar-none cursor-grab pb-36 sm:block sm:w-1/2 sm:cursor-default"
	class:cursor-grabbing={isDragging}
>
	<div
		class="fixed top-0 right-0 z-50 flex items-center justify-between w-full h-10 px-4 shadow-lg bg-white/80 backdrop-blur sm:w-1/2"
	>
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

<!-- MOBILE: horizontal snap row (easy to revert, just remove this block) -->
<div
	bind:this={mobileContainer}
	class="flex w-full overflow-x-auto bg-transparent stack-cards--mobile snap-x snap-mandatory sm:hidden"
	onscroll={handleMobileScroll}
>
	{#each incidentsData as incident, i (incident.chronoId)}
		<div class="flex-shrink-0 w-full snap-center min-h-[25svh] h-full" data-id={incident.chronoId}>
			<GazaCard
				{incident}
				{selectedMarkerId}
				goToPrevCard={() => (i > 0 ? scrollToCard(incidentsData[i - 1].chronoId) : null)}
				goToNextCard={() =>
					i < incidentsData.length - 1 ? scrollToCard(incidentsData[i + 1].chronoId) : null}
				hasPrev={i > 0}
				hasNext={i < incidentsData.length - 1}
			>
				<div slot="readmore" class="sm:hidden">
					{#if incident.sources && incident.sources.trim() !== ''}
						<div class="flex gap-2">
							<button
								class="flex-1 py-2 text-sm font-semibold text-white bg-burgundy"
								onclick={() => openModal(incident)}
							>
								Read more
							</button>
							<button
								class="flex-1 py-2 text-sm font-semibold text-white bg-zinc-600"
								onclick={() => openModal(incident)}
							>
								Show sources
							</button>
						</div>
					{:else}
						<button
							class="block w-full py-2 text-sm font-semibold text-white bg-burgundy"
							onclick={() => openModal(incident)}
						>
							Read more
						</button>
					{/if}
				</div>
			</GazaCard>
		</div>
	{/each}
	{#if modalOpen && modalIncident}
		<GazaCardModal
			incident={modalIncident!}
			onClose={closeModal}
			onPrev={goToModalPrev}
			onNext={goToModalNext}
			hasPrev={incidentsData.findIndex((i) => i.chronoId === modalIncident!.chronoId) > 0}
			hasNext={incidentsData.findIndex((i) => i.chronoId === modalIncident!.chronoId) <
				incidentsData.length - 1}
		/>
	{/if}
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
	.stack-cards--mobile {
		overflow-x: auto;
		/* height: calc(50svh - 145px); */
		overflow-y: hidden;
		/* Hide scrollbar for all browsers */
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}
	.stack-cards--mobile::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}
	/* @media (width <= 640px) {
		.stack-cards--mobile {
			height: 20svh;
		}
	} */
</style>
