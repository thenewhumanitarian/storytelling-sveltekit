<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { extent, rollup, sum } from 'd3-array';
	import { timeWeek, timeMonth } from 'd3-time';
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
	let groupingMode = $state<'weekly' | 'monthly'>('weekly'); // Toggle between weekly and monthly
	let isMobile = $state(false); // Track mobile state for SSR-safe default
	let tooltipVisible = $state(false);
	let tooltipData = $state<{ x: number; y: number; value: number } | null>(null);
	const svgHeight = 140;
	const barWidth = 12;
	const barTopPadding = 16;
	const axisPaddingBottom = 18;
	const barPaddingBottom = 0;
	const axisY = $derived(svgHeight - axisPaddingBottom);
	const toggleHeight = 40; // Height for the toggle switch area

	// --- Derived State (Svelte 5 Runes) ---
	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({ ...d, dateObj: new Date(d.date) }))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
	);

	const activePeriodStartDate = $derived(() => {
		if (selectedMarkerId === null) return null;
		const activeIncident = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		if (!activeIncident) return null;
		const date = new Date(activeIncident.date);
		return groupingMode === 'weekly' ? timeWeek.floor(date) : timeMonth.floor(date);
	});

	const aggregatedData = $derived.by(() => {
		if (parsedIncidents.length === 0) return [];

		// Filter to only include incidents for bar aggregation
		const incidentsOnly = parsedIncidents.filter((d) => d.type === 'incident');

		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;

		const rolledUp = rollup(
			incidentsOnly,
			(v) => ({
				totalKilledOrWounded: sum(v, (d) => d.killedOrWounded),
				firstChronoId: v[0].chronoId
			}),
			(d) => timeFloor(d.dateObj)
		);

		return Array.from(rolledUp, ([periodStartDate, values]) => ({
			periodStartDate: periodStartDate as Date,
			totalKilledOrWounded: values.totalKilledOrWounded,
			firstChronoId: values.firstChronoId
		})).sort((a, b) => a.periodStartDate.getTime() - b.periodStartDate.getTime());
	});

	const maxBarHeight = $derived(svgHeight - axisPaddingBottom - barPaddingBottom - barTopPadding);

	const timeScale = $derived.by(() => {
		if (!containerWidth || aggregatedData.length === 0) {
			return scaleTime().domain([new Date(), new Date()]).range([0, 0]);
		}
		const dateDomain = extent(aggregatedData, (d) => d.periodStartDate) as [Date, Date];
		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;
		const minDate = timeFloor(dateDomain[0]!);
		const maxDate = timeFloor(dateDomain[1]!);
		return scaleTime()
			.domain([minDate, maxDate])
			.range([barWidth / 2, containerWidth - barWidth / 2]);
	});

	const heightScale = $derived.by(() => {
		if (aggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range([0, maxBarHeight]);
		}
		const maxPeriodKilled = Math.max(...aggregatedData.map((d) => d.totalKilledOrWounded), 1);
		return scaleLinear().domain([0, maxPeriodKilled]).range([5, maxBarHeight]);
	});

	const maxPeriod = $derived.by(() => {
		if (aggregatedData.length === 0) return null;
		return aggregatedData.reduce(
			(max, d) => (d.totalKilledOrWounded > max.totalKilledOrWounded ? d : max),
			aggregatedData[0]
		);
	});

	const maxBarLabel = $derived.by(() => {
		if (!maxPeriod || !timeScale || !heightScale) return null;
		return {
			x: timeScale(maxPeriod.periodStartDate),
			y: axisY - heightScale(maxPeriod.totalKilledOrWounded) - barPaddingBottom - 6,
			value: maxPeriod.totalKilledOrWounded
		};
	});

	const events = $derived(parsedIncidents.filter((d) => d.type === 'event'));

	// --- Lifecycle ---
	onMount(() => {
		// SSR-safe mobile detection and default grouping mode
		const checkMobile = () => {
			const mobile = window.innerWidth < 640; // Match Tailwind sm: breakpoint
			isMobile = mobile;

			// Set default grouping mode based on screen size
			if (mobile && groupingMode === 'weekly') {
				groupingMode = 'monthly';
			} else if (!mobile && groupingMode === 'monthly') {
				groupingMode = 'weekly';
			}
		};

		// Initial check
		checkMobile();

		// Listen for resize events
		window.addEventListener('resize', checkMobile);

		// Timeline container setup
		if (!timelineContainer) return;
		const resizeObserver = new ResizeObserver((entries) => {
			if (entries[0]) {
				containerWidth = entries[0].contentRect.width;
			}
		});
		resizeObserver.observe(timelineContainer);
		containerWidth = timelineContainer.offsetWidth;

		return () => {
			window.removeEventListener('resize', checkMobile);
			resizeObserver.disconnect();
		};
	});

	// --- Interaction Handlers ---
	function handleMouseEnter(periodStartDate: Date) {
		// Find the corresponding period's data to highlight it.
		const period = aggregatedData.find(
			(p) => p.periodStartDate.getTime() === periodStartDate.getTime()
		);
		if (period) {
			// Highlight the first incident of the hovered period
			setHighlightedMarkerId(period.firstChronoId);

			// Show tooltip on desktop
			if (!isMobile) {
				const xPos = timeScale(period.periodStartDate);
				const barHeight = heightScale(period.totalKilledOrWounded);
				const yPos = axisY - barHeight - barPaddingBottom;
				tooltipData = {
					x: xPos,
					y: yPos - 5,
					value: period.totalKilledOrWounded
				};
				tooltipVisible = true;
			}
		}
	}

	function handleMouseLeave() {
		setHighlightedMarkerId(null);
		if (!isMobile) {
			tooltipVisible = false;
		}
	}

	function handleBarClick(periodStartDate: Date, firstChronoId: number) {
		// On mobile, show tooltip when clicked
		if (isMobile) {
			const period = aggregatedData.find(
				(p) => p.periodStartDate.getTime() === periodStartDate.getTime()
			);
			if (period) {
				const xPos = timeScale(period.periodStartDate);
				const barHeight = heightScale(period.totalKilledOrWounded);
				const yPos = axisY - barHeight - barPaddingBottom;
				tooltipData = {
					x: xPos,
					y: yPos - 5,
					value: period.totalKilledOrWounded
				};
				tooltipVisible = true;

				// Hide tooltip after 2 seconds on mobile
				setTimeout(() => {
					tooltipVisible = false;
				}, 2000);
			}
		}

		// Handle the click action
		handleClick(periodStartDate, firstChronoId);
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
	class="box-border flex w-full flex-col overflow-hidden bg-white/80 backdrop-blur sm:border-t sm:border-gray-200"
	style="height: {svgHeight + toggleHeight}px;"
>
	<!-- Chart Container -->
	<div class="flex w-full items-center h-{svgHeight}px">
		{#if containerWidth > 0 && aggregatedData.length > 0}
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
					class="fill-zinc-500 font-sans text-xs"
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
					{@const minY = 25} // Minimum Y position to prevent overlap
					{@const adjustedY = Math.max(maxBarLabel.y + labelYOffset, minY)}
					<line
						x1={lineStartX}
						y1={adjustedY}
						x2={lineEndX}
						y2={adjustedY}
						stroke="#9f3e52"
						stroke-width="1"
					/>
					<text
						x={labelX - 3}
						y={adjustedY + 3}
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
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol group cursor-pointer focus:outline-none"
							onclick={() => handleClick(timeFloor(new Date(event.date)), event.chronoId)}
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

				<!-- Inactive Period Bars (render first, behind active elements) -->
				{#each aggregatedData as periodData (periodData.periodStartDate.toISOString())}
					{@const xPos = timeScale(periodData.periodStartDate)}
					{@const barHeight = heightScale(periodData.totalKilledOrWounded)}
					{@const yPos = axisY - barHeight - barPaddingBottom}
					{@const isSelected =
						activePeriodStartDate()?.getTime() === periodData.periodStartDate.getTime()}
					{#if !isSelected}
						<g
							class="group cursor-pointer focus:outline-none"
							onclick={() => handleBarClick(periodData.periodStartDate, periodData.firstChronoId)}
							onkeydown={(e) =>
								handleKeyDown(e, periodData.periodStartDate, periodData.firstChronoId)}
							onmouseenter={() => handleMouseEnter(periodData.periodStartDate)}
							onmouseleave={handleMouseLeave}
							onfocusin={() => handleMouseEnter(periodData.periodStartDate)}
							onfocusout={handleMouseLeave}
							tabindex="0"
							aria-label={`{groupingMode === 'weekly' ? 'Week' : 'Month'} starting ${formatDate(periodData.periodStartDate)}: ${periodData.totalKilledOrWounded} killed/wounded`}
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
								{groupingMode === 'weekly' ? 'Week' : 'Month'} of {moment(
									periodData.periodStartDate
								).format('D MMMM Y')}
							</text>
							<rect
								class:group-hover:fill-[#2db487]={!isSelected}
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
								x={xPos - barWidth / 2}
								y={yPos}
								width={barWidth}
								height={barHeight}
								fill="#9f3e52"
								style:stroke="none"
							>
								<title>
									{groupingMode === 'weekly' ? 'Week' : 'Month'} starting {formatDate(
										periodData.periodStartDate
									)} - {periodData.totalKilledOrWounded} killed/wounded
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
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol group cursor-pointer focus:outline-none"
							onclick={() => handleClick(timeFloor(new Date(event.date)), event.chronoId)}
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
								style:transition="all 0.2s"
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
							/>
							<title>{event.title}</title>
						</g>
					{/if}
				{/each}

				<!-- Active Period Bars (render last, on top) -->
				{#if activePeriodStartDate()}
					{@const activeDate = activePeriodStartDate()}
					{@const selectedPeriod = activeDate
						? aggregatedData.find((p) => p.periodStartDate.getTime() === activeDate.getTime())
						: undefined}
					{#if selectedPeriod}
						{@const xPos = timeScale(selectedPeriod.periodStartDate)}
						{@const barHeight = heightScale(selectedPeriod.totalKilledOrWounded)}
						{@const yPos = axisY - barHeight - barPaddingBottom}
						<g
							class="group cursor-pointer focus:outline-none"
							onclick={() =>
								handleBarClick(selectedPeriod.periodStartDate, selectedPeriod.firstChronoId)}
							onkeydown={(e) =>
								handleKeyDown(e, selectedPeriod.periodStartDate, selectedPeriod.firstChronoId)}
							onmouseenter={() => handleMouseEnter(selectedPeriod.periodStartDate)}
							onmouseleave={handleMouseLeave}
							onfocusin={() => handleMouseEnter(selectedPeriod.periodStartDate)}
							onfocusout={handleMouseLeave}
							tabindex="0"
							aria-label={`{groupingMode === 'weekly' ? 'Week' : 'Month'} starting ${formatDate(selectedPeriod.periodStartDate)}: ${selectedPeriod.totalKilledOrWounded} killed/wounded`}
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
								{groupingMode === 'weekly' ? 'Week' : 'Month'} of {moment(
									selectedPeriod.periodStartDate
								).format('D MMMM Y')}
							</text>
							<rect
								class:group-hover:fill-[#2db487]={true}
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
								x={xPos - barWidth / 2}
								y={yPos}
								width={barWidth}
								height={barHeight}
								fill="#2db487"
								style:stroke="none"
							>
								<title>
									{groupingMode === 'weekly' ? 'Week' : 'Month'} starting {formatDate(
										selectedPeriod.periodStartDate
									)} - {selectedPeriod.totalKilledOrWounded} killed/wounded
								</title>
							</rect>
						</g>
					{/if}
				{/if}

				<!-- Date Labels & Range Lines -->
				{#if parsedIncidents.length > 0}
					{@const [startRange, endRange] = timeScale.range()}
					{@const firstIncidentDate = new Date(parsedIncidents[0].date)}
					{@const lastIncidentDate = new Date(parsedIncidents[parsedIncidents.length - 1].date)}
					{@const firstX = timeScale(aggregatedData[0].periodStartDate) - 0.5}
					{@const lastPeriod = aggregatedData.at(-1)}
					{@const lastX = lastPeriod ? timeScale(lastPeriod.periodStartDate) + 0.5 : null}

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
						{formatDate(firstIncidentDate)}
					</text>

					{#if lastX !== null}
						<line x1={lastX} y1={0} x2={lastX} y2={15} stroke="gray" stroke-width="1" />
					{/if}
					<text
						x={endRange}
						y={10}
						class="fill-gray-400 font-sans text-xs"
						text-anchor="end"
						dx="-10"
					>
						{formatDate(lastIncidentDate)}
					</text>
				{/if}

				<!-- Tooltip -->
				{#if tooltipVisible && tooltipData}
					{@const isFirst5Percent = tooltipData.x < containerWidth * 0.05}
					{@const isLast5Percent = tooltipData.x > containerWidth * 0.95}

					{@const textX = isFirst5Percent
						? tooltipData.x + 5
						: isLast5Percent
							? tooltipData.x - 5
							: tooltipData.x}
					{@const textY = tooltipData.y}
					{@const textAnchor = isFirst5Percent ? 'start' : isLast5Percent ? 'end' : 'middle'}

					<g class="tooltip">
						<text x={textX} y={textY} text-anchor={textAnchor} class="fill-black text-xs font-bold">
							{tooltipData.value}
						</text>
					</g>
				{/if}
			</svg>
		{/if}
	</div>

	<!-- Toggle Switch for Weekly/Monthly - Centered underneath chart -->
	<div class="flex w-full items-center justify-center h-{toggleHeight}px px-4">
		<div class="flex items-center gap-2 bg-white/90 px-3 py-2 shadow-sm">
			<span class="text-sm font-medium text-gray-600">Group by:</span>
			<button
				class="rounded-full px-3 py-1 text-sm font-medium transition-colors {groupingMode ===
				'weekly'
					? 'bg-burgundy text-white'
					: 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
				onclick={() => (groupingMode = 'weekly')}
			>
				Weekly
			</button>
			<button
				class="rounded-full px-3 py-1 text-sm font-medium transition-colors {groupingMode ===
				'monthly'
					? 'bg-burgundy text-white'
					: 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
				onclick={() => (groupingMode = 'monthly')}
			>
				Monthly
			</button>
		</div>
	</div>
</div>
