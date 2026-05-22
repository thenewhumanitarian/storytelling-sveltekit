import type { PageServerLoad } from './$types';
import { env as publicEnv } from '$env/dynamic/public';

export const load: PageServerLoad = async () => {
	return {
		mapboxToken: publicEnv.PUBLIC_MAPBOX_TOKEN ?? ''
	};
};
