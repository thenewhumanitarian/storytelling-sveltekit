<script lang="ts">
	// import { incidentsData } from '$lib/components/GazaMap/incidents';
	import { onMount } from 'svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { extent } from 'd3-array';
	import type { IncidentData } from './types';

	let {
		selectedMarkerId,
		setSelectedMarkerId,
    highlightedMarkerId,
    setHighlightedMarkerId,
    incidentsData,
	}: {
		selectedMarkerId: number | null;
		setSelectedMarkerId: (id: number | null) => void;
		highlightedMarkerId: number | null;
		setHighlightedMarkerId: (id: number | null) => void;
    incidentsData: IncidentData[]
	} = $props();

	// --- Internal State ---
	let timelineContainer: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	const svgHeight = 100; // Constant height of SVG area
	const barWidth = 12; // Constant width of bars
	const axisPaddingBottom = 10; // Space below the axis line for labels etc.
	const barPaddingBottom = 5; // Space between bottom of bar and axis line
	const horizontalPadding = 15; // Padding at the ends of the timeline axis

  const axisY = $derived(svgHeight - axisPaddingBottom)
	
  // --- Reactive Computations so can pass different selections of incidents ---
	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({ ...d, dateObj: new Date(d.date) }))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
	);

	const maxBarHeight = $derived(svgHeight - axisPaddingBottom - barPaddingBottom);

	const timeScale = $derived.by(() => {
		// Ensure calculation only runs when width is known and data exists
		if (!containerWidth || parsedIncidents.length === 0) {
			return scaleTime().domain([new Date(), new Date()]).range([0, 0]);
		}
		const dateDomain = extent(parsedIncidents, (d) => d.dateObj) as
			| [Date, Date]
			| [undefined, undefined];
		let minDate = dateDomain[0] ?? new Date();
		let maxDate = dateDomain[1] ?? new Date();
		if (minDate.getTime() === maxDate.getTime()) {
			maxDate = new Date(minDate.getTime() + 24 * 60 * 60 * 1000);
		}
		return scaleTime()
			.domain([minDate, maxDate])
			.range([horizontalPadding + barWidth / 2, containerWidth - horizontalPadding - barWidth / 2]);
	});

	const heightScale = $derived.by(() => {
		if (parsedIncidents.length === 0) {
			return scaleLinear().domain([0, 1]).range([0, maxBarHeight]);
		}
		const maxKilled = Math.max(...parsedIncidents.map((d) => d.killedOrWounded), 1);
		return scaleLinear().domain([0, maxKilled]).range([5, maxBarHeight]); // Min height 5px
	});

	onMount(() => {
		if (!timelineContainer) return; // Guard
		const resizeObserver = new ResizeObserver((entries) => {
			if (entries[0]) {
				containerWidth = entries[0].contentRect.width;
			}
		});
		resizeObserver.observe(timelineContainer);
		containerWidth = timelineContainer.offsetWidth; // Initial set

		return () => resizeObserver.disconnect(); // Use disconnect for simplicity
	});

	// --- Interaction Handlers ---
	function handleMouseEnter(id: number) {
		setHighlightedMarkerId(id); // Call parent's update function
	}

	function handleMouseLeave() {
		setHighlightedMarkerId(null); // Call parent's update function
	}

	function handleClick(id: number) {
		setSelectedMarkerId(id);
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // Simpler format
	}

</script>

<!-- Use Tailwind classes for the container -->
<div
	bind:this={timelineContainer}
	class="box-border flex h-48 w-full items-center overflow-hidden border-t border-gray-300 bg-white/90 px-2.5"
>
	{#if containerWidth > 0 && parsedIncidents.length > 0}
		<svg width="100%" height={svgHeight} aria-label="Incident Timeline" class="block">
			<!-- Axis Line -->
			<line
				x1={timeScale.range()[0]}
				y1={axisY}
				x2={timeScale.range()[1]}
				y2={axisY}
				class="stroke-gray-300"
				stroke-width="1"
			/>

			<!-- Incident Bars -->
			{#each parsedIncidents as incident (incident.id)}
				{@const xPos = timeScale(incident.dateObj)}
				{@const barHeight = heightScale(incident.killedOrWounded)}
				{@const yPos = axisY - barHeight - barPaddingBottom}

				<!-- Group for interaction + Tailwind group modifier -->
				<g
					class="group cursor-pointer focus:outline-none"
					onclick={() => handleClick(incident.id)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick(incident.id)
            }
          }}
					onmouseenter={() => handleMouseEnter(incident.id)}
					onmouseleave={handleMouseLeave}
					onfocusin={() => handleMouseEnter(incident.id)}
					onfocusout={handleMouseLeave}
					tabindex="0"
					aria-label={`Incident: ${incident.title} on ${formatDate(incident.dateObj)}, ${incident.killedOrWounded} killed/wounded`}
					role="button"
				>
					<rect
						class="transition-colors duration-200 ease-in-out group-hover:fill-[#f2b0b8] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1 group-focus-visible:outline-blue-500"
						x={xPos - barWidth / 2}
						y={yPos}
						width={barWidth}
						height={barHeight}
						rx="1"
						ry="1"
						fill={selectedMarkerId === incident.id ? '#f2b0b8' : '#9f3e52'}
					>
						<title
							>{incident.title} ({formatDate(incident.dateObj)}) - {incident.killedOrWounded} killed/wounded</title
						>
					</rect>
				</g>
			{/each}

			<!-- Date Labels -->
			{#if timeScale.domain()[0] && timeScale.domain()[1]}
				{@const [startRange, endRange] = timeScale.range()}
				{@const [startDate, endDate] = timeScale.domain()}
				<text
					x={startRange}
					y={axisY + 10}
					class="fill-gray-500 font-sans text-xs"
					text-anchor="start"
				>
					{formatDate(startDate)}
				</text>
				<text
					x={endRange}
					y={axisY + 10}
					class="fill-gray-500 font-sans text-xs"
					text-anchor="end"
				>
					{formatDate(endDate)}
				</text>
			{/if}
		</svg>
	{/if}
</div>
