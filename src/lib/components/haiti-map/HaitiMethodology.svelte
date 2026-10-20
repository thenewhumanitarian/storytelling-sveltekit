<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HaitiLang, IncidentData } from './types';
	import { summariseIncidents } from './data';
	import { SHOW_HAITI_TOTALS } from './presentation';
	let { incidentsData, lang = 'en' }: { incidentsData: IncidentData[]; lang?: HaitiLang } =
		$props();
	let dialog: HTMLDialogElement;
	const summary = $derived(summariseIncidents(incidentsData));
	const fr = $derived(lang === 'fr');
</script>

<button type="button" class="method-button" onclick={() => dialog.showModal()}
	>{fr ? 'Méthodologie' : 'Methodology'}</button
>
<dialog
	bind:this={dialog}
	aria-labelledby="haiti-methodology-title"
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') dialog.close();
	}}
>
	<article {lang}>
		<header>
			<h2 id="haiti-methodology-title">{fr ? 'À propos des données' : 'About the data'}</h2>
			<button class="close" aria-label={fr ? 'Fermer' : 'Close'} onclick={() => dialog.close()}
				>×</button
			>
		</header>
		<p class="review">
			{fr ? 'Version de travail pour révision éditoriale' : 'Working version for editorial review'}
		</p>
		{#if fr}
			<p>
				Cette version utilise uniquement les incidents du jeu de données révisé de 2025. Aucun
				incident de 2026 ni événement de contexte supplémentaire n’est inclus. Les textes français
				ont été adaptés pour l’affichage ; les traductions anglaises sont des brouillons à remplacer
				par les versions validées.
			</p>
			{#if SHOW_HAITI_TOTALS}
				<h3>Un minimum documenté</h3>
				<p>
					Le total de <strong>{summary.knownDrones}+ drones</strong> correspond aux nombres
					renseignés pour {summary.incidentCount} incidents. Pour {summary.unknownCount} incidents, le
					nombre de drones est inconnu : ces incidents ne sont pas comptés comme zéro. Le « + » indique
					que le total est un minimum, à confirmer avec l’équipe éditoriale.
				</p>
			{:else}
				<h3>Comptage et couverture</h3>
				<p>
					Le total de drones est temporairement masqué pendant la vérification de l’unité de
					comptage et de la couverture des données. Les nombres par incident restent provisoires.
					Cette version présente {summary.incidentCount} incidents documentés ; elle ne constitue pas
					un recensement exhaustif de toutes les frappes. Pour {summary.unknownCount} incidents, le nombre
					de drones est inconnu.
				</p>
			{/if}
			<p>
				Les graphiques additionnent les nombres connus par période. Une barre hachurée signale une
				période où certains nombres sont inconnus.
			</p>
			<h3>Localisations et dates</h3>
			<p>
				Les points représentent généralement une localité, pas une position GPS exacte. Plusieurs
				incidents peuvent partager un point. {summary.unlocatedCount} incidents sans coordonnées fiables
				restent dans les fiches et les totaux, sans point sur la carte. {summary.undatedCount} incident
				reste dans les fiches et le total général, sans être placé dans la chronologie, car sa date est
				à confirmer.
			</p>
			<p>
				Les limites administratives de CNIGS/OCHA (HDX, version v01) servent de repère : communes et
				sections communales, pas limites de quartiers. Elles ne constituent pas une vérification des
				coordonnées. La carte de densité représente uniquement les nombres connus aux points
				disponibles.
			</p>
			<h3>Protection des sources</h3>
			<p>
				Les organisations contributrices restent anonymes. Les identités, notes de vérification et
				bilans humains sont conservés séparément et ne figurent pas dans les données publiques ni
				dans cette présentation.
			</p>
		{:else}
			<p>
				This version uses only incidents from the revised 2025 dataset. No 2026 incidents or
				additional context events are included. French text has been adapted for display; English
				translations are drafts to be replaced by approved editorial versions.
			</p>
			{#if SHOW_HAITI_TOTALS}
				<h3>A documented minimum</h3>
				<p>
					The <strong>{summary.knownDrones}+ drones</strong> tally adds the recorded numbers across {summary.incidentCount}
					incidents. Drone counts are unknown for {summary.unknownCount} incidents; these are not treated
					as zero. The “+” indicates a minimum, pending confirmation with the editors.
				</p>
			{:else}
				<h3>Counting and coverage</h3>
				<p>
					The drone total is temporarily hidden while the counting unit and data coverage are
					checked. Per-incident numbers remain provisional. This version presents
					{summary.incidentCount} documented incidents; it is not a complete tally of all strikes. Drone
					counts are unknown for {summary.unknownCount} incidents.
				</p>
			{/if}
			<p>
				Charts sum known numbers within each period. Hatching marks a period containing unknown
				counts.
			</p>
			<h3>Locations and dates</h3>
			<p>
				Points generally identify a locality, rather than an exact GPS site. Several incidents may
				share a point. {summary.unlocatedCount} incidents without reliable coordinates remain in the cards
				and totals, without a map point. {summary.undatedCount} incident remains in the cards and overall
				total but is excluded from the dated timeline while its date is checked.
			</p>
			<p>
				CNIGS/OCHA administrative boundaries (HDX, version v01) provide context: communes and
				communal sections, rather than neighbourhood boundaries. They do not verify incident
				coordinates. The density layer represents known counts at available locations only.
			</p>
			<h3>Protecting sources</h3>
			<p>
				Contributing organisations remain anonymous. Identities, verification notes and casualty
				data are held separately and are excluded from public data and this presentation.
			</p>
		{/if}
		<p class="credits">
			<a href="https://data.humdata.org/dataset/cod-ab-hti" target="_blank" rel="noreferrer"
				>CNIGS / OCHA · HDX</a
			> · CC BY-IGO
		</p>
		<a class="download" href={resolve('/embeddable/map/2026-08/haiti/data.csv')} download
			>{fr ? 'Télécharger les données affichées (brouillon)' : 'Download display data (draft)'}</a
		>
	</article>
</dialog>

<style>
	.method-button {
		border-radius: 2rem;
		background: #f3f4f6;
		padding: 0.3rem 0.7rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #9f3e52;
		cursor: pointer;
	}
	@media (max-width: 639px) {
		.method-button {
			padding-inline: 0.5rem;
		}
	}
	dialog {
		margin: auto;
		width: min(42rem, calc(100% - 1.5rem));
		max-height: calc(100svh - 2rem);
		overflow-y: auto;
		padding: 1.5rem;
		border: 1px solid #d4d4d8;
		color: #27272a;
		background: white;
	}
	dialog::backdrop {
		background: rgb(24 24 27 / 55%);
	}
	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
	}
	h2 {
		font-family: Georgia, serif;
		font-size: 1.7rem;
		font-weight: bold;
	}
	h3 {
		margin-top: 1.2rem;
		font-weight: 700;
	}
	p {
		margin: 0.6rem 0;
		font-size: 0.95rem;
		line-height: 1.55;
	}
	.review {
		color: #9f3e52;
		font-weight: 600;
		font-size: 0.8rem;
	}
	.close {
		font-size: 1.8rem;
		line-height: 1;
		cursor: pointer;
	}
	a {
		text-decoration: underline;
	}
	.credits {
		font-size: 0.75rem;
		color: #9f3e52;
	}
	.download {
		display: inline-block;
		margin-top: 1rem;
		color: #9f3e52;
		font-weight: 600;
		font-size: 0.85rem;
	}
</style>
