<script lang="ts">
	import type { IncidentData } from './types';
	import type { HaitiLang } from './copy';
	import { copy, explosiveDroneLabel } from './copy';
	import { onMount } from 'svelte';
	import { Drone } from '@lucide/svelte';
	import { formatHaitiDate } from './dates';

	let {
		incident,
		onClose,
		onPrev,
		onNext,
		hasPrev,
		hasNext,
		lang = 'en'
	}: {
		incident: IncidentData;
		onClose: () => void;
		onPrev: () => void;
		onNext: () => void;
		hasPrev: boolean;
		hasNext: boolean;
		lang?: HaitiLang;
	} = $props();
	let dialog: HTMLDialogElement;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialog.showModal();
		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = previousOverflow;
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
			if (diff < 0 && hasNext) onNext();
			else if (diff > 0 && hasPrev) onPrev();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="modal fixed inset-0 m-auto h-full max-h-none w-full max-w-none items-center justify-center bg-white/80 open:flex"
	tabindex="-1"
	aria-modal="true"
	aria-label={incident.title}
	onclick={(event) => {
		if (event.target === dialog) onClose();
	}}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<div
		class="modal-content relative mx-2 max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-4 shadow-xl"
	>
		<div class="mb-2 flex items-center gap-2">
			<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white"
				>{incident.type === 'event' ? copy[lang].event : copy[lang].incident}</span
			>
			<span class="text-sm text-gray-700"
				>{incident.dateStatus === 'pending'
					? lang === 'fr'
						? 'Date à confirmer'
						: 'Date pending confirmation'
					: formatHaitiDate(incident.date, lang)}</span
			>
		</div>
		<h3 class="mb-2 text-lg font-bold leading-tight sm:text-xl">{incident.title}</h3>
		{#if incident.type === 'incident'}
			<div class="mb-2 flex flex-wrap gap-1">
				<span
					class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-900"
				>
					<Drone size={14} strokeWidth={2} aria-hidden="true" />
					{explosiveDroneLabel(incident.droneCount, lang)}
				</span>
			</div>
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
		{#if incident.type === 'incident' && incident.locationStatus === 'pending'}
			<p class="mb-2 text-xs text-zinc-500">
				{lang === 'fr'
					? 'Localisation à confirmer — point non cartographié.'
					: 'Location pending — no map point assigned.'}
			</p>
		{/if}
		<p class="mb-2 text-sm text-gray-700">{incident.description}</p>
		{#if incident.videoCaption}
			<p class="pt-1 text-sm text-zinc-500">{incident.videoCaption}</p>
		{/if}
		<button
			class="absolute right-[12px] top-1 text-3xl text-zinc-400 hover:cursor-pointer hover:text-burgundy"
			onclick={onClose}
			aria-label={copy[lang].close}>×</button
		>
		<div class="mt-3 flex items-center justify-between">
			<button
				class="text-2xl font-bold text-zinc-500 hover:cursor-pointer hover:text-burgundy"
				onclick={onPrev}
				disabled={!hasPrev}
				aria-label={copy[lang].previous}
				tabindex="0"
				class:opacity-50={!hasPrev}
				class:pointer-events-none={!hasPrev}>←</button
			>
			<button
				class="text-2xl font-bold text-zinc-500 hover:cursor-pointer hover:text-burgundy"
				onclick={onNext}
				disabled={!hasNext}
				aria-label={copy[lang].next}
				tabindex="0"
				class:opacity-50={!hasNext}
				class:pointer-events-none={!hasNext}>→</button
			>
		</div>
	</div>
</dialog>

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
