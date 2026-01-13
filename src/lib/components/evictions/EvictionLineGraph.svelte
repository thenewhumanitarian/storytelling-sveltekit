<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { line, curveMonotoneX, area } from 'd3-shape';
	import { extent, max } from 'd3-array';
	import { fade, draw } from 'svelte/transition';

	// Props
	export let data: { Year: number; Total_People_Evicted: number; Events: number }[] = [];
	export let width = 800;
	export let height = 500;
	export let highlightYear: number | null = null;
	export let animate = false;

	// Margins
	const margin = { top: 60, right: 40, bottom: 80, left: 100 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Scales
	$: xScale = scaleTime()
		.domain([new Date('2021-01-01'), new Date('2025-12-31')])
		.range([0, innerWidth]);

	$: yScale = scaleLinear()
		.domain([0, (max(data, d => d.Total_People_Evicted) || 45000) * 1.1])
		.range([innerHeight, 0]);

	// Line generator
	$: linePath = line<any>()
		.x(d => xScale(new Date(`${d.Year}-06-01`)))
		.y(d => yScale(d.Total_People_Evicted))
		.curve(curveMonotoneX);

	// Area generator for gradient fill
	$: areaPath = area<any>()
		.x(d => xScale(new Date(`${d.Year}-06-01`)))
		.y0(innerHeight)
		.y1(d => yScale(d.Total_People_Evicted))
		.curve(curveMonotoneX);

	// TNH accent color
	const accentColor = '#9F3E52';
	const tealColor = '#35B58B';

	let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<div class="line-graph" style="width: {width}px; height: {height}px;">
	<svg {width} {height}>
		<defs>
			<!-- Gradient for area fill -->
			<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={accentColor} stop-opacity="0.3" />
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
			{#each [0, 10000, 20000, 30000, 40000] as tick}
				<line
					x1="0"
					x2={innerWidth}
					y1={yScale(tick)}
					y2={yScale(tick)}
					stroke="rgba(255,255,255,0.08)"
					stroke-width="1"
				/>
			{/each}

			<!-- Y-axis -->
			<line
				x1="0"
				y1="0"
				x2="0"
				y2={innerHeight}
				stroke="rgba(255,255,255,0.2)"
				stroke-width="1"
			/>

			<!-- Y-axis labels -->
			{#each [0, 10000, 20000, 30000, 40000] as tick}
				<text
					x="-12"
					y={yScale(tick)}
					fill="rgba(255,255,255,0.6)"
					font-size="13"
					font-family="Source Sans 3"
					text-anchor="end"
					dominant-baseline="middle"
				>
					{(tick / 1000).toFixed(0)}k
				</text>
			{/each}

			<!-- Y-axis title -->
			<text
				x="-60"
				y={innerHeight / 2}
				fill="rgba(255,255,255,0.5)"
				font-size="12"
				font-family="Source Sans 3"
				text-anchor="middle"
				transform="rotate(-90, -60, {innerHeight / 2})"
			>
				People Evicted
			</text>

			<!-- X-axis -->
			<line
				x1="0"
				y1={innerHeight}
				x2={innerWidth}
				y2={innerHeight}
				stroke="rgba(255,255,255,0.2)"
				stroke-width="1"
			/>

			<!-- X-axis labels -->
			{#each data as d}
				<text
					x={xScale(new Date(`${d.Year}-06-01`))}
					y={innerHeight + 28}
					fill={highlightYear === d.Year ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)'}
					font-size={highlightYear === d.Year ? '16' : '14'}
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
						fill={isHighlighted ? accentColor : '#fff'}
						stroke={accentColor}
						stroke-width={isHighlighted ? 3 : 2}
						style="transition: all 0.3s ease; transform-origin: {cx}px {cy}px;"
						transition:fade={{ duration: 300, delay: 400 + i * 150 }}
					/>

					<!-- Value label above point -->
					<text
						x={cx}
						y={cy - (isHighlighted ? 20 : 16)}
						fill={isHighlighted ? '#fff' : 'rgba(255,255,255,0.8)'}
						font-size={isHighlighted ? '16' : '13'}
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
							y={innerHeight + 50}
							fill="rgba(255,255,255,0.7)"
							font-size="12"
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
				x={innerWidth / 2}
				y="-30"
				fill="rgba(255,255,255,0.9)"
				font-size="18"
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
	}

	svg {
		overflow: visible;
	}

	circle {
		cursor: pointer;
	}

	text {
		user-select: none;
	}
</style>
