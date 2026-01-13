<script lang="ts">
	import { onMount } from 'svelte';
	import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
	import { scaleLinear, scaleBand, scaleTime } from 'd3-scale';
	import { extent, groups } from 'd3-array';
	import { fade } from 'svelte/transition';

	// Props
	export let data: any[] = [];
	export let mode: 'clustered' | 'timeline' = 'clustered';
	export let highlightCategory: string | null = null;
	export let highlightYear: number | null = null;
	export let revealedCategories: string[] = [];
	export let width = 800;
	export let height = 600;

	// State
	let nodes: any[] = [];
	let simulation: any;
	let mounted = false;

	// Color mapping for categories - TNH branding inspired
	// Primary: #9F3E52 (burgundy), Accent: #35B58B (teal)
	const colorMapping: Record<string, string> = {
		'Environmental Protection': '#35B58B',    // TNH teal
		'Development Projects': '#9F3E52',        // TNH burgundy
		'Administrative Enforcement': '#E8A84C', // warm gold
		'Religious Land (Satra)': '#6B7FD7'       // muted indigo
	};

	// Desaturated versions for unrevealed categories
	const desaturatedMapping: Record<string, string> = {
		'Environmental Protection': '#4a5a55',
		'Development Projects': '#5a4a4d',
		'Administrative Enforcement': '#5a5548',
		'Religious Land (Satra)': '#4a4d5a'
	};

	// Get color based on whether category has been revealed
	function getCategoryColor(category: string): string {
		// In timeline mode, all categories should be revealed
		if (mode === 'timeline') {
			return colorMapping[category] || '#666';
		}
		// In clustered mode, show saturated only if revealed
		if (revealedCategories.includes(category)) {
			return colorMapping[category] || '#666';
		}
		return desaturatedMapping[category] || '#444';
	}

	// Category order for clustering
	const categoryOrder = [
		'Environmental Protection',
		'Development Projects',
		'Administrative Enforcement',
		'Religious Land (Satra)'
	];

	// Scales
	$: radiusScale = scaleLinear()
		.domain(extent(data, (d) => d.People_Evicted) as [number, number])
		.range([8, 45])
		.clamp(true);

	$: xScaleClustered = scaleBand()
		.domain(categoryOrder)
		.range([100, width - 100])
		.paddingInner(0.3);

	$: yScaleTimeline = scaleTime()
		.domain([new Date('2021-01-01'), new Date('2026-12-31')])
		.range([80, height - 80]);

	// Year tick marks for timeline
	const timelineYears = [2021, 2022, 2023, 2024, 2025, 2026];

	// Get positions based on mode
	function getTargetX(d: any): number {
		if (mode === 'timeline') {
			// Center bubbles to the right of the year axis
			return (width + 80) / 2 + 40;
		}
		return (xScaleClustered(d.Category) || 0) + (xScaleClustered.bandwidth() / 2);
	}

	function getTargetY(d: any): number {
		if (mode === 'timeline') {
			return yScaleTimeline(new Date(d.Date));
		}
		return height / 2;
	}

	// Run simulation when data or mode changes
	$: if (mounted && data.length > 0) {
		runSimulation();
	}

	function runSimulation() {
		// Initialize nodes with positions if not set
		const simulationData = data.map((d, i) => ({
			...d,
			x: nodes[i]?.x ?? getTargetX(d),
			y: nodes[i]?.y ?? getTargetY(d),
			radius: radiusScale(d.People_Evicted)
		}));

		if (simulation) {
			simulation.stop();
		}

		simulation = forceSimulation(simulationData)
			.force(
				'x',
				forceX<any>()
					.x((d) => getTargetX(d))
					.strength(mode === 'timeline' ? 0.3 : 0.15)
			)
			.force(
				'y',
				forceY<any>()
					.y((d) => getTargetY(d))
					.strength(mode === 'timeline' ? 0.8 : 0.15)
			)
			.force(
				'collide',
				forceCollide<any>()
					.radius((d) => d.radius + 2)
					.strength(0.8)
			)
			.alpha(0.8)
			.alphaDecay(0.02)
			.on('tick', () => {
				nodes = simulation.nodes();
			});
	}

	// Handle mode change - update forces
	$: if (simulation && mounted) {
		simulation
			.force(
				'x',
				forceX<any>()
					.x((d) => getTargetX(d))
					.strength(mode === 'timeline' ? 0.3 : 0.15)
			)
			.force(
				'y',
				forceY<any>()
					.y((d) => getTargetY(d))
					.strength(mode === 'timeline' ? 0.8 : 0.15)
			)
			.alpha(0.6)
			.restart();
	}

	// Get opacity based on highlight state
	function getOpacity(d: any): number {
		if (!highlightCategory && !highlightYear) return 1;
		if (highlightCategory && d.Category === highlightCategory) return 1;
		if (highlightYear) {
			const year = new Date(d.Date).getFullYear();
			if (year === highlightYear) return 1;
		}
		return 0.2;
	}

	// Tooltip state
	let hoveredNode: any = null;
	let tooltipX = 0;
	let tooltipY = 0;

	function handleMouseOver(event: MouseEvent, node: any) {
		hoveredNode = node;
		tooltipX = node.x;
		tooltipY = node.y - node.radius - 10;
	}

	function handleMouseOut() {
		hoveredNode = null;
	}

	onMount(() => {
		mounted = true;
	});
</script>

<div class="eviction-bubbles" style="width: {width}px; height: {height}px;">
	<svg {width} {height}>
		<!-- Timeline axis (only in timeline mode) -->
		{#if mode === 'timeline'}
			<g class="timeline-axis" transition:fade={{ duration: 300 }}>
				<!-- Vertical axis line on left side -->
				<line
					x1={80}
					y1={60}
					x2={80}
					y2={height - 60}
					stroke="rgba(255,255,255,0.2)"
					stroke-width="1"
				/>
				{#each timelineYears as year}
					<g transform="translate(80, {yScaleTimeline(new Date(`${year}-06-01`))})">
						<!-- Tick mark -->
						<line x1="-8" x2="0" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
						<!-- Year label - positioned left of axis -->
						<text
							x="-16"
							y="5"
							fill="rgba(255,255,255,0.85)"
							font-size="15"
							font-weight="600"
							font-family="Source Sans 3"
							text-anchor="end"
						>
							{year}
						</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Category dividers (only in clustered mode) -->
		{#if mode === 'clustered'}
			<g class="category-dividers" transition:fade={{ duration: 300 }}>
				{#each categoryOrder.slice(0, -1) as category, i}
					{@const x = (xScaleClustered(category) || 0) + xScaleClustered.bandwidth() + (xScaleClustered.step() * xScaleClustered.paddingInner()) / 2}
					<line
						x1={x}
						y1={80}
						x2={x}
						y2={height - 60}
						stroke="rgba(255,255,255,0.15)"
						stroke-width="1"
						stroke-dasharray="4,4"
					/>
				{/each}
			</g>
		{/if}

		<!-- Cluster labels (only in clustered mode) -->
		{#if mode === 'clustered'}
			<g class="cluster-labels" transition:fade={{ duration: 300 }}>
				{#each categoryOrder as category}
					<text
						x={(xScaleClustered(category) || 0) + xScaleClustered.bandwidth() / 2}
						y={height - 30}
						fill={colorMapping[category]}
						font-size="12"
						font-family="Source Sans 3"
						font-weight="600"
						text-anchor="middle"
						opacity={highlightCategory && highlightCategory !== category ? 0.3 : 1}
					>
						{category.split(' ')[0]}
					</text>
				{/each}
			</g>
		{/if}

		<!-- Bubbles -->
		<g class="bubbles">
			{#each nodes as node, i (node.Date + node.Village)}
				<circle
					cx={node.x}
					cy={node.y}
					r={node.radius}
					fill={getCategoryColor(node.Category)}
					opacity={getOpacity(node)}
					stroke={hoveredNode === node ? '#fff' : 'transparent'}
					stroke-width="2"
					on:mouseover={(e) => handleMouseOver(e, node)}
					on:mouseout={handleMouseOut}
					on:focus={(e) => handleMouseOver(e, node)}
					on:blur={handleMouseOut}
					role="button"
					tabindex="0"
					aria-label={`${node.Village}, ${node.People_Evicted} people evicted`}
				/>
			{/each}
		</g>
	</svg>

	<!-- Tooltip -->
	{#if hoveredNode}
		<div
			class="tooltip"
			style="left: {tooltipX}px; top: {tooltipY}px;"
			transition:fade={{ duration: 150 }}
		>
			<div class="tooltip-location">{hoveredNode.Village || hoveredNode['Village/Location']}</div>
			<div class="tooltip-date">{new Date(hoveredNode.Date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
			<div class="tooltip-stat">{hoveredNode.People_Evicted?.toLocaleString()} people evicted</div>
		</div>
	{/if}
</div>

<style>
	.eviction-bubbles {
		position: relative;
		background: transparent;
	}

	svg {
		overflow: visible;
	}

	circle {
		cursor: pointer;
		transition:
			opacity 400ms ease,
			fill 200ms ease,
			stroke 150ms ease;
	}

	.tooltip {
		position: absolute;
		transform: translate(-50%, -100%);
		background: rgba(0, 0, 0, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		padding: 10px 14px;
		pointer-events: none;
		z-index: 100;
		min-width: 140px;
	}

	.tooltip-location {
		font-family: 'Source Sans 3', sans-serif;
		font-weight: 600;
		font-size: 14px;
		color: white;
		margin-bottom: 4px;
	}

	.tooltip-date {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 6px;
	}

	.tooltip-stat {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.9);
	}

	text {
		user-select: none;
	}
</style>
