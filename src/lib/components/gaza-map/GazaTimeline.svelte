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
	const svgHeight = 140; // Reduced back to original height
	const barWidth = 12; // Default bar width
	const barTopPadding = 16;
	const axisPaddingBottom = 18;
	const barPaddingBottom = 0;
	const axisY = $derived(svgHeight - axisPaddingBottom);

	const toggleHeight = 24; // Height for the toggle switch area (further reduced)
	const dateLabelsHeight = 24; // Height for the date labels section (reduced)

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

		// Calculate bar width for this scale
		let barWidthForScale = barWidth;
		if (groupingMode === 'monthly') {
			const totalMonths = timeMonth.count(minDate, maxDate) + 1;
			const availableWidth = containerWidth - 24;
			const widthPerMonth = availableWidth / totalMonths;
			barWidthForScale = Math.min(Math.max(widthPerMonth * 0.8, 20), 60);
		}

		return scaleTime()
			.domain([minDate, maxDate])
			.range([barWidthForScale / 2, containerWidth - barWidthForScale / 2]);
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
		const labelY = axisY - heightScale(maxPeriod.totalKilledOrWounded) - barPaddingBottom - 6;
		const minLabelY = 25; // Minimum Y position to prevent cutoff
		return {
			x: timeScale(maxPeriod.periodStartDate),
			y: Math.max(labelY, minLabelY),
			value: maxPeriod.totalKilledOrWounded
		};
	});

	const events = $derived(parsedIncidents.filter((d) => d.type === 'event'));

	// Create complete timeline with all periods (including empty ones)
	const completeTimeline = $derived.by(() => {
		if (aggregatedData.length === 0) return [];

		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;
		const timeCount = groupingMode === 'weekly' ? timeWeek.count : timeMonth.count;

		// Get the full date range
		const dateDomain = extent(aggregatedData, (d) => d.periodStartDate) as [Date, Date];
		const minDate = timeFloor(dateDomain[0]!);
		const maxDate = timeFloor(dateDomain[1]!);

		// Generate all periods in the range
		const allPeriods: Date[] = [];
		let currentDate = minDate;
		while (currentDate <= maxDate) {
			allPeriods.push(currentDate);
			currentDate =
				groupingMode === 'weekly'
					? timeWeek.offset(currentDate, 1)
					: timeMonth.offset(currentDate, 1);
		}

		// Map each period to data (0 for empty periods)
		return allPeriods.map((periodStartDate) => {
			const existingData = aggregatedData.find(
				(d) => d.periodStartDate.getTime() === periodStartDate.getTime()
			);

			return {
				periodStartDate,
				totalKilledOrWounded: existingData?.totalKilledOrWounded || 0,
				firstChronoId: existingData?.firstChronoId || null,
				hasData: !!existingData
			};
		});
	});

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
	style="height: {svgHeight + dateLabelsHeight + toggleHeight}px;"
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

				<!-- Inactive Event Symbols (render first, behind active elements) -->
				{#each events as event (event.chronoId)}
					{@const xPos = timeScale(new Date(event.date))}
					{@const isActive = selectedMarkerId === event.chronoId}
					{#if !isActive}
						{@const size = 8}
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol event-symbol--inactive group cursor-pointer focus:outline-none"
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

				<!-- Period Bar Groups (render background and data bars together) -->
				{#each completeTimeline as periodData (periodData.periodStartDate.toISOString())}
					{@const xPos = timeScale(periodData.periodStartDate)}
					{@const maxBarHeightForPeriod = heightScale(
						Math.max(...aggregatedData.map((d) => d.totalKilledOrWounded), 1)
					)}
					{@const barHeight = periodData.hasData ? heightScale(periodData.totalKilledOrWounded) : 0}
					{@const yPos = axisY - barHeight - barPaddingBottom}
					{@const backgroundYPos = axisY - maxBarHeightForPeriod - barPaddingBottom}
					{@const isSelected =
						activePeriodStartDate()?.getTime() === periodData.periodStartDate.getTime()}
					{@const hasData = periodData.hasData && periodData.totalKilledOrWounded > 0}

					<g
						class="period-bar-group group cursor-pointer focus:outline-none"
						onclick={() =>
							handleBarClick(periodData.periodStartDate, periodData.firstChronoId || 0)}
						onkeydown={(e) =>
							handleKeyDown(e, periodData.periodStartDate, periodData.firstChronoId || 0)}
						onmouseenter={() => handleMouseEnter(periodData.periodStartDate)}
						onmouseleave={handleMouseLeave}
						onfocusin={() => handleMouseEnter(periodData.periodStartDate)}
						onfocusout={handleMouseLeave}
						tabindex="0"
						aria-label={`{groupingMode === 'weekly' ? 'Week' : 'Month'} starting ${formatDate(
							periodData.periodStartDate
						)}: ${periodData.totalKilledOrWounded} killed/wounded`}
						role="button"
					>
						<!-- Invisible hover area (covers entire period space) -->
						<rect
							x={xPos -
								(groupingMode === 'monthly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
												20
											),
											60
										)
									: barWidth) /
									2}
							y={backgroundYPos}
							width={groupingMode === 'monthly'
								? Math.min(
										Math.max(
											((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
											20
										),
										60
									)
								: barWidth}
							height={maxBarHeightForPeriod}
							fill="transparent"
							style:stroke="none"
							pointer-events="all"
						/>

						<!-- Background Bar (for all periods) -->
						{#if true}
							<rect
								x={xPos -
									(groupingMode === 'monthly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
													20
												),
												60
											)
										: barWidth) /
										2}
								y={backgroundYPos}
								width={groupingMode === 'monthly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
												20
											),
											60
										)
									: barWidth}
								height={maxBarHeightForPeriod}
								fill="#f3f4f6"
								style:stroke="none"
								opacity="0.5"
							>
								<title>
									{groupingMode === 'weekly' ? 'Week' : 'Month'} starting {formatDate(
										periodData.periodStartDate
									)} - {periodData.totalKilledOrWounded} killed/wounded
								</title>
							</rect>
						{/if}

						<!-- Data Bar (only for periods with data) -->
						{#if hasData && !isSelected}
							<rect
								class:group-hover:fill-[#2db487]={true}
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
								x={xPos -
									(groupingMode === 'monthly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
													20
												),
												60
											)
										: barWidth) /
										2}
								y={yPos}
								width={groupingMode === 'monthly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
												20
											),
											60
										)
									: barWidth}
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
						{/if}

						<!-- Date Label (for all periods) -->
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
							style="paint-order: stroke; stroke: white; stroke-width: 3px;"
						>
							{groupingMode === 'weekly' ? 'Week' : 'Month'} of {moment(
								periodData.periodStartDate
							).format('D MMMM Y')}
						</text>

						<!-- Killed/Wounded Label (only for periods with data) -->
						{#if hasData}
							<text
								x={xPos < containerWidth * 0.1
									? xPos - 5
									: xPos > containerWidth * 0.9
										? xPos + 5
										: xPos}
								y={yPos - 5}
								text-anchor={xPos < containerWidth * 0.1
									? 'start'
									: xPos > containerWidth * 0.9
										? 'end'
										: 'middle'}
								class="fill-gray-700 font-sans text-[10px] font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								style="paint-order: stroke; stroke: white; stroke-width: 3px;"
							>
								{periodData.totalKilledOrWounded}
							</text>
						{/if}
					</g>
				{/each}

				<!-- Active Period Bars (render before active events) -->
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
							class="period-bar period-bar--active group cursor-pointer focus:outline-none"
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
								style="paint-order: stroke; stroke: white; stroke-width: 3px;"
							>
								{groupingMode === 'weekly' ? 'Week' : 'Month'} of {moment(
									selectedPeriod.periodStartDate
								).format('D MMMM Y')}
							</text>
							<rect
								class:group-hover:fill-[#2db487]={true}
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
								x={xPos -
									(groupingMode === 'monthly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
													20
												),
												60
											)
										: barWidth) /
										2}
								y={yPos}
								width={groupingMode === 'monthly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(aggregatedData.length, 1)) * 0.8,
												20
											),
											60
										)
									: barWidth}
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

				<!-- Active Event Symbols (render last, on top) -->
				{#each events as event (event.chronoId)}
					{@const xPos = timeScale(new Date(event.date))}
					{@const isActive = selectedMarkerId === event.chronoId}
					{#if isActive}
						{@const size = 12}
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol event-symbol--active group cursor-pointer focus:outline-none"
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

				<!-- Max Bar Label (render after active elements to be behind them) -->
				{#if maxBarLabel && typeof maxBarLabel?.x === 'number'}
					{@const isLeftThird = maxBarLabel.x > (containerWidth * 2) / 3}
					{@const labelSide = isLeftThird ? 'left' : 'right'}
					{@const lineLength = 40}
					{@const lineStartX = labelSide === 'left' ? maxBarLabel.x - lineLength : maxBarLabel.x}
					{@const lineEndX = labelSide === 'left' ? maxBarLabel.x : maxBarLabel.x + lineLength}
					{@const labelX =
						labelSide === 'left' ? maxBarLabel.x - lineLength - 6 : maxBarLabel.x + lineLength + 6}
					{@const textAnchor = labelSide === 'left' ? 'end' : 'start'}
					{@const labelYOffset = 48}
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
					{@const textContent = `${maxBarLabel.value} killed/wounded`}
					{@const textWidth = textContent.length * 6} // Approximate character width
					{@const textHeight = 12} // Approximate text height
					{@const padding = 5}
					{@const bgWidth = textWidth + padding * 2}
					{@const bgHeight = textHeight + padding * 2}
					{@const bgX = textAnchor === 'end' ? labelX - bgWidth + 8 : labelX - bgWidth / 2 - 8}
					{@const bgY = adjustedY - bgHeight + 10} // Position background above the adjusted label position
					{@const textX = bgX + bgWidth / 2} // Center text within background
					{@const textY = bgY + bgHeight / 2 + 4} // Center text vertically with slight adjustment

					<!-- Background rectangle -->
					<rect
						x={bgX}
						y={bgY}
						width={bgWidth}
						height={bgHeight}
						fill="white"
						stroke="#9f3e52"
						stroke-width="1"
						rx="2"
						opacity="0.9"
					/>
					<text
						x={textX}
						y={textY}
						text-anchor="middle"
						class="fill-[#9f3e52] font-sans text-xs font-semibold"
					>
						{textContent}
					</text>
				{/if}

				<!-- Date Labels & Range Lines -->
				{#if parsedIncidents.length > 0}
					{@const [startRange, endRange] = timeScale.range()}
					{@const firstIncidentDate = new Date(parsedIncidents[0].date)}
					{@const lastIncidentDate = new Date(parsedIncidents[parsedIncidents.length - 1].date)}
					{@const firstX = timeScale(aggregatedData[0].periodStartDate) - 0.5}
					{@const lastPeriod = aggregatedData.at(-1)}
					{@const lastX = lastPeriod ? timeScale(lastPeriod.periodStartDate) + 0.5 : null}

					<!-- Dashed lines from axis to date labels -->
					<line
						x1={firstX}
						y1={axisY}
						x2={firstX}
						y2={svgHeight + dateLabelsHeight}
						stroke="gray"
						stroke-width="1"
						stroke-dasharray="4,3"
					/>
					{#if lastX !== null}
						<line
							x1={lastX}
							y1={axisY}
							x2={lastX}
							y2={svgHeight + dateLabelsHeight}
							stroke="gray"
							stroke-width="1"
							stroke-dasharray="4,3"
						/>
					{/if}

					<!-- Solid lines aligned with date labels -->
					<line
						x1={firstX}
						y1={svgHeight + dateLabelsHeight}
						x2={firstX}
						y2={svgHeight + dateLabelsHeight + 8}
						stroke="gray"
						stroke-width="1"
					/>
					{#if lastX !== null}
						<line
							x1={lastX}
							y1={svgHeight + dateLabelsHeight}
							x2={lastX}
							y2={svgHeight + dateLabelsHeight + 8}
							stroke="gray"
							stroke-width="1"
						/>
					{/if}
				{/if}

				<!-- Tooltip -->
				{#if tooltipVisible && tooltipData}
					{@const isFirst5Percent = tooltipData.x < containerWidth * 0.05}
					{@const isLast5Percent = tooltipData.x > containerWidth * 0.95}

					{@const textX = isFirst5Percent
						? tooltipData.x + 2
						: isLast5Percent
							? tooltipData.x - 2
							: tooltipData.x}
					{@const textY = tooltipData.y}
					{@const textAnchor = isFirst5Percent ? 'start' : isLast5Percent ? 'end' : 'middle'}

					{@const textContent = tooltipData.value.toString()}
					{@const textWidth = textContent.length * 6} // Approximate character width
					{@const textHeight = 12} // Approximate text height
					{@const padding = 3}
					{@const bgWidth = textWidth + padding * 2}
					{@const bgHeight = textHeight + padding * 2}
					{@const bgX =
						textAnchor === 'start'
							? textX - padding
							: textAnchor === 'end'
								? textX - bgWidth + padding
								: textX - bgWidth / 2}
					{@const bgY = textY - textHeight - padding}
					{@const centeredTextX = bgX + bgWidth / 2} // Center text within background
					{@const centeredTextY = bgY + bgHeight / 2 + 4} // Center text vertically with slight adjustment

					<g class="tooltip">
						<!-- Background rectangle -->
						<rect
							x={bgX}
							y={bgY}
							width={bgWidth}
							height={bgHeight}
							fill="white"
							stroke="black"
							stroke-width="1"
							rx="2"
							opacity="0.9"
						/>
						<text
							x={centeredTextX}
							y={centeredTextY}
							text-anchor="middle"
							class="fill-black text-xs font-bold"
						>
							{textContent}
						</text>
					</g>
				{/if}
			</svg>
		{/if}
	</div>

	<!-- Date Labels - Between chart and toggle -->
	{#if parsedIncidents.length > 0}
		<div class="flex w-full items-center justify-between px-0 py-0">
			<span class="pl-2 font-sans text-xs text-gray-500">
				{formatDate(new Date(parsedIncidents[0].date))}
			</span>
			<span class="pr-2 font-sans text-xs text-gray-500">
				{formatDate(new Date(parsedIncidents[parsedIncidents.length - 1].date))}
			</span>
		</div>
	{/if}

	<!-- Toggle Switch for Weekly/Monthly - Centered underneath chart -->
	<div class="flex w-full items-center justify-center h-{toggleHeight}px px-4">
		<div class="flex items-center gap-2 bg-white/90 px-3">
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

<style lang="postcss">
	/* Ensure proper layering for chart elements */
	.period-bar--background {
		z-index: 0; /* Behind all other elements */
	}

	.event-symbol--inactive {
		z-index: 1;
	}

	.period-bar--inactive {
		z-index: 2;
	}

	.period-bar--active {
		z-index: 3;
	}

	.event-symbol--active {
		z-index: 5; /* Higher than active bars to overlay them */
	}

	/* Ensure SVG elements respect z-index */
	svg {
		position: relative;
	}

	svg g {
		position: relative;
	}
</style>
