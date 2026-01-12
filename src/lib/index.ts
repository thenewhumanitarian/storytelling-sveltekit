/**
 * TNH Storytelling SvelteKit - Library Exports
 *
 * This file provides barrel exports for commonly used modules.
 * Import via the `$lib` alias: import { ... } from '$lib';
 */

// Stores
export { isMobile } from './stores/device';
export {
	lightboxItems,
	currentIndex,
	registerMediaElement,
	setIndexFromSrc,
	openLightbox,
	type LightboxItem
} from './stores/lightbox';

// Storyblok utilities
export {
	initStoryblok,
	loadStory,
	loadAllStoriesExcept,
	loadStaticPage,
	useStoryblok,
	reinitStoryblok,
	lang,
	createLangStore,
	isArabic,
	isEnglish,
	createIsRtlStore,
	clientOnlyEditable,
	fetchAllStorySlugs
} from './utils/storyblok';
