import { formStamp } from '$lib/server/climate-guard';
import { tipAction } from '$lib/server/climate-tips';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ formStamp: formStamp() });

export const actions = { tip: tipAction } satisfies Actions;
