<script lang="ts">
	import { untrack } from 'svelte';
	import type { HaitiLang, IncidentData } from './types';
	import { formatHaitiDate } from './dates';

	let {
		incidentsData,
		selectedMarkerId,
		lang = 'en'
	}: {
		incidentsData: IncidentData[];
		selectedMarkerId: number | null;
		lang?: HaitiLang;
	} = $props();

	const activeRecord = $derived(
		selectedMarkerId === null
			? null
			: (incidentsData.find((record) => record.chronoId === selectedMarkerId) ?? null)
	);
	const cumulativeTotal = $derived(
		activeRecord === null
			? 0
			: incidentsData
					.filter((record) => record.type === 'incident' && record.date <= activeRecord.date)
					.reduce((total, record) => total + (record.droneCount ?? 0), 0)
	);

	let displayedTotal = $state(0);

	$effect(() => {
		const target = cumulativeTotal;
		let animationFrame = 0;
		const timer = window.setTimeout(() => {
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const startValue = untrack(() => displayedTotal);
			if (reducedMotion || startValue === target) {
				displayedTotal = target;
				return;
			}

			const startedAt = performance.now();
			const duration = 450;
			const animate = (now: number) => {
				const progress = Math.min((now - startedAt) / duration, 1);
				const eased = 1 - Math.pow(1 - progress, 3);
				displayedTotal = Math.round(startValue + (target - startValue) * eased);
				if (progress < 1) animationFrame = requestAnimationFrame(animate);
			};
			animationFrame = requestAnimationFrame(animate);
		}, 120);

		return () => {
			window.clearTimeout(timer);
			cancelAnimationFrame(animationFrame);
		};
	});

	const formattedTotal = $derived(displayedTotal.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB'));
</script>

{#if activeRecord}
	<div
		class="pointer-events-none absolute right-0 bottom-0 z-30 flex h-48 w-80 flex-col justify-end pr-2 pb-2 text-right text-zinc-800"
		style="background: radial-gradient(circle 160px at 100% 100%, rgba(255, 255, 255, 0.96) 0, rgba(255, 255, 255, 0.72) 35px, rgba(255, 255, 255, 0.34) 78px, rgba(255, 255, 255, 0.1) 112px, rgba(255, 255, 255, 0) 145px);"
	>
		<div aria-hidden="true">
			<div class="flex items-center justify-end">
				<strong class="font-serif text-2xl leading-none text-burgundy">{formattedTotal}</strong>
			</div>
			<p class="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-700">
				{lang === 'fr' ? 'Total des drones' : 'Total drones'}
			</p>
			<p class="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.05em] text-zinc-500">
				{lang === 'fr' ? 'au' : 'by'}
				{formatHaitiDate(activeRecord.date, lang)}
			</p>
		</div>
		<span class="sr-only" aria-live="polite">
			{cumulativeTotal}
			{lang === 'fr' ? 'drones recensés au' : 'total drones recorded by'}
			{formatHaitiDate(activeRecord.date, lang)}
		</span>
	</div>
{/if}
