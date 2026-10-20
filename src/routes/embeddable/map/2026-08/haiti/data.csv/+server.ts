import { loadHaitiData } from '$lib/server/haiti-data';
import { publicCsv } from '$lib/components/haiti-map/public-data';

export async function GET() {
	const { incidentsData } = await loadHaitiData();
	return new Response(publicCsv(incidentsData), {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="haiti-drones-display-draft.csv"',
			'Cache-Control': 'no-store'
		}
	});
}
