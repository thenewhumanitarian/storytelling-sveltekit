import { parse } from 'csv-parse/sync';
import type { PageServerLoad } from './$types';
import type { IncidentData } from '$lib/components/haiti-map/types';
import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { PUBLIC_BASE_URL } from '$env/static/public';

// Helper to calculate ISO week number + year
function getISOWeekYearString(date: Date): string {
	const target = new Date(date.valueOf());
	const dayNr = (date.getDay() + 6) % 7;
	target.setDate(target.getDate() - dayNr + 3);
	const firstThursday = new Date(target.getFullYear(), 0, 4);
	const weekNumber =
		1 +
		Math.round(
			((target.getTime() - firstThursday.getTime()) / 86400000 -
				3 +
				((firstThursday.getDay() + 6) % 7)) /
				7
		);
	return `${String(weekNumber).padStart(2, '0')}-${target.getFullYear()}`;
}

// Preview and local development read the published sheet so editorial changes are
// visible without a rebuild. Production uses the build-time cached export below.
const PUBLISHED_SHEET_URL =
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7SHGjPbXZaoyndaUg_Zax9Q2q3rTzYikzDXk8pc7GMkDhu1UsUOwk150_xMxpudr3A2vHjVndc9-x/pub?gid=0&single=true&output=csv';

// Helper to get fallback CSV path (using dynamic import to avoid build issues)
async function getFallbackCsvPath(): Promise<string> {
	const { join } = await import('path');
	return join(process.cwd(), 'src/lib/data/haiti-map/haiti-incidents-fallback.csv');
}

// Helper to read CSV file (using dynamic import to avoid build issues)
async function readFallbackCsv(): Promise<string> {
	const { readFileSync } = await import('fs');
	const path = await getFallbackCsvPath();
	return readFileSync(path, 'utf-8');
}

// Debug function to test sheet accessibility
async function debugSheetAccess() {
	console.log('🔍 Testing sheet accessibility...');
	try {
		const response = await fetch(PUBLISHED_SHEET_URL, { method: 'HEAD' });
		console.log('📡 HEAD request result:', {
			status: response.status,
			statusText: response.statusText,
			contentType: response.headers.get('content-type'),
			contentLength: response.headers.get('content-length')
		});
	} catch (error) {
		console.error('❌ HEAD request failed:', error);
	}
}

async function fetchAndParseData(): Promise<IncidentData[]> {
	console.log('🔍 Starting data fetch from:', PUBLISHED_SHEET_URL);

	let csvText: string;

	try {
		const response = await fetch(PUBLISHED_SHEET_URL);
		console.log('📡 Fetch response status:', response.status, response.statusText);
		console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
		}

		csvText = await response.text();

		// Check if we got HTML instead of CSV (redirect or error page)
		if (csvText.trim().startsWith('<HTML>') || csvText.trim().startsWith('<!DOCTYPE')) {
			throw new Error('Received HTML instead of CSV - likely a redirect or error page');
		}
	} catch (fetchError) {
		console.error('❌ Fetch failed, trying fallback CSV file:', fetchError);
		try {
			const fallbackPath = await getFallbackCsvPath();
			console.log('📦 Attempting to load fallback CSV from:', fallbackPath);
			csvText = await readFallbackCsv();
			console.log('✅ Successfully loaded fallback CSV file');
		} catch (fileError) {
			console.error('❌ Fallback CSV file also failed:', fileError);
			throw new Error(
				`Both remote fetch and fallback file failed. Fetch error: ${fetchError}, File error: ${fileError}`,
				{ cause: fileError }
			);
		}
	}
	console.log('📄 CSV text length:', csvText.length);
	console.log('📄 First 500 characters of CSV:', csvText.substring(0, 500));
	console.log(
		'📄 Last 200 characters of CSV:',
		csvText.substring(Math.max(0, csvText.length - 200))
	);

	// Check for potential CSV parsing issues
	const lines = csvText.split('\n');
	console.log('📄 CSV line count:', lines.length);
	console.log('📄 First line (headers):', lines[0]);
	console.log('📄 Second line (first data):', lines[1]);
	console.log('📄 Last line:', lines[lines.length - 1]);

	// Parse headers to understand column structure
	const headerLine = lines[0];
	const headers = headerLine.split(',');
	console.log('📄 Parsed headers:', headers);
	console.log('📄 Header count:', headers.length);

	let records: IncidentData[];
	try {
		records = parse(csvText, {
			columns: true,
			trim: true,
			skip_empty_lines: true,
			// Skip empty columns to handle the extra empty columns in the sheet
			skip_records_with_error: true,
			on_record: (record: Record<string, string>, context) => {
				// Debug first few records to understand structure
				if (context.lines < 5) {
					console.log(`📝 Record ${context.lines}:`, record);
					console.log(`📝 Available columns:`, Object.keys(record));
				}

				// Auto-detect type if missing - assume 'incident' if not specified
				if (!record.type || record.type.trim() === '') {
					if (record.latitude && record.longitude) {
						record.type = 'incident';
						console.log(`🔧 Auto-detected type 'incident' for record ${context.lines}`);
					} else if ((record.titleEN || record.title) && record.date) {
						record.type = 'event';
						console.log(`🔧 Auto-detected type 'event' for record ${context.lines}`);
					}
				}

				if (record.type === 'incident') {
					// More lenient required fields - only id and date are truly required
					const criticalFields = ['id', 'date'];
					const hasMissingCritical = criticalFields.some((field) => {
						const value = record[field];
						if (value === undefined || value === null) return true;
						if (typeof value === 'string') return value.trim() === '';
						return false;
					});

					if (hasMissingCritical) {
						if (context.lines < 10) {
							console.log(`⚠️ Incident record ${context.lines} missing critical fields:`, {
								record,
								missingFields: criticalFields.filter((field) => {
									const value = record[field];
									return (
										value === undefined ||
										value === null ||
										(typeof value === 'string' && value.trim() === '')
									);
								})
							});
						}
						return undefined;
					}

					// Log warnings for missing optional fields but still process the record
					const optionalFields = ['latitude', 'longitude', 'killedOrWounded'];
					const missingOptional = optionalFields.filter((field) => {
						const value = record[field];
						return (
							value === undefined ||
							value === null ||
							(typeof value === 'string' && value.trim() === '')
						);
					});

					if (missingOptional.length > 0 && context.lines < 20) {
						console.log(
							`⚠️ Incident record ${context.lines} missing optional fields (will still process):`,
							{
								id: record.id,
								date: record.date,
								missingOptional
							}
						);
					}

					return record;
				} else if (record.type === 'event') {
					const requiredFields = ['id', 'date'];
					const hasMissingRequired = requiredFields.some((field) => {
						const value = record[field];
						if (value === undefined || value === null) return true;
						if (typeof value === 'string') return value.trim() === '';
						return false;
					});

					if (hasMissingRequired) {
						if (context.lines < 10) {
							console.log(`⚠️ Event record ${context.lines} missing required fields:`, {
								record,
								missingFields: requiredFields.filter((field) => {
									const value = record[field];
									return (
										value === undefined ||
										value === null ||
										(typeof value === 'string' && value.trim() === '')
									);
								})
							});
						}
						return undefined;
					}

					return record;
				}

				if (context.lines < 10) {
					console.log(
						`⚠️ Unknown record type ${context.lines}:`,
						record.type,
						'for record:',
						record
					);
				}
				return undefined;
			},
			cast: (value, context) => {
				switch (context.column as string) {
					case 'id':
					case 'killedOrWounded':
					case 'killed':
					case 'wounded':
					case 'droneCount':
						return value === '' ? undefined : parseInt(value, 10);
					case 'latitude':
					case 'longitude':
						return value === '' ? undefined : parseFloat(value);
					case 'casualtyKnown':
						return ['TRUE', 'true', '1', 'Connu', 'connu'].includes(value);
					case 'titleEN':
					case 'titleFR':
					case 'title':
						return value === '' ? 'Untitled' : value;
					default:
						return value;
				}
			}
		});
	} catch (parseError) {
		console.error('❌ CSV parsing failed:', parseError);
		console.error('❌ CSV content that failed to parse:', csvText.substring(0, 1000));
		throw new Error(`CSV parsing failed: ${parseError}`, { cause: parseError });
	}

	console.log('📊 Total records parsed:', records.length);
	console.log('📊 First 3 parsed records:', records.slice(0, 3));
	console.log('📊 Record types breakdown:', {
		incidents: records.filter((r) => r.type === 'incident').length,
		events: records.filter((r) => r.type === 'event').length,
		other: records.filter((r) => r.type !== 'incident' && r.type !== 'event').length
	});

	const haitiRecords = records.filter((r) => typeof r.latitude !== 'number' || r.latitude < 25);
	if (haitiRecords.length === 0 || haitiRecords.length < records.length / 2) {
		console.warn('⚠️ Remote sheet still looks like the Gaza template — loading Haiti fallback CSV');
		csvText = await readFallbackCsv();
		records = parse(csvText, {
			columns: true,
			trim: true,
			skip_empty_lines: true,
			cast: (value, context) => {
				switch (context.column as string) {
					case 'id':
					case 'killedOrWounded':
					case 'killed':
					case 'wounded':
					case 'droneCount':
						return value === '' ? undefined : parseInt(value, 10);
					case 'latitude':
					case 'longitude':
						return value === '' ? undefined : parseFloat(value);
					case 'casualtyKnown':
						return ['TRUE', 'true', '1', 'Connu', 'connu'].includes(String(value));
					default:
						return value;
				}
			}
		});
	}

	const usableRecords = records.filter((r) => typeof r.latitude !== 'number' || r.latitude < 25);

	const normalized = usableRecords.map((record) => ({
		...record,
		title: record.titleEN || record.title || 'Untitled',
		description: record.descriptionEN || record.description || '',
		imageCaption: record.imageCaptionEN || record.imageCaption,
		droneCount: record.droneCount ?? 0,
		killed: record.killed ?? 0,
		wounded: record.wounded ?? 0
	}));

	const sorted = [...normalized].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	console.log('📅 Date range:', {
		earliest: sorted[0]?.date,
		latest: sorted[sorted.length - 1]?.date
	});

	sorted.forEach((item, index) => {
		item.chronoId = index;
		item.weekYear = getISOWeekYearString(new Date(item.date));
	});

	console.log('✅ Data processing complete. Returning', sorted.length, 'records');
	return sorted;
}

async function loadCachedData(): Promise<{
	incidentsData: IncidentData[];
	lastUpdated: string;
	buildTime: string;
	metadata?: Record<string, unknown>;
}> {
	try {
		console.log('📦 Attempting to load cached data...');
		const cachedData = await import('$lib/data/haiti-map/cached-incidents.json');
		console.log('📦 Cached data loaded successfully:', {
			recordCount: cachedData.default.incidentsData?.length || 0,
			lastUpdated: cachedData.default.lastUpdated,
			buildTime: cachedData.default.buildTime
		});
		return cachedData.default;
	} catch (error) {
		console.warn('⚠️ Cache file not found:', error);
		throw error;
	}
}

// Production caches are refreshed by the build, so runtime validity is about
// having usable data rather than the age of the deployed artefact.
function hasUsableCachedData(cachedData: {
	incidentsData: IncidentData[];
	lastUpdated: string;
	buildTime: string;
}): boolean {
	if (!cachedData.incidentsData || cachedData.incidentsData.length === 0) {
		console.warn('⚠️ Cached data is empty');
		return false;
	}

	return true;
}

// Determine if we should use cached data based on environment
function shouldUseCachedData(): boolean {
	// Always fetch fresh data in development
	if (dev) {
		console.log('🔧 Development mode detected - will fetch fresh data');
		return false;
	}

	// Vercel exposes this at build and runtime. It keeps preview deployments on
	// the live editorial sheet even when they share the production base URL.
	const vercelEnvironment = privateEnv.VERCEL_ENV;
	const isProduction = vercelEnvironment
		? vercelEnvironment === 'production'
		: PUBLIC_BASE_URL.includes('interactive.thenewhumanitarian.org');
	console.log('🌐 Environment check:', {
		vercelEnvironment: vercelEnvironment || 'not-vercel',
		PUBLIC_BASE_URL,
		isProduction,
		willUseCached: isProduction
	});

	// Use cached data only in production
	return isProduction;
}

export const load: PageServerLoad = async () => {
	console.log('🚀 Starting page load function');

	// Read at request time so Vercel runtime env vars work even when missing at build time.
	const mapboxToken = publicEnv.PUBLIC_MAPBOX_TOKEN ?? '';

	const useCachedData = shouldUseCachedData();

	// Normal production requests stay independent of Google Sheets. Preview and
	// local development verify and read the published CSV on every request.
	if (!useCachedData) {
		await debugSheetAccess();
	}

	if (useCachedData) {
		// In production, use cached data (pre-loaded during build)
		console.log('📦 Using cached data for production');
		try {
			const cachedResult = await loadCachedData();

			// Confirm the build-time export contains usable data.
			if (hasUsableCachedData(cachedResult)) {
				console.log('✅ Using valid cached data:', {
					recordCount: cachedResult.incidentsData?.length || 0,
					lastUpdated: cachedResult.lastUpdated
				});
				return { ...cachedResult, mapboxToken };
			} else {
				// An empty cache is a build failure; keep the map available as a fallback.
				console.warn('⚠️ Cached data is invalid, fetching fresh data...');
				const incidentsData = await fetchAndParseData();
				const result = {
					incidentsData,
					lastUpdated: new Date().toISOString(),
					buildTime: new Date().toISOString()
				};
				console.log('✅ Fresh data fetch successful:', {
					recordCount: result.incidentsData?.length || 0,
					lastUpdated: result.lastUpdated
				});
				return { ...result, mapboxToken };
			}
		} catch (error) {
			// Cache file not found or invalid, fetch fresh data
			console.error('❌ Failed to load cached data, fetching fresh data:', error);
			const incidentsData = await fetchAndParseData();
			const result = {
				incidentsData,
				lastUpdated: new Date().toISOString(),
				buildTime: new Date().toISOString()
			};
			console.log('✅ Fresh data fetch successful:', {
				recordCount: result.incidentsData?.length || 0,
				lastUpdated: result.lastUpdated
			});
			return { ...result, mapboxToken };
		}
	} else {
		// In development/preview, always fetch fresh data
		console.log('🔄 Fetching fresh data for development/preview');
		try {
			const incidentsData = await fetchAndParseData();
			const result = {
				incidentsData,
				lastUpdated: new Date().toISOString(),
				buildTime: new Date().toISOString()
			};
			console.log('✅ Fresh data fetch successful:', {
				recordCount: result.incidentsData?.length || 0,
				lastUpdated: result.lastUpdated
			});
			return { ...result, mapboxToken };
		} catch (error) {
			console.error('❌ Failed to fetch fresh data, falling back to cached data:', error);
			const fallbackResult = await loadCachedData();
			console.log('🔄 Fallback to cached data result:', {
				recordCount: fallbackResult.incidentsData?.length || 0,
				lastUpdated: fallbackResult.lastUpdated
			});
			return { ...fallbackResult, mapboxToken };
		}
	}
};
