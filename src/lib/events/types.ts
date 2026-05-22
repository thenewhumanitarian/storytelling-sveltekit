export type EventStatus = 'upcoming' | 'past';

export interface EventLocation {
	name: string;
	address: string;
	city: string;
	region?: string;
	country?: string;
}

export interface EventPartner {
	name: string;
	url?: string;
}

export interface EventSpeaker {
	id: string;
	name: string;
	role: string;
	bio?: string;
	image?: string;
	imageAlt?: string;
}

export interface EventProgrammeItem {
	id: string;
	time: string;
	title: string;
	description?: string;
}

export interface EventFilm {
	title: string;
	year: number;
	runtime: string;
	director: string;
	writer?: string;
	producers?: string;
	description: string;
	credits?: string[];
	awards?: string[];
	poster?: string;
	posterAlt?: string;
}

export type EventVizType = 'speaker' | 'programme' | 'image' | 'empty';

export interface EventStepViz {
	type: EventVizType;
	speakerId?: string;
	programmeId?: string;
	image?: string;
	imageAlt?: string;
}

export interface EventStep {
	id: string;
	eyebrow?: string;
	title?: string;
	text?: string;
	quote?: string;
	viz?: EventStepViz;
}

export interface EventChapter {
	id: string;
	number: number;
	eyebrow?: string;
	title: string;
	subtitle?: string;
	accent?: 'burgundy' | 'cream' | 'ink';
	vizSide?: 'left' | 'right';
	steps: EventStep[];
}

export interface EventMeta {
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	startDate: string;
	endDate: string;
	location: EventLocation;
	canonicalPath: string;
	wwwEventUrl: string;
	registrationUrl: string;
	/** Eventbrite numeric event ID for embedded checkout */
	eventbriteEventId?: string;
	ogImage: string;
	ogImageAlt: string;
	ogImageWidth?: number;
	ogImageHeight?: number;
	ogImageType?: string;
	keywords: string[];
	partners: EventPartner[];
	status: EventStatus;
	heroPoster: string;
	heroPosterAlt: string;
	themeColor: string;
	accentColor: string;
	backgroundColor: string;
	chair?: EventSpeaker;
}

export interface EventContent {
	intro: {
		eyebrow: string;
		title: string;
		text: string;
	};
	speakers: EventSpeaker[];
	programme: EventProgrammeItem[];
	film?: EventFilm;
	details: {
		catering?: string;
		partnershipNote?: string;
	};
	chapters: EventChapter[];
}

export interface EventModule {
	meta: EventMeta;
	content: EventContent;
}

export interface EventSummary {
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	path: string;
	startDate: string;
	status: EventStatus;
	ogImage: string;
}
