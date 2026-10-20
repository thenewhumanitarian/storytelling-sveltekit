export type HaitiLang = 'en' | 'fr';

export interface IncidentData {
	schemaVersion: string;
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
	droneCount: number | null;
	explosiveDroneCount?: number | null;
	department?: string;
	commune?: string;
	sectionCommunale?: string;
	locality?: string;
	dateStatus: 'recorded' | 'pending';
	locationStatus: 'locality' | 'pending';
	languageStatus: 'editorial-draft';
	reviewStatus: 'provisional';
	chronoId: number;
	weekYear: string;
	imageUrl?: string;
	imageCaptionEN?: string;
	imageCaptionFR?: string;
	imageCaption?: string;
	videoUrl?: string;
	videoCaption?: string;
}
