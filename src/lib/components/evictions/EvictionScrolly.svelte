<script lang="ts">
	/**
	 * EvictionScrolly - Data visualization for eviction operations
	 *
	 * Displays eviction data as either:
	 * - Clustered bubbles (by category)
	 * - Timeline bubbles (by date)
	 * - Line graph (yearly totals)
	 *
	 * Receives activeStep from parent ScrollySection and renders
	 * the appropriate visualization based on the step.
	 */
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import EvictionBubbles from './EvictionBubbles.svelte';
	import EvictionLineGraph from './EvictionLineGraph.svelte';

	interface Props {
		activeStep: number;
	}

	let { activeStep }: Props = $props();

	// Data state
	let data = $state<any[]>([]);
	let yearlyData = $state<any[]>([]);
	let mounted = $state(false);
	let containerEl: HTMLDivElement | undefined = $state();
	let containerWidth = $state(800);
	let containerHeight = $state(600);

	// Derived visualization mode based on step
	// Steps 0-1: intro + justifications (clustered)
	// Steps 2-5: category highlights (clustered)
	// Steps 6-8: timeline view
	// Steps 9+: line graph
	let vizMode = $derived<'clustered' | 'timeline' | 'linegraph'>(
		activeStep >= 9 ? 'linegraph' :
		activeStep >= 6 ? 'timeline' :
		'clustered'
	);

	let mode = $derived<'clustered' | 'timeline'>(
		vizMode === 'timeline' ? 'timeline' : 'clustered'
	);

	let highlightCategory = $derived<string | null>(
		activeStep === 2 ? 'Environmental Protection' :
		activeStep === 3 ? 'Development Projects' :
		activeStep === 4 ? 'Administrative Enforcement' :
		activeStep === 5 ? 'Religious Land (Satra)' :
		null
	);

	let highlightYear = $derived<number | null>(
		activeStep === 7 ? 2021 :
		activeStep === 8 ? 2025 :
		activeStep === 10 ? 2021 :
		activeStep === 11 ? 2025 :
		null
	);

	let revealedCategories = $derived<string[]>(
		activeStep >= 5 ? ['Environmental Protection', 'Development Projects', 'Administrative Enforcement', 'Religious Land (Satra)'] :
		activeStep >= 4 ? ['Environmental Protection', 'Development Projects', 'Administrative Enforcement'] :
		activeStep >= 3 ? ['Environmental Protection', 'Development Projects'] :
		activeStep >= 2 ? ['Environmental Protection'] :
		[]
	);

	let showSizeLegend = $derived(activeStep < 9);
	let legendHighlight = $derived(activeStep === 0);
	let showCategoryLabels = $derived(activeStep >= 1 && activeStep < 6);

	// Load data on mount
	onMount(() => {
		loadData();
		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	});

	async function loadData() {
		try {
			const [evictionsRes, yearlyRes] = await Promise.all([
				fetch('/data/cleared/evictions_sorted.csv'),
				fetch('/data/cleared/evictions_per_year.csv')
			]);

			const evictionsText = await evictionsRes.text();
			data = parseCSV(evictionsText);

			const yearlyText = await yearlyRes.text();
			yearlyData = parseYearlyCSV(yearlyText);
		} catch (err) {
			console.error('Failed to load eviction data:', err);
		}
		mounted = true;
		updateDimensions();
	}

	function parseYearlyCSV(text: string): any[] {
		const lines = text.trim().split('\n');
		const headers = lines[0].split(',').map(h => h.trim());

		return lines.slice(1).filter(line => line.trim()).map(line => {
			const values = line.split(',');
			const obj: Record<string, any> = {};
			headers.forEach((h, i) => {
				let val: any = values[i]?.trim() || '';
				if (h === 'Year' || h === 'Events' || h === 'Total_People_Evicted' || h === 'Deaths' || h === 'Injuries') {
					val = parseInt(val) || 0;
				}
				obj[h] = val;
			});
			return obj;
		}).filter(d => d.Year > 0);
	}

	function parseCSV(text: string): any[] {
		const lines = text.trim().split('\n');
		const headers = lines[0].split(',').map(h => h.trim());

		return lines.slice(1).filter(line => line.trim()).map(line => {
			const values: string[] = [];
			let current = '';
			let inQuotes = false;

			for (const char of line) {
				if (char === '"') {
					inQuotes = !inQuotes;
				} else if (char === ',' && !inQuotes) {
					values.push(current.trim());
					current = '';
				} else {
					current += char;
				}
			}
			values.push(current.trim());

			const obj: Record<string, any> = {};
			headers.forEach((h, i) => {
				let val: any = values[i] || '';
				if (h === 'People_Evicted' || h === 'Families_Evicted' || h === 'Structures_Demolished') {
					val = parseFloat(val) || 0;
				}
				obj[h] = val;
			});
			return obj;
		}).filter(d => d.People_Evicted > 0);
	}

	function updateDimensions() {
		if (containerEl) {
			containerWidth = Math.min(containerEl.clientWidth, 900);
			containerHeight = Math.min(window.innerHeight * 0.8, 700);
		}
	}

</script>

<div class="eviction-viz" bind:this={containerEl}>
	<div class="viz-container">
		{#if mounted && data.length > 0}
			{#key vizMode === 'linegraph'}
				{#if vizMode === 'linegraph'}
					<div class="viz-wrapper" in:fade={{ duration: 500, delay: 300 }} out:fade={{ duration: 200 }}>
						<EvictionLineGraph
							data={yearlyData}
							width={containerWidth}
							height={containerHeight}
							{highlightYear}
							animate={true}
						/>
					</div>
				{:else}
					<div class="viz-wrapper" in:fade={{ duration: 400, delay: 100 }} out:fade={{ duration: 200 }}>
						<EvictionBubbles
							{data}
							{mode}
							{highlightCategory}
							{highlightYear}
							{revealedCategories}
							{showCategoryLabels}
							width={containerWidth}
							height={containerHeight}
						/>
					</div>
				{/if}
			{/key}
		{:else}
			<div class="loading">Loading visualization...</div>
		{/if}
	</div>

	<!-- Size Legend -->
	{#if showSizeLegend}
		<div class="size-legend" class:legend-highlight={legendHighlight} transition:fade={{ duration: 300 }}>
			<div class="legend-title">People displaced</div>
			<div class="legend-items">
				<div class="legend-item">
					<svg width="20" height="20">
						<circle cx="10" cy="10" r="8" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
					</svg>
					<span>500</span>
				</div>
				<div class="legend-item">
					<svg width="32" height="32">
						<circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
					</svg>
					<span>5,000</span>
				</div>
				<div class="legend-item">
					<svg width="50" height="50">
						<circle cx="25" cy="25" r="22" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
					</svg>
					<span>13,000</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.eviction-viz {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.viz-container {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.loading {
		color: rgba(0, 0, 0, 0.4);
		font-family: 'Source Sans 3', sans-serif;
		text-align: center;
		padding: 2rem;
	}

	.viz-wrapper {
		width: 100%;
		height: 100%;
	}

	.size-legend {
		position: absolute;
		bottom: 2rem;
		left: 2rem;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(4px);
		padding: 0.75rem 1rem;
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	@media (max-width: 600px) {
		.size-legend {
			bottom: 1rem;
			left: 1rem;
			padding: 0.5rem 0.75rem;
		}

		.legend-items {
			gap: 0.5rem;
		}

		.legend-item svg {
			transform: scale(0.8);
		}
	}

	.legend-title {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 11px;
		font-weight: 500;
		color: rgba(0, 0, 0, 0.45);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.5rem;
	}

	.legend-items {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}

	.legend-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.legend-item span {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 11px;
		color: rgba(0, 0, 0, 0.5);
	}

	.size-legend.legend-highlight {
		animation: legendPulse 2s ease-in-out infinite;
		border-color: rgba(0, 0, 0, 0.2);
	}

	@keyframes legendPulse {
		0%, 100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 20px 4px rgba(0, 0, 0, 0.08);
		}
	}
</style>
