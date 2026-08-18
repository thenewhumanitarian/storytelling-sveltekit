declare module '$lib/data/haiti-map/cached-incidents.json' {
	import type { IncidentData } from '../../components/haiti-map/types';

	interface CachedData {
		incidentsData: IncidentData[];
		lastUpdated: string;
		buildTime: string;
	}

	const data: CachedData;
	export default data;
}
