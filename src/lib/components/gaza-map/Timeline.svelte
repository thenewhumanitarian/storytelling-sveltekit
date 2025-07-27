<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { extent, rollup, sum } from 'd3-array';
	import { timeWeek } from 'd3-time';
	import type { IncidentData } from './types';
	import moment from 'moment';
	import { onMount } from 'svelte';

	// --- Component Properties ---
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

	// --- Internal State & Constants ---
	let timelineContainer: HTMLElement | undefined = $state();
	let containerWidth = $state(0);
	const svgHeight = 140;
	const barWidth = 12;
	const barTopPadding = 16;
	const axisPaddingBottom = 18;
	const barPaddingBottom = 0;
	const axisY = $derived(svgHeight - axisPaddingBottom);

	// --- Derived State (Svelte 5 Runes) ---
	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({ ...d, dateObj: new Date(d.date) }))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
	);

	const activeWeekStartDate = $derived(() => {
		if (selectedMarkerId === null) return null;
		const activeIncident = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		if (!activeIncident) return null;
		return timeWeek.floor(new Date(activeIncident.date));
	});

	const weeklyAggregatedData = $derived.by(() => {
		if (parsedIncidents.length === 0) return [];

		// Filter to only include incidents for bar aggregation
		const incidentsOnly = parsedIncidents.filter((d) => d.type === 'incident');

		const rolledUp = rollup(
			incidentsOnly,
			(v) => ({
				totalKilledOrWounded: sum(v, (d) => d.killedOrWounded),
				firstChronoId: v[0].chronoId
			}),
			(d) => timeWeek.floor(d.dateObj)
		);

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
		const minDate = timeWeek.floor(dateDomain[0]!);
		const maxDate = timeWeek.floor(dateDomain[1]!);
		return scaleTime()
			.domain([minDate, maxDate])
			.range([barWidth / 2, containerWidth - barWidth / 2]);
	});

	const heightScale = $derived.by(() => {
		if (weeklyAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range([0, maxBarHeight]);
		}
		const maxWeeklyKilled = Math.max(...weeklyAggregatedData.map((d) => d.totalKilledOrWounded), 1);
		return scaleLinear().domain([0, maxWeeklyKilled]).range([5, maxBarHeight]);
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

	const events = $derived(parsedIncidents.filter((d) => d.type === 'event'));

	// --- Lifecycle ---
	onMount(() => {
		if (!timelineContainer) return;
		const resizeObserver = new ResizeObserver((entries) => {
			if (entries[0]) {
				containerWidth = entries[0].contentRect.width;
			}
		});
		resizeObserver.observe(timelineContainer);
		containerWidth = timelineContainer.offsetWidth;

		return () => resizeObserver.disconnect();
	});

	// --- Interaction Handlers ---
	function handleMouseEnter(weekStartDate: Date) {
		// CORRECTED: Find the corresponding week's data to highlight it.
		const week = weeklyAggregatedData.find(
			(w) => w.weekStartDate.getTime() === weekStartDate.getTime()
		);
		if (week) {
			// Assuming we want to highlight the first incident of the hovered week.
			// This behavior might need adjustment based on desired UX.
			setHighlightedMarkerId(week.firstChronoId);
		}
	}

	function handleMouseLeave() {
		setHighlightedMarkerId(null);
	}

	function handleClick(weekStartDate: Date, firstChronoId: number) {
		gazaMapRef?.setSelectionOriginToClick?.();
		if (selectedWeekStartDate && selectedWeekStartDate.getTime() === weekStartDate.getTime()) {
			setSelectedWeek(null, null);
		} else {
			setSelectedWeek(weekStartDate, firstChronoId);
		}
		if (scrollToCard) {
			scrollToCard(firstChronoId);
		}
	}

	function handleKeyDown(event: KeyboardEvent, weekStartDate: Date, firstChronoId: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick(weekStartDate, firstChronoId);
		}
	}

	function formatDate(date: Date): string {
		return moment(date).format('DD MMMM YYYY');
	}
</script>

<div
	bind:this={timelineContainer}
	class="box-border flex items-center w-full overflow-hidden border-t border-gray-300 h-36 bg-white/80 backdrop-blur"
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
			<text
				x={timeScale.range()[0] + 8}
				y={35}
				class="font-sans text-xs fill-zinc-500"
				text-anchor="start"
			>
				Events
			</text>

			<!-- Main Axis Line -->
			<line
				x1={timeScale.range()[0]}
				y1={axisY}
				x2={timeScale.range()[1]}
				y2={axisY}
				class="stroke-gray-300"
				stroke-width="1"
			/>

			<!-- Max Bar Label -->
			{#if maxBarLabel && typeof maxBarLabel?.x === 'number'}
				{@const isLeftThird = maxBarLabel.x > (containerWidth * 2) / 3}
				{@const labelSide = isLeftThird ? 'left' : 'right'}
				{@const lineLength = 40}
				{@const lineStartX = labelSide === 'left' ? maxBarLabel.x - lineLength : maxBarLabel.x}
				{@const lineEndX = labelSide === 'left' ? maxBarLabel.x : maxBarLabel.x + lineLength}
				{@const labelX =
					labelSide === 'left' ? maxBarLabel.x - lineLength - 6 : maxBarLabel.x + lineLength + 6}
				{@const textAnchor = labelSide === 'left' ? 'end' : 'start'}
				{@const labelYOffset = 13}
				<line
					x1={lineStartX}
					y1={maxBarLabel.y + labelYOffset}
					x2={lineEndX}
					y2={maxBarLabel.y + labelYOffset}
					stroke="#9f3e52"
					stroke-width="1"
				/>
				<text
					x={labelX - 3}
					y={maxBarLabel.y + labelYOffset + 3}
					text-anchor={textAnchor}
					class="fill-[#9f3e52] font-sans text-xs font-semibold"
				>
					{maxBarLabel.value} killed/wounded
				</text>
			{/if}

			<!-- Inactive Event Symbols (render first, behind active elements) -->
			{#each events as event (event.chronoId)}
				{@const xPos = timeScale(new Date(event.date))}
				{@const isActive = selectedMarkerId === event.chronoId}
				{#if !isActive}
					{@const size = 8}
					<g
						class="cursor-pointer event-symbol group focus:outline-none"
						onclick={() => handleClick(timeWeek.floor(new Date(event.date)), event.chronoId)}
						onmouseenter={() => setHighlightedMarkerId(event.chronoId)}
						onmouseleave={handleMouseLeave}
						onfocusin={() => setHighlightedMarkerId(event.chronoId)}
						onfocusout={handleMouseLeave}
						tabindex="0"
						aria-label={`Event: ${event.title}`}
						role="button"
					>
						<polygon
							points={`${xPos},${40 - size} ${xPos + size},${40} ${xPos},${40 + size} ${xPos - size},${40}`}
							fill="#4B5563"
							stroke="#1F2937"
							stroke-width={0}
							style:transition="all 0.2s"
							class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
						/>
						<title>{event.title}</title>
					</g>
				{/if}
			{/each}

			<!-- Inactive Weekly Bars (render first, behind active elements) -->
			{#each weeklyAggregatedData as weekData (weekData.weekStartDate.toISOString())}
				{@const xPos = timeScale(weekData.weekStartDate)}
				{@const barHeight = heightScale(weekData.totalKilledOrWounded)}
				{@const yPos = axisY - barHeight - barPaddingBottom}
				{@const isSelected = activeWeekStartDate()?.getTime() === weekData.weekStartDate.getTime()}
				{#if !isSelected}
					<g
						class="cursor-pointer group focus:outline-none"
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
						<rect
							class:group-hover:fill-[#f2b0b8]={!isSelected}
							class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
							x={xPos - barWidth / 2}
							y={yPos}
							width={barWidth}
							height={barHeight}
							rx={1}
							ry={1}
							fill="#9f3e52"
							style:stroke="none"
						>
							<title>
								Week starting {formatDate(weekData.weekStartDate)} - {weekData.totalKilledOrWounded} killed/wounded
							</title>
						</rect>
					</g>
				{/if}
			{/each}

			<!-- Active Event Symbols (render last, on top) -->
			{#each events as event (event.chronoId)}
				{@const xPos = timeScale(new Date(event.date))}
				{@const isActive = selectedMarkerId === event.chronoId}
				{#if isActive}
					{@const size = 12}
					<g
						class="cursor-pointer event-symbol group focus:outline-none"
						onclick={() => handleClick(timeWeek.floor(new Date(event.date)), event.chronoId)}
						onmouseenter={() => setHighlightedMarkerId(event.chronoId)}
						onmouseleave={handleMouseLeave}
						onfocusin={() => setHighlightedMarkerId(event.chronoId)}
						onfocusout={handleMouseLeave}
						tabindex="0"
						aria-label={`Event: ${event.title}`}
						role="button"
					>
						<polygon
							points={`${xPos},${40 - size} ${xPos + size},${40} ${xPos},${40 + size} ${xPos - size},${40}`}
							fill="#D1D5DB"
							stroke="#374151"
							stroke-width={4}
							style:filter="drop-shadow(0 0 6px #37415188)"
							style:transition="all 0.2s"
							class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
						/>
						<title>{event.title}</title>
					</g>
				{/if}
			{/each}

			<!-- Active Weekly Bars (render last, on top) -->
			{#if activeWeekStartDate()}
				{@const activeDate = activeWeekStartDate()}
				{@const selectedWeek = activeDate ? weeklyAggregatedData.find(w => w.weekStartDate.getTime() === activeDate.getTime()) : undefined}
				{#if selectedWeek}
					{@const xPos = timeScale(selectedWeek.weekStartDate)}
					{@const barHeight = heightScale(selectedWeek.totalKilledOrWounded)}
					{@const yPos = axisY - barHeight - barPaddingBottom}
					<g
						class="cursor-pointer group focus:outline-none"
						onclick={() => handleClick(selectedWeek.weekStartDate, selectedWeek.firstChronoId)}
						onkeydown={(e) => handleKeyDown(e, selectedWeek.weekStartDate, selectedWeek.firstChronoId)}
						onmouseenter={() => handleMouseEnter(selectedWeek.weekStartDate)}
						onmouseleave={handleMouseLeave}
						onfocusin={() => handleMouseEnter(selectedWeek.weekStartDate)}
						onfocusout={handleMouseLeave}
						tabindex="0"
						aria-label={`Week starting ${formatDate(selectedWeek.weekStartDate)}: ${selectedWeek.totalKilledOrWounded} killed/wounded`}
						role="button"
					>
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
							Week of {moment(selectedWeek.weekStartDate).format('D MMMM Y')}
						</text>
						<rect
							class:group-hover:fill-[#f2b0b8]={true}
							class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
							x={xPos - barWidth / 2}
							y={yPos}
							width={barWidth}
							height={barHeight}
							rx={1}
							ry={1}
							fill="#f2b0b8"
							style:stroke="#9F3E52"
							style:stroke-width={4}
							style:filter={'drop-shadow(0 0 6px #9F3E5288)'}
						>
							<title>
								Week starting {formatDate(selectedWeek.weekStartDate)} - {selectedWeek.totalKilledOrWounded} killed/wounded
							</title>
						</rect>
					</g>
				{/if}
			{/if}

			<!-- Date Labels & Range Lines -->
			{#if timeScale.domain()[0] && timeScale.domain()[1]}
				{@const [startRange, endRange] = timeScale.range()}
				{@const [startDate, endDate] = timeScale.domain()}
				{@const firstX = timeScale(weeklyAggregatedData[0].weekStartDate) - 0.5}
				{@const lastWeek = weeklyAggregatedData.at(-1)}
				{@const lastX = lastWeek ? timeScale(lastWeek.weekStartDate) + 0.5 : null}

				{#if lastX !== null}
					<line
						x1={firstX}
						y1={0}
						x2={firstX}
						y2={axisY}
						stroke="#bbb"
						stroke-width="1"
						stroke-dasharray="4,3"
						opacity="0.5"
					/>
					<line
						x1={lastX}
						y1={0}
						x2={lastX}
						y2={axisY}
						stroke="#bbb"
						stroke-width="1"
						stroke-dasharray="4,3"
						opacity="0.5"
					/>
				{/if}

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

				{#if lastX !== null}
					<line x1={lastX} y1={0} x2={lastX} y2={15} stroke="gray" stroke-width="1" />
				{/if}
				<text
					x={endRange}
					y={10}
					class="font-sans text-xs fill-gray-400"
					text-anchor="end"
					dx="-10"
				>
					{formatDate(timeWeek.floor(endDate))}
				</text>
			{/if}
		</svg>
	{/if}
</div>
