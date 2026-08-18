import type { HaitiLang, IncidentData } from './types';

export type { HaitiLang };

type Copy = {
	incident: string;
	event: string;
	eventsTimeline: string;
	untitledEvent: string;
	showSources: string;
	sources: string;
	groupBy: string;
	weekly: string;
	monthly: string;
	viewDataset: string;
	embed: string;
	fullscreen: string;
	exit: string;
	up: string;
	down: string;
	readMore: string;
	close: string;
	previous: string;
	next: string;
	language: string;
	embedTitle: string;
	embedIntro: string;
	embedWhat: string;
	embedOptional: string;
	copied: string;
	copy: string;
	casualtiesUnknown: string;
	killedOrWounded: string;
	people: string;
	incidents: string;
	incidentSingular: string;
	mapUnavailable: string;
};

export const copy: Record<HaitiLang, Copy> = {
	en: {
		incident: 'Incident',
		event: 'Event',
		eventsTimeline: 'Events timeline',
		untitledEvent: 'Untitled event',
		showSources: 'Show sources',
		sources: 'Sources',
		groupBy: 'Group by:',
		weekly: 'Weekly',
		monthly: 'Monthly',
		viewDataset: 'View Dataset',
		embed: 'Embed',
		fullscreen: 'Fullscreen',
		exit: 'Exit',
		up: '↑ Up',
		down: 'Down ↓',
		readMore: 'Read more',
		close: 'Close',
		previous: 'Previous',
		next: 'Next',
		language: 'Language',
		embedTitle: 'Embed this dashboard',
		embedIntro: 'Copy and paste the following into your CMS or HTML page.',
		embedWhat:
			'injects a responsive iframe with a loading shimmer and the correct aspect ratio for different screen sizes.',
		embedOptional: 'Optional:',
		copied: 'Copied',
		copy: 'Copy',
		casualtiesUnknown: 'Casualties unknown',
		killedOrWounded: 'killed/wounded',
		people: 'people',
		incidents: 'incidents',
		incidentSingular: 'incident',
		mapUnavailable: 'Map unavailable: Mapbox access token is not configured.'
	},
	fr: {
		incident: 'Incident',
		event: 'Événement',
		eventsTimeline: 'Chronologie des événements',
		untitledEvent: 'Événement sans titre',
		showSources: 'Voir les sources',
		sources: 'Sources',
		groupBy: 'Grouper par :',
		weekly: 'Semaine',
		monthly: 'Mois',
		viewDataset: 'Voir les données',
		embed: 'Intégrer',
		fullscreen: 'Plein écran',
		exit: 'Quitter',
		up: '↑ Précédent',
		down: 'Suivant ↓',
		readMore: 'Lire plus',
		close: 'Fermer',
		previous: 'Précédent',
		next: 'Suivant',
		language: 'Langue',
		embedTitle: 'Intégrer ce tableau de bord',
		embedIntro: 'Copiez-collez le code suivant dans votre CMS ou page HTML.',
		embedWhat:
			'injecte une iframe responsive avec un effet de chargement et le bon format selon la taille d’écran.',
		embedOptional: 'Optionnel :',
		copied: 'Copié',
		copy: 'Copier',
		casualtiesUnknown: 'Bilan humain inconnu',
		killedOrWounded: 'tués/blessés',
		people: 'personnes',
		incidents: 'incidents',
		incidentSingular: 'incident',
		mapUnavailable: 'Carte indisponible : le jeton Mapbox n’est pas configuré.'
	}
};

export function localized(
	incident: IncidentData,
	field: 'title' | 'description' | 'imageCaption',
	lang: HaitiLang
): string {
	const enKey = `${field}EN` as 'titleEN' | 'descriptionEN' | 'imageCaptionEN';
	const frKey = `${field}FR` as 'titleFR' | 'descriptionFR' | 'imageCaptionFR';
	const en = incident[enKey] ?? '';
	const fr = incident[frKey] ?? '';
	const primary = lang === 'fr' ? fr : en;
	const fallback = lang === 'fr' ? en : fr;
	return (primary || fallback || '').trim();
}

export function withActiveLanguage(incident: IncidentData, lang: HaitiLang): IncidentData {
	return {
		...incident,
		title: localized(incident, 'title', lang),
		description: localized(incident, 'description', lang),
		imageCaption: localized(incident, 'imageCaption', lang) || undefined
	};
}

export function explosiveDroneLabel(count: number, lang: HaitiLang): string {
	if (lang === 'fr') {
		return count === 1 ? '1 drone explosif' : `${count} drones explosifs`;
	}
	return count === 1 ? '1 explosive drone' : `${count} explosive drones`;
}

export function totalDroneLabel(count: number, lang: HaitiLang): string {
	const formattedCount = count.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB');
	if (lang === 'fr') {
		return `${formattedCount} ${count === 1 ? 'drone' : 'drones'} au total`;
	}
	return `${formattedCount} total ${count === 1 ? 'drone' : 'drones'}`;
}

export function casualtyLabel(killed: number, wounded: number, lang: HaitiLang): string {
	if (lang === 'fr') {
		const parts: string[] = [];
		if (killed > 0) parts.push(`${killed} tué${killed > 1 ? 's' : ''}`);
		if (wounded > 0) parts.push(`${wounded} blessé${wounded > 1 ? 's' : ''}`);
		return parts.join(', ');
	}
	const parts: string[] = [];
	if (killed > 0) parts.push(`${killed} killed`);
	if (wounded > 0) parts.push(`${wounded} wounded`);
	return parts.join(', ');
}
