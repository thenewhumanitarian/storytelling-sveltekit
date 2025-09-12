<script lang="ts">
	import type { IncidentData } from './types';
	import { createEventDispatcher, onMount } from 'svelte';
	import moment from 'moment';

	export let incident: IncidentData;
	export let onClose: () => void;
	export let onPrev: () => void;
	export let onNext: () => void;
	export let hasPrev: boolean;
	export let hasNext: boolean;

	const dispatch = createEventDispatcher();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}
	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		const diff = touchEndX - touchStartX;
		if (Math.abs(diff) > 50) {
			if (diff < 0) onNext();
			else onPrev();
		}
	}
</script>

<div
	class="modal fixed inset-0 z-50 flex items-center justify-center bg-white/80"
	tabindex="-1"
	aria-modal="true"
	role="dialog"
	onclick={() => onClose()}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<div
		class="modal-content relative mx-2 max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-4 shadow-xl"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="mb-2 flex items-center gap-2">
			<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white"
				>{incident.type === 'event' ? 'Event' : 'Incident'}</span
			>
			<span class="text-sm text-gray-700">{moment(incident.date).format('DD MMMM YYYY')}</span>
		</div>
		<h3 class="mb-2 text-lg font-bold leading-tight sm:text-xl">{incident.title}</h3>
		{#if incident.killedOrWounded}
			<h5 class="mb-2 text-sm italic text-gray-600 sm:text-base">
				{incident.killedOrWounded} killed/wounded
			</h5>
		{/if}
		{#if incident.videoUrl}
			<video
				class="aspect-video mb-2 w-full rounded-lg"
				src={incident.videoUrl}
				controls
				aria-label={incident.videoCaption || incident.title}
			></video>
		{:else if incident.imageUrl}
			<img
				class="aspect-video mb-2 w-full rounded-lg"
				src={incident.imageUrl}
				alt={incident.imageCaption || incident.title}
			/>
		{/if}
		{#if incident.description && incident.description.includes('<')}
			<div class="mb-2 text-sm text-gray-700">{@html incident.description}</div>
		{:else}
			<p class="mb-2 text-sm text-gray-700">{incident.description}</p>
		{/if}
		{#if incident.videoCaption}
			<p class="pt-1 text-sm text-zinc-500">{incident.videoCaption}</p>
		{/if}
		<button
			class="absolute right-[12px] top-1 text-3xl text-zinc-400 hover:text-burgundy"
			onclick={onClose}
			aria-label="Close">×</button
		>
		<div class="mt-3 flex items-center justify-between">
			<button
				class="text-2xl font-bold text-zinc-500 hover:text-burgundy"
				onclick={onPrev}
				disabled={!hasPrev}
				aria-label="Previous"
				tabindex="0"
				class:opacity-50={!hasPrev}
				class:pointer-events-none={!hasPrev}>←</button
			>
			<button
				class="text-2xl font-bold text-zinc-500 hover:text-burgundy"
				onclick={onNext}
				disabled={!hasNext}
				aria-label="Next"
				tabindex="0"
				class:opacity-50={!hasNext}
				class:pointer-events-none={!hasNext}>→</button
			>
		</div>
	</div>
</div>

<style>
	.modal {
		animation: fadeIn 0.2s;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
