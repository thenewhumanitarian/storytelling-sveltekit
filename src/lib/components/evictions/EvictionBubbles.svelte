<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { forceSimulation, forceX, forceY, forceCollide, type Simulation } from 'd3-force';
	import { scaleLinear, scaleBand, scaleTime } from 'd3-scale';
	import { extent } from 'd3-array';
	import { fade } from 'svelte/transition';

	interface EvictionData {
		Date: string;
		Village: string;
		Category: string;
		People_Evicted: number;
		parsedYear?: number; // Pre-parsed year for performance
	}

	interface NodeData extends EvictionData {
		x: number;
		y: number;
		radius: number;
	}

	interface Props {
		data: EvictionData[];
		mode?: 'clustered' | 'timeline';
		highlightCategory?: string | null;
		highlightYear?: number | null;
		revealedCategories?: string[];
		showCategoryLabels?: boolean;
		width?: number;
		height?: number;
	}

	let {
		data,
		mode = 'clustered',
		highlightCategory = null,
		highlightYear = null,
		revealedCategories = [],
		showCategoryLabels = true,
		width = 800,
		height = 600
	}: Props = $props();

	// State
	let nodes = $state<NodeData[]>([]);
	let simulation: Simulation<NodeData, undefined> | null = null;
	let mounted = $state(false);
	let hoveredNode = $state<NodeData | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Color mapping for categories - TNH branding inspired
	const colorMapping: Record<string, string> = {
		'Environmental Protection': '#35B58B',
		'Development Projects': '#9F3E52',
		'Administrative Enforcement': '#E8A84C',
		'Religious Land (Satra)': '#6B7FD7'
	};

	const desaturatedMapping: Record<string, string> = {
		'Environmental Protection': '#a8c4bc',
		'Development Projects': '#b8a0a5',
		'Administrative Enforcement': '#c4b8a0',
		'Religious Land (Satra)': '#a0a8c4'
	};

	const categoryOrder = [
		'Environmental Protection',
		'Development Projects',
		'Administrative Enforcement',
		'Religious Land (Satra)'
	];

	// Convert revealedCategories array to Set for O(1) lookup
	let revealedCategoriesSet = $derived(new Set(revealedCategories));

	// Derived values for responsive layout
	let isMobile = $derived(width < 600);
	let axisX = $derived(
		isMobile
			? Math.max(width * 0.12, 55)
			: Math.min(Math.max(width * 0.08, 50), 80)
	);
	let yearFontSize = $derived(isMobile ? 14 : 18);
	let labelFontSize = $derived(isMobile ? 13 : 12);

	// Scales - derived from data and dimensions
	let radiusScale = $derived(
		scaleLinear()
			.domain(extent(data, (d) => d.People_Evicted) as [number, number])
			.range(isMobile ? [6, 35] : [8, 45])
			.clamp(true)
	);

	let xScaleClustered = $derived(
		scaleBand()
			.domain(categoryOrder)
			.range([100, width - 100])
			.paddingInner(0.3)
	);

	let yScaleClusteredMobile = $derived(
		scaleBand()
			.domain(categoryOrder)
			.range([80, height - 80])
			.paddingInner(0.2)
	);

	let yScaleTimeline = $derived(
		scaleTime()
			.domain([new Date('2021-01-01'), new Date('2026-12-31')])
			.range([80, height - 80])
	);

	const timelineYears = [2021, 2022, 2023, 2024, 2025, 2026];

	// Get color based on whether category has been revealed
	function getCategoryColor(category: string): string {
		const isRevealed = mode === 'timeline' || revealedCategoriesSet.has(category);
		return isRevealed ? (colorMapping[category] || '#666') : (desaturatedMapping[category] || '#444');
	}

	// Get opacity based on highlight state
	function getOpacity(d: NodeData): number {
		if (!highlightCategory && !highlightYear) return 1;
		if (highlightCategory && d.Category === highlightCategory) return 1;
		if (highlightYear && d.parsedYear === highlightYear) return 1;
		return 0.2;
	}

	// Position functions
	function getTargetX(d: EvictionData): number {
		if (mode === 'timeline') {
			const availableWidth = width - axisX;
			return axisX + availableWidth * 0.45;
		}
		if (isMobile) {
			return width / 2;
		}
		return (xScaleClustered(d.Category) || 0) + (xScaleClustered.bandwidth() / 2);
	}

	function getTargetY(d: EvictionData): number {
		if (mode === 'timeline') {
			return yScaleTimeline(new Date(d.Date));
		}
		if (isMobile) {
			return (yScaleClusteredMobile(d.Category) || 0) + (yScaleClusteredMobile.bandwidth() / 2);
		}
		return height / 2;
	}

	// Create and run the simulation
	function createSimulation() {
		// Pre-parse dates and create simulation data with pre-computed year
		const simulationData: NodeData[] = data.map((d, i) => ({
			...d,
			parsedYear: new Date(d.Date).getFullYear(),
			x: nodes[i]?.x ?? getTargetX(d),
			y: nodes[i]?.y ?? getTargetY(d),
			radius: radiusScale(d.People_Evicted)
		}));

		// Stop any existing simulation
		if (simulation) {
			simulation.stop();
			simulation.on('tick', null);
		}

		simulation = forceSimulation(simulationData)
			.force(
				'x',
				forceX<NodeData>()
					.x((d) => getTargetX(d))
					.strength(mode === 'timeline' ? 0.3 : 0.4)
			)
			.force(
				'y',
				forceY<NodeData>()
					.y((d) => getTargetY(d))
					.strength(mode === 'timeline' ? 0.8 : 0.2)
			)
			.force(
				'collide',
				forceCollide<NodeData>()
					.radius((d) => d.radius + 2)
					.strength(0.7)
			)
			.alpha(0.8)
			.alphaDecay(0.02)
			.on('tick', () => {
				if (simulation) {
					nodes = [...simulation.nodes()];
				}
			});
	}

	// Update simulation forces when mode changes (without recreating simulation)
	function updateSimulationForces() {
		if (!simulation) return;

		simulation
			.force(
				'x',
				forceX<NodeData>()
					.x((d) => getTargetX(d))
					.strength(mode === 'timeline' ? 0.3 : 0.4)
			)
			.force(
				'y',
				forceY<NodeData>()
					.y((d) => getTargetY(d))
					.strength(mode === 'timeline' ? 0.8 : 0.2)
			)
			.alpha(0.6)
			.restart();
	}

	// Track previous mode to detect changes
	let prevMode = $state(mode);

	// Effect to handle data changes - recreate simulation
	$effect(() => {
		if (mounted && data.length > 0) {
			createSimulation();
		}
	});

	// Effect to handle mode changes - just update forces
	$effect(() => {
		if (mounted && simulation && mode !== prevMode) {
			prevMode = mode;
			updateSimulationForces();
		}
	});

	// Tooltip handlers
	function handleMouseOver(event: MouseEvent, node: NodeData) {
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

	onDestroy(() => {
		if (simulation) {
			simulation.stop();
			simulation.on('tick', null);
			simulation = null;
		}
	});
</script>

<div class="eviction-bubbles" style:width="{width}px" style:height="{height}px">
	<svg {width} {height}>
		<!-- Timeline axis (only in timeline mode) -->
		{#if mode === 'timeline'}
			<g class="timeline-axis" transition:fade={{ duration: 300 }}>
				<line
					x1={axisX}
					y1={height * 0.1}
					x2={axisX}
					y2={height - height * 0.1}
					stroke="rgba(0,0,0,0.15)"
					stroke-width="1"
				/>
				{#each timelineYears as year}
					<g transform="translate({axisX}, {yScaleTimeline(new Date(`${year}-06-01`))})">
						<line x1="-8" x2="0" stroke="rgba(0,0,0,0.25)" stroke-width="1" />
						<text
							x="-12"
							y="5"
							fill="rgba(0,0,0,0.7)"
							font-size={yearFontSize}
							font-weight="600"
							font-family="Roboto"
							text-anchor="end"
						>
							{year}
						</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Category dividers (clustered mode, desktop) -->
		{#if mode === 'clustered' && !isMobile}
			<g class="category-dividers" transition:fade={{ duration: 300 }}>
				{#each categoryOrder.slice(0, -1) as category}
					{@const x = (xScaleClustered(category) || 0) + xScaleClustered.bandwidth() + (xScaleClustered.step() * xScaleClustered.paddingInner()) / 2}
					<line
						x1={x}
						y1={80}
						x2={x}
						y2={height - 60}
						stroke="rgba(0,0,0,0.1)"
						stroke-width="1"
						stroke-dasharray="4,4"
					/>
				{/each}
			</g>
		{/if}

		<!-- Category dividers (clustered mode, mobile) -->
		{#if mode === 'clustered' && isMobile}
			<g class="category-dividers-mobile" transition:fade={{ duration: 300 }}>
				{#each categoryOrder.slice(0, -1) as category}
					{@const y = (yScaleClusteredMobile(category) || 0) + yScaleClusteredMobile.bandwidth() + (yScaleClusteredMobile.step() * yScaleClusteredMobile.paddingInner()) / 2}
					<line
						x1={60}
						y1={y}
						x2={width - 60}
						y2={y}
						stroke="rgba(0,0,0,0.1)"
						stroke-width="1"
						stroke-dasharray="4,4"
					/>
				{/each}
			</g>
		{/if}

		<!-- Cluster labels (clustered mode, desktop) -->
		{#if mode === 'clustered' && showCategoryLabels && !isMobile}
			<g class="cluster-labels">
				{#each categoryOrder as category, i}
					<text
						x={(xScaleClustered(category) || 0) + xScaleClustered.bandwidth() / 2}
						y={height - 30}
						fill={colorMapping[category]}
						font-size="12"
						font-family="Roboto"
						font-weight="600"
						text-anchor="middle"
						opacity={highlightCategory && highlightCategory !== category ? 0.3 : 1}
						class="category-label"
						style:animation-delay="{i * 100}ms"
					>
						{category.split(' ')[0]}
					</text>
				{/each}
			</g>
		{/if}

		<!-- Cluster labels (clustered mode, mobile) -->
		{#if mode === 'clustered' && showCategoryLabels && isMobile}
			<g class="cluster-labels-mobile">
				{#each categoryOrder as category, i}
					<text
						x={width * 0.04}
						y={(yScaleClusteredMobile(category) || 0) + yScaleClusteredMobile.bandwidth() / 2}
						fill={colorMapping[category]}
						font-size={labelFontSize}
						font-family="Roboto"
						font-weight="600"
						text-anchor="start"
						dominant-baseline="middle"
						opacity={highlightCategory && highlightCategory !== category ? 0.3 : 1}
						class="category-label"
						style:animation-delay="{i * 100}ms"
					>
						{category.split(' ')[0]}
					</text>
				{/each}
			</g>
		{/if}

		<!-- Bubbles -->
		<g class="bubbles">
			{#each nodes as node (node.Date + node.Village)}
				<circle
					cx={node.x}
					cy={node.y}
					r={node.radius}
					fill={getCategoryColor(node.Category)}
					opacity={getOpacity(node)}
					stroke={hoveredNode === node ? '#1a1a1a' : 'transparent'}
					stroke-width="2"
					onmouseover={(e) => handleMouseOver(e, node)}
					onmouseout={handleMouseOut}
					onfocus={(e) => handleMouseOver(e as unknown as MouseEvent, node)}
					onblur={handleMouseOut}
					role="button"
					tabindex="0"
					aria-label="{node.Village}, {node.People_Evicted} people evicted"
				/>
			{/each}
		</g>
	</svg>

	<!-- Tooltip -->
	{#if hoveredNode}
		<div
			class="tooltip"
			style:left="{tooltipX}px"
			style:top="{tooltipY}px"
			transition:fade={{ duration: 150 }}
		>
			<div class="tooltip-location">{hoveredNode.Village || (hoveredNode as any)['Village/Location']}</div>
			<div class="tooltip-date">
				{new Date(hoveredNode.Date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
			</div>
			<div class="tooltip-stat">{hoveredNode.People_Evicted?.toLocaleString()} people evicted</div>
		</div>
	{/if}
</div>

<style>
	.eviction-bubbles {
		position: relative;
		background: transparent;
		overflow-x: hidden;
	}

	svg {
		overflow: hidden;
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
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		padding: 10px 14px;
		pointer-events: none;
		z-index: 100;
		min-width: 140px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}

	.tooltip-location {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-weight: 600;
		font-size: 14px;
		color: #1a1a1a;
		margin-bottom: 4px;
	}

	.tooltip-date {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 12px;
		color: rgba(0, 0, 0, 0.5);
		margin-bottom: 6px;
	}

	.tooltip-stat {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 13px;
		color: rgba(0, 0, 0, 0.8);
	}

	text {
		user-select: none;
	}

	.category-label {
		animation: labelFadeIn 0.5s ease-out forwards;
		opacity: 0;
	}

	@keyframes labelFadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
