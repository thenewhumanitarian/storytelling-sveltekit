import { formStamp } from '$lib/server/climate-guard';
import { tipAction } from '$lib/server/climate-tips';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	// The backdrop photo this visit gets, chosen here so the server render and its image
	// preload agree with the hydrated page.
	photoSeed: Math.random(),
	formStamp: formStamp()
});

export const actions = { tip: tipAction } satisfies Actions;
