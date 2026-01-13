<script lang="ts">
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { fade } from 'svelte/transition';
	import EvictionBubbles from './EvictionBubbles.svelte';
	import EvictionLineGraph from './EvictionLineGraph.svelte';

	// State
	let data: any[] = $state([]);
	let yearlyData: any[] = $state([]);
	let activeStep = $state(0);
	let mounted = $state(false);
	let containerWidth = $state(800);
	let containerHeight = $state(600);
	let containerEl: HTMLDivElement;

	// Derived state for visualization
	// Steps 0-4: clustered bubbles
	// Steps 5-7: timeline view
	// Steps 8+: line graph
	let vizMode: 'clustered' | 'timeline' | 'linegraph' = $derived(
		activeStep >= 8 ? 'linegraph' :
		activeStep >= 5 ? 'timeline' :
		'clustered'
	);
	let mode: 'clustered' | 'timeline' = $derived(vizMode === 'timeline' ? 'timeline' : 'clustered');

	let highlightCategory: string | null = $derived(
		activeStep === 1 ? 'Environmental Protection' :
		activeStep === 2 ? 'Development Projects' :
		activeStep === 3 ? 'Administrative Enforcement' :
		activeStep === 4 ? 'Religious Land (Satra)' :
		null
	);

	// For timeline mode (steps 5-7)
	let highlightYear: number | null = $derived(
		activeStep === 6 ? 2021 :
		activeStep === 7 ? 2025 :
		activeStep === 9 ? 2021 :
		activeStep === 10 ? 2025 :
		null
	);

	// Track which categories have been revealed (for progressive color reveal)
	let revealedCategories: string[] = $derived(
		activeStep >= 4 ? ['Environmental Protection', 'Development Projects', 'Administrative Enforcement', 'Religious Land (Satra)'] :
		activeStep >= 3 ? ['Environmental Protection', 'Development Projects', 'Administrative Enforcement'] :
		activeStep >= 2 ? ['Environmental Protection', 'Development Projects'] :
		activeStep >= 1 ? ['Environmental Protection'] :
		[]
	);

	// Scroll steps content
	// Steps 0-1: Intro with justifications
	// Steps 2-5: Clustered bubbles with category highlights
	// Steps 6-8: Timeline view
	// Steps 9-11: Line graph
	const scrollSteps = [
		{
			text: 'Between 2021 and 2026, <strong>33 documented eviction events</strong> displaced over <strong>100,000 people</strong> across Assam. Each bubble represents one operation — the larger the bubble, the more people displaced.'
		},
		{
			text: 'The government cited various legal grounds: forest protection, wildlife sanctuary clearance, elephant corridor restoration, agricultural projects, religious land reclamation, and wetland conservation. We\'ve grouped these into <strong>four categories</strong>.'
		},
		{
			text: 'The largest category: <span class="highlight-env">Environmental Protection</span> — forest clearances, wildlife sanctuaries, elephant corridors. 12 events affecting over 60,000 people.'
		},
		{
			text: '<span class="highlight-dev">Development Projects</span> cleared land for corporate investment, including the Rs 48,000 crore Adani thermal power plant in Dhubri.'
		},
		{
			text: '<span class="highlight-admin">Administrative Enforcement</span> targeted alleged "encroachers" on government land, including controversial border pushbacks to Bangladesh.'
		},
		{
			text: '<span class="highlight-satra">Religious Land (Satra)</span> evictions cleared land claimed by Hindu monasteries in Barpeta and Nagaon districts.'
		},
		// Timeline steps (6-8)
		{
			text: 'The pace of evictions has <strong>accelerated dramatically</strong> since 2021. Here\'s when each operation occurred.'
		},
		{
			text: '<strong>2021:</strong> The campaign began with 4 major operations. The deadliest: Dhalpur, where police shot two people dead.'
		},
		{
			text: '<strong>2025:</strong> The busiest year — 11 documented eviction operations across Assam.'
		},
		// Line graph steps (9-11)
		{
			text: 'But it\'s not just the frequency. The <strong>scale</strong> of each operation has grown dramatically.'
		},
		{
			text: '<strong>2021:</strong> Around 14,000 people evicted across all operations.'
		},
		{
			text: '<strong>2025:</strong> Over 40,000 people evicted — nearly <strong>three times</strong> the 2021 total.'
		}
	];

	// Load data
	onMount(async () => {
		try {
			// Load both datasets in parallel
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
	});

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
			// Handle CSV with quoted fields
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
				// Parse numbers
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

	function handleStepChange(stepIndex: number) {
		return ({ detail }: CustomEvent<ObserverEventDetails>) => {
			if (detail.inView) {
				activeStep = stepIndex;
			}
		};
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateDimensions);
			return () => window.removeEventListener('resize', updateDimensions);
		}
	});
</script>

<div class="eviction-scrolly" bind:this={containerEl}>
	<!-- Sticky visualization container -->
	<div class="viz-sticky">
		<div class="viz-container">
			{#if mounted && data.length > 0}
				{#if vizMode === 'linegraph'}
					<div class="viz-wrapper" in:fade={{ duration: 400, delay: 200 }} out:fade={{ duration: 300 }}>
						<EvictionLineGraph
							data={yearlyData}
							width={containerWidth}
							height={containerHeight}
							{highlightYear}
							animate={true}
						/>
					</div>
				{:else}
					<div class="viz-wrapper" in:fade={{ duration: 400, delay: 200 }} out:fade={{ duration: 300 }}>
						<EvictionBubbles
							{data}
							{mode}
							{highlightCategory}
							{highlightYear}
							{revealedCategories}
							width={containerWidth}
							height={containerHeight}
						/>
					</div>
				{/if}
			{:else}
				<div class="loading">Loading visualization...</div>
			{/if}
		</div>
	</div>

	<!-- Scrollable text steps -->
	<div class="scroll-steps">
		{#each scrollSteps as step, i}
			<div
				class="scroll-step"
				use:inview={{ rootMargin: '-40% 0px -40% 0px' }}
				oninview_change={handleStepChange(i)}
			>
				<div class="step-box" class:active={activeStep === i}>
					<p>{@html step.text}</p>
				</div>
			</div>
		{/each}

		<!-- Extra space at end -->
		<div class="scroll-spacer"></div>
	</div>
</div>

<style>
	.eviction-scrolly {
		position: relative;
		width: 100%;
		background: #0a0a0a;
	}

	.viz-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.viz-container {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.loading {
		color: rgba(255, 255, 255, 0.5);
		font-family: 'Source Sans 3', sans-serif;
		text-align: center;
		padding: 2rem;
	}

	.viz-wrapper {
		width: 100%;
		height: 100%;
	}

	.scroll-steps {
		position: relative;
		z-index: 10;
		pointer-events: none;
	}

	.scroll-step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.scroll-step:first-child {
		padding-top: 40vh;
	}

	.step-box {
		max-width: 400px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		padding: 1.5rem 2rem;
		border-radius: 6px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
		pointer-events: auto;
		opacity: 0.7;
		transform: translateY(10px);
		transition: all 0.4s ease;
	}

	.step-box.active {
		opacity: 1;
		transform: translateY(0);
	}

	.step-box p {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 1.1rem;
		line-height: 1.6;
		color: #1a1a1a;
		margin: 0;
	}

	.step-box :global(strong) {
		font-weight: 600;
		color: #000;
	}

	/* Category highlight colors - TNH branding inspired */
	/* Using box-decoration-break: clone for proper multi-line wrapping */
	.step-box :global(.highlight-env),
	.step-box :global(.highlight-dev),
	.step-box :global(.highlight-admin),
	.step-box :global(.highlight-satra) {
		color: white;
		padding: 0.1em 0.4em;
		border-radius: 3px;
		font-weight: 500;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	.step-box :global(.highlight-env) {
		background: #35B58B;
	}

	.step-box :global(.highlight-dev) {
		background: #9F3E52;
	}

	.step-box :global(.highlight-admin) {
		background: #E8A84C;
	}

	.step-box :global(.highlight-satra) {
		background: #6B7FD7;
	}

	.scroll-spacer {
		height: 50vh;
	}

	@media (max-width: 768px) {
		.step-box {
			max-width: 320px;
			padding: 1.25rem 1.5rem;
		}

		.step-box p {
			font-size: 1rem;
		}
	}
</style>
