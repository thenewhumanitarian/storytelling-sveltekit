<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { line, curveMonotoneX, area } from 'd3-shape';
	import { max } from 'd3-array';
	import { fade, draw } from 'svelte/transition';

	interface Props {
		data?: { Year: number; Total_People_Evicted: number; Events: number }[];
		width?: number;
		height?: number;
		highlightYear?: number | null;
		animate?: boolean;
	}

	let {
		data = [],
		width = 800,
		height = 500,
		highlightYear = null,
		animate = true
	}: Props = $props();

	// Y-axis tick values (used for grid lines and labels)
	const Y_AXIS_TICKS = [0, 10000, 20000, 30000, 40000];

	// Clamped margins - scale with container but with min AND max bounds
	let margin = $derived.by(() => ({
		top: Math.min(Math.max(height * 0.08, 35), 60),
		right: Math.min(Math.max(width * 0.04, 15), 50),
		bottom: Math.min(Math.max(height * 0.1, 45), 80),
		left: Math.min(Math.max(width * 0.1, 40), 100)
	}));
	let innerWidth = $derived(width - margin.left - margin.right);
	let innerHeight = $derived(height - margin.top - margin.bottom);

	// Fixed font sizes with mobile/desktop breakpoint
	let isMobile = $derived(width < 600);
	let titleFontSize = $derived(isMobile ? 18 : 24);
	let axisFontSize = $derived(isMobile ? 11 : 13);
	let labelFontSize = $derived(isMobile ? 12 : 14);
	let valueFontSize = $derived(isMobile ? 14 : 16);

	// Show Y-axis title only on wider screens
	let showYAxisTitle = $derived(width > 500);

	// Scales
	let xScale = $derived(
		scaleTime()
			.domain([new Date('2021-01-01'), new Date('2025-12-31')])
			.range([0, innerWidth])
	);

	let yScale = $derived(
		scaleLinear()
			.domain([0, (max(data, d => d.Total_People_Evicted) || 45000) * 1.1])
			.range([innerHeight, 0])
	);

	// Line generator
	let linePath = $derived(
		line<any>()
			.x((d: any) => xScale(new Date(`${d.Year}-06-01`)))
			.y((d: any) => yScale(d.Total_People_Evicted))
			.curve(curveMonotoneX)
	);

	// Area generator for gradient fill
	let areaPath = $derived(
		area<any>()
			.x((d: any) => xScale(new Date(`${d.Year}-06-01`)))
			.y0(innerHeight)
			.y1((d: any) => yScale(d.Total_People_Evicted))
			.curve(curveMonotoneX)
	);

	// TNH accent color
	const accentColor = '#9F3E52';

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>

<div class="line-graph" style="width: {width}px; height: {height}px;">
	<svg {width} {height}>
		<defs>
			<!-- Gradient for area fill -->
			<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={accentColor} stop-opacity="0.2" />
				<stop offset="100%" stop-color={accentColor} stop-opacity="0.02" />
			</linearGradient>
			<!-- Glow filter for line -->
			<filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<g transform="translate({margin.left}, {margin.top})">
			<!-- Grid lines -->
			{#each Y_AXIS_TICKS as tick}
				<line
					x1="0"
					x2={innerWidth}
					y1={yScale(tick)}
					y2={yScale(tick)}
					stroke="rgba(0,0,0,0.06)"
					stroke-width="1"
				/>
			{/each}

			<!-- Y-axis -->
			<line
				x1="0"
				y1="0"
				x2="0"
				y2={innerHeight}
				stroke="rgba(0,0,0,0.15)"
				stroke-width="1"
			/>

			<!-- Y-axis labels -->
			{#each Y_AXIS_TICKS as tick}
				<text
					x="-8"
					y={yScale(tick)}
					fill="rgba(0,0,0,0.5)"
					font-size={axisFontSize}
					font-family="Source Sans 3"
					text-anchor="end"
					dominant-baseline="middle"
				>
					{(tick / 1000).toFixed(0)}k
				</text>
			{/each}

			<!-- Y-axis title (only on wider screens) -->
			{#if showYAxisTitle}
				<text
					x={-margin.left * 0.6}
					y={innerHeight / 2}
					fill="rgba(0,0,0,0.4)"
					font-size={axisFontSize}
					font-family="Source Sans 3"
					text-anchor="middle"
					transform="rotate(-90, {-margin.left * 0.6}, {innerHeight / 2})"
				>
					People Evicted
				</text>
			{/if}

			<!-- X-axis -->
			<line
				x1="0"
				y1={innerHeight}
				x2={innerWidth}
				y2={innerHeight}
				stroke="rgba(0,0,0,0.15)"
				stroke-width="1"
			/>

			<!-- X-axis labels -->
			{#each data as d}
				<text
					x={xScale(new Date(`${d.Year}-06-01`))}
					y={innerHeight + margin.bottom * 0.35}
					fill={highlightYear === d.Year ? '#1a1a1a' : 'rgba(0,0,0,0.5)'}
					font-size={highlightYear === d.Year ? labelFontSize * 1.2 : labelFontSize}
					font-weight={highlightYear === d.Year ? '700' : '400'}
					font-family="Source Sans 3"
					text-anchor="middle"
				>
					{d.Year}
				</text>
			{/each}

			<!-- Area fill -->
			{#if mounted && data.length > 0}
				<path
					d={areaPath(data)}
					fill="url(#areaGradient)"
					transition:fade={{ duration: 600, delay: 300 }}
				/>
			{/if}

			<!-- Line path -->
			{#if mounted && data.length > 0}
				<path
					d={linePath(data)}
					fill="none"
					stroke={accentColor}
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#lineGlow)"
					transition:draw={{ duration: 1200, delay: 200 }}
				/>
			{/if}

			<!-- Data points -->
			{#if mounted}
				{#each data as d, i}
					{@const cx = xScale(new Date(`${d.Year}-06-01`))}
					{@const cy = yScale(d.Total_People_Evicted)}
					{@const isHighlighted = highlightYear === d.Year}

					<!-- Point circle -->
					<circle
						{cx}
						{cy}
						r={isHighlighted ? 10 : 6}
						fill={isHighlighted ? accentColor : '#f5f0eb'}
						stroke={accentColor}
						stroke-width={isHighlighted ? 3 : 2}
						style="transition: all 0.3s ease; transform-origin: {cx}px {cy}px;"
						transition:fade={{ duration: 300, delay: 400 + i * 150 }}
					/>

					<!-- Value label above point -->
					<text
						x={cx}
						y={cy - (isHighlighted ? valueFontSize * 1.5 : valueFontSize * 1.2)}
						fill={isHighlighted ? '#1a1a1a' : 'rgba(0,0,0,0.65)'}
						font-size={isHighlighted ? valueFontSize * 1.2 : valueFontSize}
						font-weight={isHighlighted ? '700' : '500'}
						font-family="Source Sans 3"
						text-anchor="middle"
						transition:fade={{ duration: 300, delay: 500 + i * 150 }}
					>
						{d.Total_People_Evicted.toLocaleString()}
					</text>

					<!-- Events count below -->
					{#if isHighlighted}
						<text
							x={cx}
							y={innerHeight + margin.bottom * 0.65}
							fill="rgba(0,0,0,0.5)"
							font-size={axisFontSize}
							font-family="Source Sans 3"
							text-anchor="middle"
							transition:fade={{ duration: 200 }}
						>
							{d.Events} events
						</text>
					{/if}
				{/each}
			{/if}

			<!-- Title -->
			<text
				x={(width / 2) - margin.left}
				y={-margin.top * 0.45}
				fill="#1a1a1a"
				font-size={titleFontSize}
				font-weight="600"
				font-family="Playfair Display"
				text-anchor="middle"
			>
				Evictions Have Accelerated Since 2021
			</text>
		</g>
	</svg>
</div>

<style>
	.line-graph {
		position: relative;
		background: transparent;
		overflow-x: hidden;
	}

	svg {
		overflow: hidden;
	}

	circle {
		cursor: pointer;
	}

	text {
		user-select: none;
	}
</style>
