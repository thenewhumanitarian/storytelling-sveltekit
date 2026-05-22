import { expandUrlManifest, PROD_BASE } from '$lib/utils/urlManifest';

export const load = ({ url }) => {
	const localBase = `${url.protocol}//${url.host}`;
	const entries = expandUrlManifest();

	return {
		localBase,
		prodBase: PROD_BASE,
		entries,
		total: entries.length
	};
};
