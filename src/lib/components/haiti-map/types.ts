export type HaitiLang = 'en' | 'fr';

export interface IncidentData {
	id: number;
	type: 'incident' | 'event';
	titleEN: string;
	titleFR: string;
	descriptionEN: string;
	descriptionFR: string;
	/** Active-language title, resolved by the page from titleEN/titleFR. */
	title: string;
	/** Active-language description, resolved by the page. */
	description: string;
	latitude?: number;
	longitude?: number;
	date: string;
	killedOrWounded?: number;
	killed?: number;
	wounded?: number;
	droneCount?: number;
	explosiveDroneCount?: number;
	casualtyKnown?: boolean;
	department?: string;
	commune?: string;
	sectionCommunale?: string;
	locality?: string;
	identifiant?: string;
	chronoId: number;
	weekYear: string;
	imageUrl?: string;
	imageCaptionEN?: string;
	imageCaptionFR?: string;
	imageCaption?: string;
	videoUrl?: string;
	videoCaption?: string;
	sources?: string;
}
