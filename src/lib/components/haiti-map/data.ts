import type { IncidentData } from './types';

export function summariseIncidents(
	records: readonly Pick<IncidentData, 'type' | 'droneCount' | 'latitude' | 'longitude' | 'date'>[]
) {
	const incidents = records.filter((record) => record.type === 'incident');
	return {
		incidentCount: incidents.length,
		knownDrones: incidents.reduce((total, record) => total + (record.droneCount ?? 0), 0),
		unknownCount: incidents.filter((record) => record.droneCount == null).length,
		unlocatedCount: incidents.filter(
			(record) => record.latitude == null || record.longitude == null
		).length,
		undatedCount: incidents.filter((record) => !record.date).length
	};
}
