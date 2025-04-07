<script lang="ts">
	// import { incidentsData } from '$lib/components/GazaMap/incidents';
	import { onMount } from 'svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { extent, rollup, sum } from 'd3-array';
	import { timeWeek } from 'd3-time';
	import type { IncidentData } from './types';
	import moment from 'moment';

	let {
		setHighlightedMarkerId,
		incidentsData,
		gazaMapRef,
		selectedWeekStartDate,
		setSelectedWeek
	}: {
		setHighlightedMarkerId: (id: number | null) => void;
		incidentsData: IncidentData[];
		gazaMapRef: { setSelectionOriginToClick: () => void } | null;
		selectedWeekStartDate: Date | null;
		setSelectedWeek: (date: Date | null, firstIncidentId: number | null) => void;
	} = $props();

	// --- Internal State ---
	let timelineContainer: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	const svgHeight = 125; // Constant height of SVG area
	const barWidth = 12; // Constant width of bars
	const axisPaddingBottom = 15; // Space below the axis line for labels etc.
	const barPaddingBottom = 0; // Space between bottom of bar and axis line
	const horizontalPadding = 0; // Padding at the ends of the timeline axis

	const axisY = $derived(svgHeight - axisPaddingBottom);

	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({ ...d, dateObj: new Date(d.date) }))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()) // NB!! ensure that incidents are sorted by date first!!! otherwise cannot get the correct markerId when selecting a week.
	);

	// Create weekly aggregated data
	const weeklyAggregatedData = $derived.by(() => {
		if (parsedIncidents.length === 0) return [];

		// Group by the start of the week (Sunday) and sum killedOrWounded, and find first incident for the week's chronoId
		const rolledUp = rollup(
			parsedIncidents,
			(v) => ({
				totalKilledOrWounded: sum(v, (d) => d.killedOrWounded), // Summing function
				firstChronoId: v[0].chronoId // Assuming already sorted, the first item in 'v' is the earliest in the week
			}),
			(d) => timeWeek.floor(d.dateObj) // Key selector (start of the week)
		);

		// Convert Map to array of objects and sort by week start date
		return Array.from(rolledUp, ([weekStartDate, values]) => ({
			weekStartDate,
			totalKilledOrWounded: values.totalKilledOrWounded,
			firstChronoId: values.firstChronoId
		})).sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());
	});

	const maxBarHeight = $derived(svgHeight - axisPaddingBottom - barPaddingBottom);

	const timeScale = $derived.by(() => {
		// Ensure calculation only runs when width is known and data exists
		if (!containerWidth || weeklyAggregatedData.length === 0) {
			return scaleTime().domain([new Date(), new Date()]).range([0, 0]);
		}
		const dateDomain = extent(weeklyAggregatedData, (d) => d.weekStartDate) as
			| [Date, Date]
			| [undefined, undefined];
		let minDate = dateDomain[0] ?? new Date();
		let maxDate = dateDomain[1] ?? new Date();
		// if (minDate.getTime() === maxDate.getTime()) {
		// 	maxDate = new Date(minDate.getTime() + 24 * 60 * 60 * 1000);
		// }
		// Adjust maxDate slightly if only one week exists to give it space, or add a buffer
		if (weeklyAggregatedData.length === 1) {
			maxDate = timeWeek.offset(minDate, 1); // Show at least one full week interval
		} else {
			// Optional: Add padding to the end date if needed
			maxDate = timeWeek.offset(maxDate, 1);
		}
		return scaleTime()
			.domain([minDate, maxDate])
			.range([horizontalPadding + barWidth / 2, containerWidth - horizontalPadding - barWidth / 2]);
	});

	const heightScale = $derived.by(() => {
		if (weeklyAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range([0, maxBarHeight]);
		}
		// const maxKilled = Math.max(...parsedIncidents.map((d) => d.killedOrWounded), 1);
		// return scaleLinear().domain([0, maxKilled]).range([5, maxBarHeight]); // Min height 5px
		const maxWeeklyKilled = Math.max(...weeklyAggregatedData.map((d) => d.totalKilledOrWounded), 1);
		return scaleLinear().domain([0, maxWeeklyKilled]).range([5, maxBarHeight]); // Min height 5px
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
	function handleMouseEnter(weekStartDate: Date) {
		setHighlightedMarkerId(null); //
	}

	function handleMouseLeave() {
		setHighlightedMarkerId(null); // Call parent's update function
	}

	function handleClick(weekStartDate: Date, firstChronoId: number) {
		if (gazaMapRef?.setSelectionOriginToClick) {
			gazaMapRef.setSelectionOriginToClick();
		}
		// Toggle selection: if clicking the already selected week, deselect it.
		if (selectedWeekStartDate && selectedWeekStartDate.getTime() === weekStartDate.getTime()) {
			setSelectedWeek(null, null);
		} else {
			setSelectedWeek(weekStartDate, firstChronoId);
		}
	}

	function handleKeyDown(event: KeyboardEvent, weekStartDate: Date, firstChronoId: number) {
		event.preventDefault();
		if (event.key === 'Enter' || event.key === ' ') {
			handleClick(weekStartDate, firstChronoId);
		}
	}

	function formatDate(date: Date): string {
		return moment(date).format('DD MMMM YYYY');
		// return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // Simpler format
	}
</script>

<div
	bind:this={timelineContainer}
	class="box-border flex h-36 w-full items-center overflow-hidden border-t border-gray-300 bg-white/90"
>
	<!-- {#if containerWidth > 0 && parsedIncidents.length > 0} -->
	{#if containerWidth > 0 && weeklyAggregatedData.length > 0}
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

			<!-- Weekly Aggregated Bars -->
			{#each weeklyAggregatedData as weekData (weekData.weekStartDate.toISOString())}
				{@const xPos = timeScale(weekData.weekStartDate)}
				{@const barHeight = heightScale(weekData.totalKilledOrWounded)}
				{@const yPos = axisY - barHeight - barPaddingBottom}
				{@const isSelected = selectedWeekStartDate?.getTime() === weekData.weekStartDate.getTime()}

				<!-- Group for interaction + Tailwind group modifier -->
				<g
					class="group cursor-pointer focus:outline-none"
					onclick={() => handleClick(weekData.weekStartDate, weekData.firstChronoId)}
					onkeydown={(e) => handleKeyDown(e, weekData.weekStartDate, weekData.firstChronoId)}
					onmouseenter={() => handleMouseEnter(weekData.weekStartDate)}
					onmouseleave={handleMouseLeave}
					onfocusin={() => handleMouseEnter(weekData.weekStartDate)}
					onfocusout={handleMouseLeave}
					tabindex="0"
					aria-label={`Week starting ${formatDate(weekData.weekStartDate)}: ${weekData.totalKilledOrWounded} killed/wounded`}
					role="button"
				>
					<rect
						class:group-hover:fill-[#f2b0b8]={!isSelected}
						class="fill-[#9f3e52] transition-colors duration-200 ease-in-out group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1 group-focus-visible:outline-blue-500"
						x={xPos - barWidth / 2}
						y={yPos}
						width={barWidth}
						height={barHeight}
						rx="1"
						ry="1"
						fill={isSelected ? '#f2b0b8' : '#9f3e52'}
					>
						<title
							>Week starting {formatDate(weekData.weekStartDate)} - {weekData.totalKilledOrWounded} killed/wounded</title
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
					y={axisY + 14}
					class="fill-gray-500 font-sans text-xs"
					text-anchor="start"
				>
					{formatDate(startDate)}
				</text>
				<text x={endRange} y={axisY + 14} class="fill-gray-500 font-sans text-xs" text-anchor="end">
					{formatDate(timeWeek.floor(endDate))}
				</text>
			{/if}
		</svg>
	{/if}
</div>
