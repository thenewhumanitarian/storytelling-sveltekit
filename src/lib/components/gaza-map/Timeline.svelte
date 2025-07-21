<script lang="ts">
	// import { incidentsData } from '$lib/components/gaza-map/incidents';
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
		setSelectedWeek,
		selectedMarkerId,
		scrollToCard = undefined
	}: {
		setHighlightedMarkerId: (id: number | null) => void;
		incidentsData: IncidentData[];
		gazaMapRef: { setSelectionOriginToClick: () => void } | null;
		selectedWeekStartDate: Date | null;
		setSelectedWeek: (date: Date | null, firstIncidentId: number | null) => void;
		selectedMarkerId: number | null;
		scrollToCard?: (id: number) => void;
	} = $props();

	// --- Internal State ---
	let timelineContainer: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	const svgHeight = 140; // Increased from 120 to 140 for accessibility highlight
	const barWidth = 12; // Constant width of bars
	const barTopPadding = 16; // Extra space above bars for highlight
	const axisPaddingBottom = 18; // Space below the axis line for labels etc.
	const barPaddingBottom = 0; // Space between bottom of bar and axis line
	// const horizontalPadding = 0; // Padding at the ends of the timeline axis

	const axisY = $derived(svgHeight - axisPaddingBottom);

	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({ ...d, dateObj: new Date(d.date) }))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()) // NB!! ensure that incidents are sorted by date first!!! otherwise cannot get the correct markerId when selecting a week.
	);

	// Find currently selected week start date
	const activeWeekStartDate = $derived(() => {
		if (selectedMarkerId === null) return null;
		const activeIncident = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		if (!activeIncident) return null;
		return timeWeek.floor(new Date(activeIncident.date));
	});

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

	const maxBarHeight = $derived(svgHeight - axisPaddingBottom - barPaddingBottom - barTopPadding);

	const timeScale = $derived.by(() => {
		if (!containerWidth || weeklyAggregatedData.length === 0) {
			return scaleTime().domain([new Date(), new Date()]).range([0, 0]);
		}

		const dateDomain = extent(weeklyAggregatedData, (d) => d.weekStartDate) as [Date, Date];
		let minDate = timeWeek.floor(dateDomain[0]!);
		let maxDate = timeWeek.floor(dateDomain[1]!); // ✅ this aligns the last bar with the right edge

		return scaleTime()
			.domain([minDate, maxDate])
			.range([barWidth / 2, containerWidth - barWidth / 2]);
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

	const maxWeek = $derived.by(() => {
		if (weeklyAggregatedData.length === 0) return null;
		return weeklyAggregatedData.reduce(
			(max, d) => (d.totalKilledOrWounded > max.totalKilledOrWounded ? d : max),
			weeklyAggregatedData[0]
		);
	});

	const maxBarLabel = $derived.by(() => {
		if (!maxWeek || !timeScale || !heightScale) return null;

		return {
			x: timeScale(maxWeek.weekStartDate),
			y: axisY - heightScale(maxWeek.totalKilledOrWounded) - barPaddingBottom - 6,
			value: maxWeek.totalKilledOrWounded
		};
	});

	// Add derived for events
	const events = $derived(parsedIncidents.filter((d) => d.type === 'event'));
	const incidents = $derived(parsedIncidents.filter((d) => d.type === 'incident'));

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
	{#if containerWidth > 0 && weeklyAggregatedData.length > 0}
		<svg width="100%" height={svgHeight} aria-label="Incident Timeline" class="block">
			<!-- Dotted event axis line -->
			<line
				x1={timeScale.range()[0]}
				y1={40}
				x2={timeScale.range()[1]}
				y2={40}
				stroke="#888"
				stroke-width="1"
				stroke-dasharray="2,3"
			/>
			<!-- Events label -->
			<text
				x={timeScale.range()[0] + 8}
				y={35}
				class="fill-zinc-500 font-sans text-xs"
				text-anchor="start"
			>
				Events
			</text>
			<!-- Event Symbols (top of chart) -->
			{#each events as event (event.chronoId)}
				{@const xPos = timeScale(new Date(event.date))}
				{@const isActive = selectedMarkerId === event.chronoId}
				<g
					class="event-symbol cursor-pointer"
					onclick={() => {
						setSelectedWeek(null, event.chronoId);
						scrollToCard?.(event.chronoId);
					}}
					onmouseenter={() => setHighlightedMarkerId(event.chronoId)}
					onmouseleave={handleMouseLeave}
					tabindex="0"
					aria-label={`Event: ${event.title}`}
					role="button"
				>
					<circle
						cx={xPos}
						cy={40}
						r={isActive ? 12 : 8}
						fill="#9F3E52"
						stroke={isActive ? '#9F3E52' : '#282828'}
						stroke-width={isActive ? 2 : 0}
						style={isActive
							? 'filter: drop-shadow(0 0 6px #9F3E5288); transition: all 0.2s;'
							: 'transition: all 0.2s;'}
					/>
					<title>{event.title}</title>
				</g>
			{/each}
			<!-- Axis Line -->
			<line
				x1={timeScale.range()[0]}
				y1={axisY}
				x2={timeScale.range()[1]}
				y2={axisY}
				class="stroke-gray-300"
				stroke-width="1"
			/>

			{#if maxBarLabel && typeof maxBarLabel?.x === 'number' && typeof maxBarLabel?.y === 'number'}
				{@const isLeftThird = maxBarLabel.x > (containerWidth * 2) / 3}
				{@const isRightThird = maxBarLabel.x < containerWidth / 3}
				{@const labelSide = isLeftThird ? 'left' : 'right'}
				{@const lineLength = 40}
				{@const lineStartX = labelSide === 'left' ? maxBarLabel.x - lineLength : maxBarLabel.x}
				{@const lineEndX = labelSide === 'left' ? maxBarLabel.x : maxBarLabel.x + lineLength}
				{@const labelX =
					labelSide === 'left' ? maxBarLabel.x - lineLength - 6 : maxBarLabel.x + lineLength + 6}
				{@const textAnchor = labelSide === 'left' ? 'end' : 'start'}

				<!-- Horizontal line from bar to label -->
				{@const labelYOffset = 13}
				<line
					x1={lineStartX}
					y1={maxBarLabel.y + labelYOffset}
					x2={lineEndX}
					y2={maxBarLabel.y + labelYOffset}
					stroke="#9f3e52"
					stroke-width="1"
				/>

				<!-- Label -->
				<text
					x={labelX - 3}
					y={maxBarLabel.y + labelYOffset + 3}
					text-anchor={textAnchor}
					class="fill-[#9f3e52] font-sans text-xs font-semibold"
				>
					{maxBarLabel.value} killed/wounded
				</text>
			{/if}

			<!-- Weekly Bars -->
			{#each weeklyAggregatedData as weekData (weekData.weekStartDate.toISOString())}
				{@const xPos = timeScale(weekData.weekStartDate)}
				{@const barHeight = heightScale(weekData.totalKilledOrWounded)}
				{@const yPos = axisY - barHeight - barPaddingBottom}
				{@const activeWeek = activeWeekStartDate()}
				{@const isSelected = activeWeek?.getTime() === weekData.weekStartDate.getTime()}

				<g
					class="group cursor-pointer focus:outline-none"
					onclick={() => {
						handleClick(weekData.weekStartDate, weekData.firstChronoId);
						scrollToCard?.(weekData.firstChronoId);
					}}
					onkeydown={(e) => handleKeyDown(e, weekData.weekStartDate, weekData.firstChronoId)}
					onmouseenter={() => handleMouseEnter(weekData.weekStartDate)}
					onmouseleave={handleMouseLeave}
					onfocusin={() => handleMouseEnter(weekData.weekStartDate)}
					onfocusout={handleMouseLeave}
					tabindex="0"
					aria-label={`Week starting ${formatDate(weekData.weekStartDate)}: ${weekData.totalKilledOrWounded} killed/wounded`}
					role="button"
				>
					<!-- Tooltip below bar -->
					<text
						x={xPos < containerWidth * 0.1
							? xPos - 5
							: xPos > containerWidth * 0.9
								? xPos + 5
								: xPos}
						y={axisY + 14}
						text-anchor={xPos < containerWidth * 0.1
							? 'start'
							: xPos > containerWidth * 0.9
								? 'end'
								: 'middle'}
						class="fill-gray-500 font-sans text-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						Week of {moment(weekData.weekStartDate).format('D MMMM Y')}
					</text>

					<!-- Bar -->
					<rect
						class:group-hover:fill-[#f2b0b8]={!isSelected}
						class="transition-colors duration-500 ease-in-out group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
						x={xPos - barWidth / 2}
						y={yPos}
						width={barWidth}
						height={barHeight}
						rx={isSelected ? barWidth / 2 : 1}
						ry={isSelected ? barWidth / 2 : 1}
						fill={isSelected ? '#f2b0b8' : '#9f3e52'}
						style={isSelected
							? 'stroke: #9F3E52; stroke-width: 4; filter: drop-shadow(0 0 6px #9F3E5288); transition: all 0.2s;'
							: 'stroke: none; transition: all 0.2s;'}
					>
						<title>
							Week starting {formatDate(weekData.weekStartDate)} - {weekData.totalKilledOrWounded} killed/wounded
						</title>
					</rect>
				</g>
			{/each}

			<!-- Date Labels ABOVE bars -->
			{#if timeScale.domain()[0] && timeScale.domain()[1]}
				{@const [startRange, endRange] = timeScale.range()}
				{@const [startDate, endDate] = timeScale.domain()}

				<!-- Left Tick + Label -->
				{@const firstX = timeScale(weeklyAggregatedData[0].weekStartDate) + 1}
				<line x1={firstX} y1={0} x2={firstX} y2={15} stroke="gray" stroke-width="1" />
				<text
					x={startRange}
					y={10}
					style="fill: gray"
					class="font-sans text-xs"
					text-anchor="start"
					dx="10"
				>
					{formatDate(startDate)}
				</text>

				<!-- Right Tick + Label -->
				{@const lastWeek = weeklyAggregatedData.at(-1)}
				{#if lastWeek}
					{@const lastX = timeScale(lastWeek.weekStartDate) - 1}
					<line x1={lastX} y1={0} x2={lastX} y2={15} stroke="gray" stroke-width="1" />
				{/if}
				<text
					x={endRange}
					y={10}
					class="fill-gray-400 font-sans text-xs"
					text-anchor="end"
					dx="-23"
				>
					{formatDate(timeWeek.floor(endDate))}
				</text>
			{/if}
		</svg>
	{/if}
</div>
