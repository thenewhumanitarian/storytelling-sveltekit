<script lang="ts">
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { extent, rollup, sum } from 'd3-array';
	import { timeWeek, timeMonth } from 'd3-time';
	import type { IncidentData } from './types';
	import moment from 'moment';
	import { onMount } from 'svelte';
	import GazaEmbedModal from '$lib/components/gaza-map/GazaEmbedModal.svelte';
	import Logo from '$lib/components/icons/Logo.svelte';

	// --- Component Properties ---
	let {
		setHighlightedMarkerId,
		highlightedMarkerId,
		incidentsData,
		gazaMapRef,
		selectedWeekStartDate,
		setSelectedWeek,
		selectedMarkerId,
		scrollToCard = undefined
	}: {
		setHighlightedMarkerId: (id: number | null) => void;
		highlightedMarkerId: number | null;
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
	let tooltipData = $state<{
		x: number;
		y: number;
		value: number;
		incidentCount: number;
		periodStartDate: Date;
	} | null>(null);

	// Embed modal
	let showEmbed = $state(false);
	let showBrandLogo = $state(false); // Show TNH logo by Embed when standalone or non-TNH embedding
	function openEmbed() {
		showEmbed = true;
	}
	function closeEmbed() {
		showEmbed = false;
	}

	// Copy to clipboard
	const embedSnippet = `<div id="gaza-aid-killings"></div>\n<script src="https://interactive.thenewhumanitarian.org/scripts/gaza-data-piece/dashboard-embed.js" defer><\/script>`;
	let copied = $state(false);
	async function copyEmbed() {
		if (typeof window === 'undefined') return;
		try {
			if (navigator && 'clipboard' in navigator) {
				await navigator.clipboard.writeText(embedSnippet);
				copied = true;
				setTimeout(() => (copied = false), 1500);
				return;
			}
		} catch {}
		// Fallback: select text in the pre element
		try {
			const el = document.getElementById('tnh-embed-code');
			if (!el) return;
			const range = document.createRange();
			range.selectNodeContents(el);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
			document.execCommand('copy');
			sel?.removeAllRanges();
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {}
	}
	const svgHeight = 160; // Increased height for better spacing
	const barWidth = 12; // Default bar width
	const barTopPadding = 16;
	const axisPaddingBottom = 18;
	const barPaddingBottom = 0;
	const axisY = $derived(svgHeight - axisPaddingBottom);

	const toggleHeight = 40; // Height for the toggle switch area (increased for iframe)
	const dateLabelsHeight = 24; // Height for the date labels section (reduced)

	// --- Derived State (Svelte 5 Runes) ---
	const parsedIncidents = $derived(
		incidentsData
			.map((d) => ({
				...d,
				dateObj: new Date(d.date),
				title: d.title || 'Untitled Event' // Ensure title is never empty
			}))
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
	);

	const activePeriodStartDate = $derived(() => {
		if (selectedMarkerId === null) return null;
		const activeIncident = incidentsData.find((i) => i.chronoId === selectedMarkerId);
		if (!activeIncident) return null;
		const date = new Date(activeIncident.date);
		return groupingMode === 'weekly' ? timeWeek.floor(date) : timeMonth.floor(date);
	});

	// Enhanced aggregation with incident count
	const enhancedAggregatedData = $derived.by(() => {
		if (parsedIncidents.length === 0) return [];

		const incidentsOnly = parsedIncidents.filter((d) => d.type === 'incident');
		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;

		const rolledUp = rollup(
			incidentsOnly,
			(v) => ({
				totalKilledOrWounded: sum(v, (d) => d.killedOrWounded || 0),
				incidentCount: v.length,
				firstChronoId: v[0].chronoId,
				// Calculate geographic spread (distance between incidents)
				geographicSpread: calculateGeographicSpread(v),
				// Calculate intensity (casualties per incident)
				intensity: sum(v, (d) => d.killedOrWounded || 0) / v.length
			}),
			(d) => timeFloor(d.dateObj)
		);

		const result = Array.from(rolledUp, ([periodStartDate, values]) => ({
			periodStartDate: periodStartDate as Date,
			totalKilledOrWounded: values.totalKilledOrWounded,
			incidentCount: values.incidentCount,
			firstChronoId: values.firstChronoId,
			geographicSpread: values.geographicSpread,
			intensity: values.intensity
		})).sort((a, b) => a.periodStartDate.getTime() - b.periodStartDate.getTime());

		return result;
	});

	// Helper function to calculate geographic spread
	function calculateGeographicSpread(incidents: any[]): number {
		if (incidents.length < 2) return 0;

		const validIncidents = incidents.filter((i) => i.latitude && i.longitude);
		if (validIncidents.length < 2) return 0;

		let maxDistance = 0;
		for (let i = 0; i < validIncidents.length; i++) {
			for (let j = i + 1; j < validIncidents.length; j++) {
				const distance = calculateDistance(
					validIncidents[i].latitude,
					validIncidents[i].longitude,
					validIncidents[j].latitude,
					validIncidents[j].longitude
				);
				maxDistance = Math.max(maxDistance, distance);
			}
		}
		return maxDistance;
	}

	// Helper function to calculate distance between two points
	function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const R = 6371; // Earth's radius in km
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	// Enhanced width scale based on incident count
	const widthScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear()
				.domain([0, 1])
				.range([barWidth * 0.5, barWidth * 1.5]);
		}
		const incidentCounts: number[] = enhancedAggregatedData.map((d) => d.incidentCount);
		const maxIncidentCount = Math.max(...incidentCounts, 1);
		return scaleLinear()
			.domain([0, maxIncidentCount])
			.range([barWidth * 0.5, barWidth * 1.5]);
	});

	// Intensity-based color scale
	const intensityColorScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range(['#fef2f2', '#dc2626']);
		}
		const intensities: number[] = enhancedAggregatedData.map((d) => d.intensity);
		const maxIntensity = Math.max(...intensities, 1);
		return scaleLinear().domain([0, maxIntensity]).range(['#fef2f2', '#dc2626']);
	});

	// Geographic spread color scale
	const spreadColorScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range(['#1e40af', '#dc2626']);
		}
		const spreads: number[] = enhancedAggregatedData.map((d) => d.geographicSpread);
		const maxSpread = Math.max(...spreads, 1);
		return scaleLinear().domain([0, maxSpread]).range(['#1e40af', '#dc2626']); // Blue to red
	});

	// Enhanced color and opacity scales
	const colorScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range(['#fef2f2', '#dc2626']);
		}
		const killedCounts: number[] = enhancedAggregatedData.map((d) => d.totalKilledOrWounded);
		const maxPeriodKilled = Math.max(...killedCounts, 1);
		return scaleLinear().domain([0, maxPeriodKilled]).range(['#fef2f2', '#dc2626']); // Light red to dark red
	});

	const opacityScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range([0.3, 1]);
		}
		const killedCounts: number[] = enhancedAggregatedData.map((d) => d.totalKilledOrWounded);
		const maxPeriodKilled = Math.max(...killedCounts, 1);
		return scaleLinear().domain([0, maxPeriodKilled]).range([0.3, 1]); // More transparent for lower values
	});

	// Enhanced complete timeline with new data
	const enhancedCompleteTimeline = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) return [];

		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;
		const timeCount = groupingMode === 'weekly' ? timeWeek.count : timeMonth.count;

		const dateDomain = extent(enhancedAggregatedData, (d) => d.periodStartDate) as [Date, Date];
		const minDate = timeFloor(dateDomain[0]!);
		const maxDate = timeFloor(dateDomain[1]!);

		const allPeriods: Date[] = [];
		let currentDate = minDate;
		while (currentDate <= maxDate) {
			allPeriods.push(currentDate);
			currentDate =
				groupingMode === 'weekly'
					? timeWeek.offset(currentDate, 1)
					: timeMonth.offset(currentDate, 1);
		}

		return allPeriods.map((periodStartDate) => {
			const existingData = enhancedAggregatedData.find(
				(d) => d.periodStartDate.getTime() === periodStartDate.getTime()
			);

			return {
				periodStartDate,
				totalKilledOrWounded: existingData?.totalKilledOrWounded || 0,
				incidentCount: existingData?.incidentCount || 0,
				firstChronoId: existingData?.firstChronoId || null,
				geographicSpread: existingData?.geographicSpread || 0,
				intensity: existingData?.intensity || 0,
				hasData: !!existingData
			};
		});
	});

	const maxBarHeight = $derived(svgHeight - axisPaddingBottom - barPaddingBottom - barTopPadding);

	const timeScale = $derived.by(() => {
		if (!containerWidth || enhancedAggregatedData.length === 0) {
			return scaleTime().domain([new Date(), new Date()]).range([0, 0]);
		}
		const dateDomain = extent(enhancedAggregatedData, (d) => d.periodStartDate) as [Date, Date];
		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;
		const minDate = timeFloor(dateDomain[0]!);
		const maxDate = timeFloor(dateDomain[1]!);

		// Calculate bar width for this scale
		let barWidthForScale = barWidth;
		if (groupingMode === 'monthly') {
			const totalMonths = timeMonth.count(minDate, maxDate) + 1;
			const availableWidth = containerWidth - 24;
			const widthPerMonth = availableWidth / totalMonths;
			// On mobile, use smaller multiplier to prevent overlapping
			const multiplier = isMobile ? 0.6 : 0.8;
			barWidthForScale = Math.min(Math.max(widthPerMonth * multiplier, 20), 60);
		} else if (groupingMode === 'weekly') {
			// For weekly mode, also adjust bar width on mobile
			const totalWeeks = timeWeek.count(minDate, maxDate) + 1;
			const availableWidth = containerWidth - 24;
			const widthPerWeek = availableWidth / totalWeeks;
			// On mobile, use smaller multiplier to prevent overlapping
			const multiplier = isMobile ? 0.6 : 0.8;
			barWidthForScale = Math.min(Math.max(widthPerWeek * multiplier, 8), 20);
		}

		return scaleTime()
			.domain([minDate, maxDate])
			.range([barWidthForScale / 2, containerWidth - barWidthForScale / 2]);
	});

	const heightScale = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) {
			return scaleLinear().domain([0, 1]).range([0, maxBarHeight]);
		}
		const maxPeriodKilled = Math.max(
			...enhancedAggregatedData.map((d) => d.totalKilledOrWounded),
			1
		);
		return scaleLinear().domain([0, maxPeriodKilled]).range([5, maxBarHeight]);
	});

	const maxPeriod = $derived.by(() => {
		if (enhancedAggregatedData.length === 0) return null;
		return enhancedAggregatedData.reduce(
			(max, d) => (d.totalKilledOrWounded > max.totalKilledOrWounded ? d : max),
			enhancedAggregatedData[0]
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
		if (enhancedAggregatedData.length === 0) return [];

		const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor;
		const timeCount = groupingMode === 'weekly' ? timeWeek.count : timeMonth.count;

		// Get the full date range
		const dateDomain = extent(enhancedAggregatedData, (d) => d.periodStartDate) as [Date, Date];
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
			const existingData = enhancedAggregatedData.find(
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

		// Determine whether to show brand logo next to Embed button
		try {
			const isTop = window.self === window.top;
			if (isTop) {
				showBrandLogo = true;
			} else {
				const ref = document.referrer || '';
				if (!ref) {
					// Unknown referrer: prefer showing the brand
					showBrandLogo = true;
				} else {
					let refHost = '';
					try {
						refHost = new URL(ref).hostname;
					} catch {
						refHost = '';
					}
					const isTNH = /(^|\.)thenewhumanitarian\.org$/i.test(refHost);
					showBrandLogo = !isTNH;
				}
			}
		} catch {
			showBrandLogo = true;
		}

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
		const period = enhancedAggregatedData.find(
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
					value: period.totalKilledOrWounded,
					incidentCount: period.incidentCount,
					periodStartDate: period.periodStartDate
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
			const period = enhancedAggregatedData.find(
				(p) => p.periodStartDate.getTime() === periodStartDate.getTime()
			);
			if (period) {
				const xPos = timeScale(period.periodStartDate);
				const barHeight = heightScale(period.totalKilledOrWounded);
				const yPos = axisY - barHeight - barPaddingBottom;
				tooltipData = {
					x: xPos,
					y: yPos - 5,
					value: period.totalKilledOrWounded,
					incidentCount: period.incidentCount,
					periodStartDate: period.periodStartDate
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
	class="box-border flex w-full flex-col overflow-hidden bg-gradient-to-t from-white via-white to-white/60 backdrop-blur sm:border-t sm:border-gray-200"
	style="height: {svgHeight + dateLabelsHeight + toggleHeight}px;"
>
	<!-- Chart Container -->
	<div class="flex w-full items-center h-{svgHeight}px">
		{#if containerWidth > 0 && enhancedAggregatedData.length > 0}
			<svg width="100%" height={svgHeight} aria-label="Incident Timeline" class="block">
				<!-- Events timeline label (rendered first to appear behind everything) -->
				<text
					x={timeScale.range()[0] + 67.5}
					y={31}
					class="fill-zinc-500 font-sans text-xs"
					text-anchor="start"
				>
					Events timeline
				</text>

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

				<!-- Main Axis Line -->
				<line
					x1={timeScale.range()[0]}
					y1={axisY}
					x2={timeScale.range()[1]}
					y2={axisY}
					class="stroke-gray-300"
					stroke-width="1"
				/>

				<!-- Period Bar Groups (render background and data bars together) -->
				{#each enhancedCompleteTimeline as periodData (periodData.periodStartDate.toISOString())}
					{@const xPos = timeScale(periodData.periodStartDate)}
					{@const maxBarHeightForPeriod = heightScale(
						Math.max(...enhancedAggregatedData.map((d) => d.totalKilledOrWounded), 1)
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
						role="button"
					>
						<!-- Invisible hover area (covers entire period space) -->
						<rect
							x={xPos -
								(groupingMode === 'monthly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
													(isMobile ? 0.6 : 0.8),
												20
											),
											60
										)
									: groupingMode === 'weekly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														(isMobile ? 0.6 : 0.8),
													8
												),
												20
											)
										: barWidth) /
									2}
							y={backgroundYPos}
							width={groupingMode === 'monthly'
								? Math.min(
										Math.max(
											((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
												(isMobile ? 0.6 : 0.8),
											20
										),
										60
									)
								: groupingMode === 'weekly'
									? Math.min(
											Math.max(
												((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
													(isMobile ? 0.6 : 0.8),
												8
											),
											20
										)
									: groupingMode === 'weekly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														(isMobile ? 0.6 : 0.8),
													8
												),
												20
											)
										: barWidth}
							height={maxBarHeightForPeriod}
							fill="transparent"
							style:stroke="none"
							pointer-events="all"
						/>

						<!-- Background Bar (for all periods) -->
						{#if true}
							{@const isEven = enhancedCompleteTimeline.indexOf(periodData) % 2 === 0}
							<rect
								x={xPos -
									(groupingMode === 'monthly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														0.8,
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
												((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
													(isMobile ? 0.6 : 0.8),
												20
											),
											60
										)
									: groupingMode === 'weekly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														(isMobile ? 0.6 : 0.8),
													8
												),
												20
											)
										: barWidth}
								height={maxBarHeightForPeriod}
								fill={isEven ? '#f3f4f6' : '#e5e7eb'}
								style:stroke="none"
								opacity="0.5"
							>
								<!-- <title>
									{groupingMode === 'weekly' ? 'Week' : 'Month'} starting {formatDate(
										periodData.periodStartDate
									)} - {periodData.totalKilledOrWounded} killed/wounded
								</title> -->
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
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														0.8,
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
												((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
													(isMobile ? 0.6 : 0.8),
												20
											),
											60
										)
									: groupingMode === 'weekly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														(isMobile ? 0.6 : 0.8),
													8
												),
												20
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
							style="paint-order: stroke; stroke: white; stroke-width: 3px; pointer-events: none;"
						>
							{groupingMode === 'weekly' ? 'Week' : 'Month'} of {moment(
								periodData.periodStartDate
							).format('D MMMM Y')}
						</text>
					</g>
				{/each}

				<!-- Active Period Bars (render before active events) -->
				{#if activePeriodStartDate()}
					{@const activeDate = activePeriodStartDate()}
					{@const selectedPeriod = activeDate
						? enhancedAggregatedData.find(
								(p) => p.periodStartDate.getTime() === activeDate.getTime()
							)
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
								style="paint-order: stroke; stroke: white; stroke-width: 3px; pointer-events: none;"
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
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														0.8,
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
												((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
													(isMobile ? 0.6 : 0.8),
												20
											),
											60
										)
									: groupingMode === 'weekly'
										? Math.min(
												Math.max(
													((containerWidth - 24) / Math.max(enhancedCompleteTimeline.length, 1)) *
														(isMobile ? 0.6 : 0.8),
													8
												),
												20
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

				<!-- Inactive Event Symbols (render after bars to be on top) -->
				{#each events as event (event.chronoId)}
					{@const xPos = timeScale(new Date(event.date))}
					{@const isActive = selectedMarkerId === event.chronoId}
					{@const isHighlighted = highlightedMarkerId === event.chronoId}
					{#if !isActive && !isHighlighted}
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
							aria-label={`Event: ${event.title || 'Untitled Event'}`}
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
							<title>{event.title || 'Untitled Event'}</title>

							<!-- Event Tooltip -->
							<g class="event-tooltip" style="pointer-events: none;">
								<!-- Background rectangle -->
								<rect
									x={xPos - 20}
									y={40 - size - 20}
									width={42}
									height={20}
									fill="white"
									stroke="black"
									stroke-width="1"
									rx="2"
									opacity="0"
									class="transition-opacity duration-300 group-hover:opacity-90"
								/>
								<text
									x={xPos + 1}
									y={40 - size - 5.5}
									text-anchor="middle"
									class="fill-black font-sans text-xs font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								>
									Event
								</text>
							</g>
						</g>
					{/if}
				{/each}

				<!-- Highlighted Event Symbols (render before active to be on top of inactive but below active) -->
				{#each events as event (event.chronoId)}
					{@const xPos = timeScale(new Date(event.date))}
					{@const isActive = selectedMarkerId === event.chronoId}
					{@const isHighlighted = highlightedMarkerId === event.chronoId}
					{#if !isActive && isHighlighted}
						{@const size = 8}
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol event-symbol--highlighted group cursor-pointer focus:outline-none"
							onclick={() => handleClick(timeFloor(new Date(event.date)), event.chronoId)}
							onmouseenter={() => setHighlightedMarkerId(event.chronoId)}
							onmouseleave={handleMouseLeave}
							onfocusin={() => setHighlightedMarkerId(event.chronoId)}
							onfocusout={handleMouseLeave}
							tabindex="0"
							aria-label={`Event: ${event.title || 'Untitled Event'}`}
							role="button"
						>
							<polygon
								points={`${xPos},${40 - size} ${xPos + size},${40} ${xPos},${40 + size} ${xPos - size},${40}`}
								fill="#2db487"
								stroke="#1F2937"
								stroke-width={0}
								style:transition="all 0.2s"
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
							/>
							<title>{event.title || 'Untitled Event'}</title>

							<!-- Event Tooltip -->
							<g class="event-tooltip" style="pointer-events: none;">
								<!-- Background rectangle -->
								<rect
									x={xPos - 20}
									y={40 - size - 20}
									width={42}
									height={20}
									fill="white"
									stroke="black"
									stroke-width="1"
									rx="2"
									opacity="90"
									class="transition-opacity duration-300"
								/>
								<text
									x={xPos + 1}
									y={40 - size - 5.5}
									text-anchor="middle"
									class="fill-black font-sans text-xs font-bold opacity-100 transition-opacity duration-300"
								>
									Event
								</text>
							</g>
						</g>
					{/if}
				{/each}

				<!-- Active Event Symbols (render last, on top) -->
				{#each events as event (event.chronoId)}
					{@const xPos = timeScale(new Date(event.date))}
					{@const isActive = selectedMarkerId === event.chronoId}
					{#if isActive}
						{@const size = 10}
						{@const timeFloor = groupingMode === 'weekly' ? timeWeek.floor : timeMonth.floor}
						<g
							class="event-symbol event-symbol--active group cursor-pointer focus:outline-none"
							onclick={() => handleClick(timeFloor(new Date(event.date)), event.chronoId)}
							onmouseenter={() => setHighlightedMarkerId(event.chronoId)}
							onmouseleave={handleMouseLeave}
							onfocusin={() => setHighlightedMarkerId(event.chronoId)}
							onfocusout={handleMouseLeave}
							tabindex="0"
							aria-label={`Event: ${event.title || 'Untitled Event'}`}
							role="button"
						>
							<polygon
								points={`${xPos},${40 - size} ${xPos + size},${40} ${xPos},${40 + size} ${xPos - size},${40}`}
								fill="#2db487"
								stroke="#374151"
								stroke-width={3}
								style:transition="all 0.2s"
								class="group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-1"
							/>
							<title>{event.title || 'Untitled Event'}</title>

							<!-- Event Tooltip -->
							<g class="event-tooltip" style="pointer-events: none;">
								<!-- Background rectangle -->
								<rect
									x={xPos - 25}
									y={40 - size - 25}
									width={50}
									height={20}
									fill="white"
									stroke="black"
									stroke-width="1"
									rx="2"
									opacity="0"
									class="transition-opacity duration-300 group-hover:opacity-90"
								/>
								<text
									x={xPos}
									y={40 - size - 12}
									text-anchor="middle"
									class="fill-black font-sans text-xs font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								>
									Event
								</text>
							</g>
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
						class="pointer-events-none"
					/>
					<text
						x={textX}
						y={textY}
						text-anchor="middle"
						class="pointer-events-none fill-[#9f3e52] font-sans text-xs font-semibold"
					>
						{textContent}
					</text>
				{/if}

				<!-- Date Labels & Range Lines -->
				{#if enhancedAggregatedData.length > 0}
					{@const [startRange, endRange] = timeScale.range()}
					{@const firstIncidentDate = new Date(enhancedAggregatedData[0].periodStartDate)}
					{@const lastIncidentDate = new Date(
						enhancedAggregatedData[enhancedAggregatedData.length - 1].periodStartDate
					)}
					{@const firstX = timeScale(enhancedAggregatedData[0].periodStartDate) - 0.5}
					{@const lastPeriod = enhancedAggregatedData.at(-1)}
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
					{@const periodType = groupingMode === 'weekly' ? 'Week' : 'Month'}
					{@const periodDate = moment(tooltipData.periodStartDate).format('D MMM YYYY')}
					{@const casualtiesNumber = `${tooltipData.value} people`}
					{@const casualtiesType = `killed or wounded`}
					{@const incidentsText = `${tooltipData.incidentCount} incident${tooltipData.incidentCount !== 1 ? 's' : ''}`}

					{@const maxTextWidth = Math.max(
						`${periodType} of ${periodDate}`.length * 6,
						casualtiesNumber.length * 6,
						casualtiesType.length * 6,
						incidentsText.length * 6
					)}
					{@const textHeight = 12}
					{@const lineHeight = 8}
					{@const padding = 8}
					{@const bgWidth = maxTextWidth + padding * 2}
					{@const bgHeight = textHeight * 4 + lineHeight * 3 + padding * 2}

					// Calculate tooltip position with edge case handling
					{@const tooltipMargin = 8} // Minimum margin from container edges
					{@const halfWidth = bgWidth / 2}

					// Determine horizontal positioning
					{@const wouldOverflowLeft = tooltipData.x - halfWidth < tooltipMargin}
					{@const wouldOverflowRight = tooltipData.x + halfWidth > containerWidth - tooltipMargin}

					{@const bgX = wouldOverflowLeft
						? tooltipMargin
						: wouldOverflowRight
							? containerWidth - bgWidth - tooltipMargin
							: tooltipData.x - halfWidth}

					// Always position tooltips at a consistent Y position above the bottom line
					{@const consistentTooltipY = axisY - bgHeight - padding - 10} // 10px above the axis line
					{@const bgY = consistentTooltipY}

					{@const centeredTextX = bgX + bgWidth / 2}

					<g class="tooltip" style="pointer-events: none;">
						<!-- Drop shadow -->
						<rect
							x={bgX + 1}
							y={bgY + 1}
							width={bgWidth}
							height={bgHeight}
							fill="rgba(0,0,0,0.1)"
							rx="4"
							class="pointer-events-none"
						/>

						<!-- Background rectangle -->
						<rect
							x={bgX}
							y={bgY}
							width={bgWidth}
							height={bgHeight}
							fill="white"
							stroke="#9f3e52"
							stroke-width="1"
							rx="4"
							opacity="0.95"
							class="pointer-events-none z-50 bg-white"
						/>

						<!-- Period date -->
						<text
							x={centeredTextX}
							y={bgY + textHeight + padding}
							text-anchor="middle"
							class="fill-gray-600 font-sans text-xs font-medium"
							style="pointer-events: none;"
						>
							{periodType} of {periodDate}
						</text>

						<!-- Casualties number -->
						<text
							x={centeredTextX}
							y={bgY + textHeight * 2 + lineHeight * 1 + padding}
							text-anchor="middle"
							class="fill-burgundy font-sans text-sm font-bold"
							style="pointer-events: none;"
						>
							{casualtiesNumber}
						</text>

						<!-- Casualties type -->
						<text
							x={centeredTextX}
							y={bgY + textHeight * 2 + lineHeight * 2.5 + padding + 5}
							text-anchor="middle"
							class="fill-burgundy font-sans text-xs font-medium"
							style="pointer-events: none;"
						>
							{casualtiesType}
						</text>

						<!-- Incidents count -->
						<text
							x={centeredTextX}
							y={bgY + textHeight * 3 + lineHeight * 3 + padding * 2}
							text-anchor="middle"
							class="fill-gray-700 font-sans text-xs"
							style="pointer-events: none;"
						>
							{incidentsText}
						</text>
					</g>
				{/if}
			</svg>
		{/if}
	</div>

	<!-- Date Labels - Between chart and toggle -->
	{#if enhancedAggregatedData.length > 0}
		<div class="flex w-full items-center justify-between px-0 py-0">
			<span class="pl-2 font-sans text-xs text-gray-500">
				{formatDate(new Date(enhancedAggregatedData[0].periodStartDate))}
			</span>
			<span class="pr-2 font-sans text-xs text-gray-500">
				{formatDate(
					new Date(enhancedAggregatedData[enhancedAggregatedData.length - 1].periodStartDate)
				)}
			</span>
		</div>
	{/if}

	<!-- Bottom Controls -->
	<div
		class="flex w-full items-center justify-center sm:justify-between h-{toggleHeight}px px-2 pb-3 pt-3"
	>
		<div class="flex items-center gap-2">
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

		<!-- Dataset Link - hidden on mobile -->
		<div class="hidden sm:flex">
			<a
				href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQYgKblF52DLu-hmfA1xHL94GAJrzQQLQsNTchOv4aIVL1TnFAT8WEAw4DwFox9pCqiuzJhEfn4mp9s/pubhtml"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800"
			>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					></path>
				</svg>
				View Dataset
			</a>
			<button
				type="button"
				class="ml-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800"
				onclick={openEmbed}
			>
				<svg
					class="h-3 w-3 fill-current"
					viewBox="0 0 229 229"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M57.079 161.287L6.89809 112.346L57.079 63.2038L70.0318 77.1057L33.1855 112.559L70.0318 147.589L57.079 161.287Z"
						fill="currentColor"
					/>
					<path d="M98.0159 203H81.3057L125.667 26H142.185L98.0159 203Z" fill="black" />
					<path
						d="M170.221 161.481L156.841 147.377L194.351 112.135L156.841 76.8937L170.221 63.3977L221.102 112.346L170.221 161.481Z"
						fill="currentColor"
					/>
				</svg>

				Embed
			</button>
			{#if showBrandLogo}
				<a class="flex" href="https://www.thenewhumanitarian.org" target="_blank" rel="noopener noreferrer">
					<span style="max-height: 28px;" class="tnh-controls-logo ml-3 inline-flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 405.32 109.7"
							style="width: 100px;"
						>
							<defs
								><style>
									.cls-1 {
										fill: #282828;
									}
									.cls-2 {
										fill: #a03c50;
									}
								</style></defs
							>
							<title>The New Humanitarian</title>
							<path
								class="cls-1"
								d="M176.13,87.43l-6.74.13-.12-2,2.41-.61V66.47c0-2.6-1.11-3.71-3.09-3.71-1.67,0-3.22.93-5.07,2.1l-1.55.93V84.9l2.48.61-.13,2-6.8-.13-7.36.13-.12-2,3.28-.61V46.25l-2.11.37L141,46.56V84.9l5.81.61-.12,2-10.51-.13-10.51.13-.19-2,5.94-.61V46.56l-6.87.06-4.2,10.14h-2V44.15l18.11.12L152,44.21l7.79-.74,2.22-.06v20l10.14-6.31c3.28,0,5.26.62,6.56,2s2,3.46,2,7.23V84.9l3.58.61-.12,2Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M193.63,71.48c.44,6.55,4.27,10.45,9.71,10.45a13.87,13.87,0,0,0,7.42-2.35l1.05,1.79a34.46,34.46,0,0,1-11.68,7c-8.29,0-14.9-5.56-14.9-14.53,0-8.53,5.19-14.47,15-16.82,7.42,0,11.56,4.58,11.56,11.5v2.91Zm9.28-2.29V68c0-5-.93-8-4.39-8-3.15,0-4.89,3.21-5,8.78,0,.25.06.49.06.74Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M233.55,52.87l-1.06-3.34V84.9l4.46.61-.07,2L231,87.43l-5.75.13-.19-2,4.39-.61v-38l-4.32-.74.18-2,5.07.12,8.29-.12,19.47,27.27,1.12,3V46.75l-4.45-.62.06-2,5.81.12,5.75-.12.19,2-4.33.62v41h-4.64Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M275.29,71.48c.43,6.55,4.26,10.45,9.7,10.45a13.87,13.87,0,0,0,7.42-2.35l1,1.79a34.46,34.46,0,0,1-11.68,7c-8.29,0-14.9-5.56-14.9-14.53,0-8.53,5.19-14.47,15-16.82,7.42,0,11.56,4.58,11.56,11.5v2.91Zm9.27-2.29V68c0-5-.93-8-4.39-8-3.15,0-4.88,3.21-5,8.78,0,.25.06.49.06.74Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M320.36,70.43l-.31-2.6L313.81,86.5l-7.48,2-10-28-2.72-.61.19-1.92,7.66.06,7.05-.06.19,1.92-3.09.61,6.24,19.3.43,3,6-17.93-1.48-4.33-2.54-.61.19-1.92,7.48.06,7-.06.19,1.92-3.1.61,6.25,19.36.37,2.9,7.11-22.26-3.21-.61.18-1.92,4.82.06,4.21-.06.18,1.92-3.15.61-8.66,26-7.48,2Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M43.9,136.15l4.39-.62V97.38l-4.39-.62.19-2,8.9.12,8.66-.12.18,2-4,.62v17H74v-17l-4.09-.62.13-2,8.72.12,8.84-.12.18,2-4.26.62v38.15l4.26.62-.18,2-8.84-.13-8.72.13-.13-2,4.09-.62V117H57.81v18.55l4,.62-.18,2L53,138.06l-8.9.13Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M119.28,129.78a13.38,13.38,0,0,0,.74,5.07l2.66-.13.19,2-10.52,2L110.93,133l-9.58,6.06c-3.34,0-5.57-.68-6.86-2-1.49-1.48-1.92-3.58-1.92-7.29V112l-3.34.31-.19-2,9.71-1.92,2.72-.12v21c0,2.78,1,4,3.4,4,1.43,0,2.72-.74,4.33-1.79l1.42-.87V112l-3.21.31-.19-2,9.34-1.92,2.72-.12Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M170.05,138.06l-7.05.13-.19-2,2.35-.62V117.1c0-2.6-1-3.71-2.91-3.71-1.6,0-3.33,1-4.94,2l-1.3,1v19.11l2.29.62-.19,2-6.68-.13-6.49.13-.18-2,2.28-.62V117.1c0-2.6-1-3.71-2.9-3.71-1.61,0-3.34,1-4.89,2l-1.36,1v19.11l2.35.62-.12,2-6.93-.13-7.23.13-.19-2,3.47-.62V112l-3.53.31-.25-1.92,9.84-2.1,2.35-.06.18,5.75,9.52-6.31c2.91,0,4.76.5,6.12,1.55s2.11,2.41,2.35,4.82l9.71-6.37c3.4,0,5.32.68,6.68,2s1.85,3.4,1.85,7.18v18.61l3.65.62-.12,2Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M194.47,107.7c8.6,0,11.81,2,11.81,9.34v12.74a12.44,12.44,0,0,0,.81,4.94l2.9-.18.25,2-10.82,2.22-1.73-5-7.79,5.32c-5.32,0-9.34-2.9-9.34-8a8.17,8.17,0,0,1,3-6.56l13.73-4.2v-4.58c0-3.46-.62-5-3.47-5a7.72,7.72,0,0,0-3.27.74l-1.05,7.12h-7.92V112.9Zm2.85,14.47-5.94,2.35a6.51,6.51,0,0,0-1.92,4.89c0,3.09,1.55,4.69,3.28,4.69a5.85,5.85,0,0,0,3.28-1.23l1.3-.87Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M220.38,138.06l-7.48.13-.18-2,3.46-.62V112l-3.53.43-.24-2,10-2.1,2.35-.06.06,5.75,10.14-6.31c3.34,0,5.32.62,6.62,1.92s1.92,3.4,1.92,7.17v18.74l3.64.62-.12,2-7.73-.13-7,.13-.18-2,2.41-.62V117.1c0-2.6-1-3.71-3-3.71-1.79,0-3.34.93-5.13,2.1l-1.49,1v19l2.48.62-.13,2Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M258,138.06l-7.67.13-.12-2,3.4-.62V112l-3.4.43-.25-2,9.89-2,2.42-.06v27.27l3.52.62-.12,2Zm-3.46-43,5.62-.37,2,.37.44,4.08-.81,3.65-5.62.37-2-.37-.5-4.27Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M266.76,111.78v-1.11l1.24-1.24h3.64v-4.2l7.18-4.64h1.42v9h8.1v2.22h-8.1V130c0,2.41,1.3,3.84,3.28,3.84a10.5,10.5,0,0,0,4.94-1.43l.87,1.8L280,139.05c-5.19,0-8.41-2.6-8.41-8.28v-19Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M305.41,107.7c8.59,0,11.81,2,11.81,9.34v12.74a12.45,12.45,0,0,0,.8,4.94l2.91-.18.24,2-10.82,2.22-1.73-5-7.79,5.32c-5.32,0-9.34-2.9-9.34-8a8.17,8.17,0,0,1,3-6.56l13.73-4.2v-4.58c0-3.46-.62-5-3.46-5a7.73,7.73,0,0,0-3.28.74l-1.05,7.12h-7.92V112.9Zm2.84,14.47-5.94,2.35a6.54,6.54,0,0,0-1.91,4.89c0,3.09,1.54,4.69,3.27,4.69a5.85,5.85,0,0,0,3.28-1.23l1.3-.87Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M335.4,118.21l5.93-10.2h5.32v8.6h-7.17c-.81.37-2.35,2.35-3.16,3.21l-.68.81v14.9l5.94.62-.19,2-9.89-.13-7.79.13-.12-2,3.46-.62V112l-3.46.31-.25-1.92,9.34-2.1,2.16-.12Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M357.41,138.06l-7.67.13-.12-2,3.4-.62V112l-3.4.43-.25-2,9.89-2,2.42-.06v27.27l3.52.62-.12,2ZM354,95l5.62-.37,2,.37.44,4.08-.81,3.65-5.62.37-2-.37-.5-4.27Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M382.14,107.7c8.6,0,11.81,2,11.81,9.34v12.74a12.44,12.44,0,0,0,.81,4.94l2.9-.18.25,2-10.82,2.22-1.73-5-7.79,5.32c-5.32,0-9.34-2.9-9.34-8a8.17,8.17,0,0,1,3-6.56l13.73-4.2v-4.58c0-3.46-.62-5-3.46-5a7.73,7.73,0,0,0-3.28.74l-1.05,7.12h-7.92V112.9ZM385,122.17l-5.94,2.35a6.54,6.54,0,0,0-1.91,4.89c0,3.09,1.54,4.69,3.27,4.69a5.85,5.85,0,0,0,3.28-1.23L385,132Z"
								transform="translate(-43.9 -43.41)"
							></path><path
								class="cls-1"
								d="M408.05,138.06l-7.48.13-.18-2,3.46-.62V112l-3.53.43-.24-2,9.95-2.1,2.35-.06.06,5.75,10.14-6.31c3.34,0,5.32.62,6.62,1.92s1.92,3.4,1.92,7.17v18.74l3.64.62-.12,2-7.73-.13-7,.13-.18-2,2.41-.62V117.1c0-2.6-1-3.71-3-3.71-1.79,0-3.34.93-5.13,2.1l-1.49,1v19l2.48.62-.13,2Z"
								transform="translate(-43.9 -43.41)"
							></path><rect
								id="cursor"
								style="fill: #9f3e52;"
								class="cls-2"
								x="399.54"
								y="48.81"
								width="5.79"
								height="60.89"
							></rect>
						</svg>
					</span>
				</a>
			{/if}
		</div>
	</div>
</div>

{#if showEmbed}
	<GazaEmbedModal onClose={closeEmbed} />
{/if}

<style lang="postcss">
	/* Ensure proper layering for chart elements */
	.period-bar--background {
		z-index: 0; /* Behind all other elements */
	}

	.period-bar--inactive {
		z-index: 1;
	}

	.period-bar--active {
		z-index: 2;
	}

	/* Event diamonds should always be on top */
	.event-symbol--inactive {
		/* Layering handled by DOM order */
	}

	.event-symbol--highlighted {
		/* Layering handled by DOM order */
	}

	.event-symbol--active {
		/* Layering handled by DOM order */
	}

	/* Ensure SVG elements respect z-index */
	svg {
		position: relative;
	}

	svg g {
		position: relative;
	}

	:global(.tnh-controls-logo .logo) {
		max-width: 80px;
	}
	@media (min-width: 1024px) {
		:global(.tnh-controls-logo .logo) {
			max-width: 80px;
		}
	}
</style>
