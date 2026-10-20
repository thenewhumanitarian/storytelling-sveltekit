<script lang="ts">
	import type { HaitiLang, IncidentData } from './types';
	import { buildDailyCalendar, type CalendarDay } from './daily-calendar';
	import { formatHaitiDate, parseHaitiDate } from './dates';

	let {
		incidentsData,
		lang,
		width,
		selectedMarkerId,
		onSelect
	}: {
		incidentsData: IncidentData[];
		lang: HaitiLang;
		width: number;
		selectedMarkerId: number | null;
		onSelect: (day: CalendarDay) => void;
	} = $props();
	const calendar = $derived(buildDailyCalendar(incidentsData));
	const cellSize = $derived(Math.min(20, Math.max(8, (width - 68) / Math.max(calendar.weeks, 1))));
	const selectedDate = $derived(
		incidentsData.find((record) => record.chronoId === selectedMarkerId)?.date
	);
	let hoveredDate = $state<string | null>(null);
	let focusedDate = $state<string | null>(null);
	const detail = $derived(calendar.days.find((day) => day.date === (hoveredDate ?? selectedDate)));
	const weekdays = $derived(
		lang === 'fr'
			? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
			: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	);
	const palette = ['#edf0f2', '#e8bdc7', '#ce8296', '#ad526c', '#792d43'];
	function description(day: CalendarDay) {
		const date = formatHaitiDate(day.date, lang);
		if (!day.incidentCount)
			return `${date} · ${lang === 'fr' ? 'Aucun incident recensé (couverture incomplète)' : 'No incident recorded (coverage incomplete)'}`;
		const incidents = `${day.incidentCount} ${day.incidentCount === 1 ? 'incident' : 'incidents'}`;
		const drones = `${day.knownDrones}${day.unknownCount ? '+' : ''} ${lang === 'fr' ? (day.knownDrones === 1 ? 'drone renseigné' : 'drones renseignés') : day.knownDrones === 1 ? 'recorded drone' : 'recorded drones'}`;
		const counts = day.unknownCount === day.incidentCount ? '' : ` · ${drones}`;
		const unknown = day.unknownCount
			? ` · ${day.unknownCount} ${lang === 'fr' ? 'nombre(s) inconnu(s)' : 'unknown count(s)'}`
			: '';
		return `${date} · ${incidents}${counts}${unknown}`;
	}
	function selectDay(day: CalendarDay) {
		hoveredDate = day.date;
		if (day.firstChronoId !== null) onSelect(day);
	}
	function navigate(event: KeyboardEvent, day: CalendarDay) {
		const steps: Record<string, number> = {
			ArrowUp: -1,
			ArrowDown: 1,
			ArrowLeft: -7,
			ArrowRight: 7
		};
		const step = steps[event.key];
		if (step === undefined) return;
		event.preventDefault();
		const next = calendar.days[calendar.days.indexOf(day) + step];
		if (next && event.currentTarget instanceof HTMLElement)
			event.currentTarget.parentElement
				?.querySelector<HTMLButtonElement>(`[data-date="${next.date}"]`)
				?.focus();
	}
</script>

<div class="daily-calendar" style:--cell="{cellSize}px" style:--weeks={calendar.weeks}>
	<div
		class="calendar-matrix"
		aria-label={lang === 'fr' ? 'Calendrier quotidien des incidents' : 'Daily incident calendar'}
	>
		<div class="month-labels" aria-hidden="true">
			{#each calendar.months as month (month.date)}
				<span
					title={new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
						month: 'long',
						year: 'numeric',
						timeZone: 'UTC'
					}).format(parseHaitiDate(month.date)!)}
					style:left="{month.column * cellSize}px"
					>{new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
						month: 'short',
						timeZone: 'UTC'
					}).format(parseHaitiDate(month.date)!)}</span
				>
			{/each}
		</div>
		<div class="weekday-labels" aria-hidden="true">
			{#each weekdays as weekday (weekday)}<span>{weekday}</span>{/each}
		</div>
		<div class="days">
			{#each calendar.days as day (day.date)}
				<button
					type="button"
					class={['day', { unknown: day.unknownCount > 0, selected: day.date === selectedDate }]}
					style:grid-column={day.column + 1}
					style:grid-row={day.row + 1}
					style:background-color={palette[Math.min(day.incidentCount, 4)]}
					data-date={day.date}
					title={description(day)}
					aria-label={description(day)}
					aria-pressed={day.date === selectedDate}
					tabindex={day.date === (focusedDate ?? selectedDate ?? calendar.days[0]?.date) ? 0 : -1}
					onpointerenter={() => (hoveredDate = day.date)}
					onpointerleave={() => (hoveredDate = null)}
					onfocus={() => {
						focusedDate = day.date;
						hoveredDate = day.date;
					}}
					onblur={() => (hoveredDate = null)}
					onclick={() => selectDay(day)}
					onkeydown={(event) => navigate(event, day)}
				>
				</button>
			{/each}
		</div>
	</div>
	<div class="calendar-caption">
		<span
			>{detail
				? description(detail)
				: lang === 'fr'
					? 'Survolez pour les détails ; cliquez pour ouvrir les incidents'
					: 'Hover for details; click to open incidents'}</span
		>
		<div
			class="legend"
			aria-label={lang === 'fr'
				? 'Couleur : nombre d’incidents ; hachures : nombre de drones inconnu'
				: 'Colour: incident count; hatching: unknown drone count'}
		>
			<span>Incidents</span>
			{#each [0, 1, 2, 3, 4] as count (count)}<span
					class="legend-key"
					style:background-color={palette[count]}>{count === 4 ? '4+' : count}</span
				>{/each}
			<span class="legend-key unknown">?</span>
		</div>
	</div>
</div>

<style>
	.daily-calendar {
		height: 184px;
		flex-shrink: 0;
		width: 100%;
		padding: 4px 10px 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		color: #52525b;
	}
	.calendar-matrix {
		display: grid;
		grid-template-columns: 32px calc(var(--cell) * var(--weeks));
		grid-template-rows: 18px calc(var(--cell) * 7);
		align-self: center;
	}
	.month-labels {
		grid-column: 2;
		position: relative;
		font-size: 11px;
	}
	.month-labels span {
		position: absolute;
		white-space: nowrap;
	}
	.weekday-labels {
		grid-column: 1;
		grid-row: 2;
		display: grid;
		grid-template-rows: repeat(7, var(--cell));
		font-size: 10px;
	}
	.weekday-labels span {
		display: flex;
		align-items: center;
	}
	.days {
		grid-column: 2;
		grid-row: 2;
		display: grid;
		grid-template-columns: repeat(var(--weeks), var(--cell));
		grid-template-rows: repeat(7, var(--cell));
		gap: 0;
	}
	.day {
		width: var(--cell);
		height: var(--cell);
		padding: 0;
		border: 0.5px solid #fff;
		border-radius: 0;
		cursor: pointer;
	}
	.day.selected {
		box-shadow: inset 0 0 0 2px #18181b;
	}
	.day:hover,
	.day:focus-visible {
		outline: 2px solid #18181b;
		outline-offset: -2px;
		position: relative;
		z-index: 1;
	}
	.unknown {
		background-image: repeating-linear-gradient(135deg, transparent 0 3px, #ffffffb8 3px 5px);
	}
	.calendar-caption {
		min-height: 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		font-size: 11px;
		white-space: nowrap;
	}
	.calendar-caption > span {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.legend {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 10px;
	}
	.legend-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 17px;
		height: 17px;
		color: #18181b;
	}
	.legend-key:nth-last-child(2) {
		color: white;
	}
	.legend-key.unknown {
		background-color: #b5b5bb;
		margin-left: 5px;
	}
</style>
