import { parse } from 'csv-parse/sync'
import type { PageServerLoad } from './$types'
import type { IncidentData } from '$lib/components/gaza-map/types'
import { dev } from '$app/environment'
import { PUBLIC_BASE_URL } from '$env/static/public'

// Helper to calculate ISO week number + year
function getISOWeekYearString(date: Date): string {
	const target = new Date(date.valueOf())
	const dayNr = (date.getDay() + 6) % 7
	target.setDate(target.getDate() - dayNr + 3)
	const firstThursday = new Date(target.getFullYear(), 0, 4)
	const weekNumber =
		1 +
		Math.round(
			((target.getTime() - firstThursday.getTime()) / 86400000 -
				3 +
				((firstThursday.getDay() + 6) % 7)) /
			7
		)
	return `${String(weekNumber).padStart(2, '0')}-${target.getFullYear()}`
}

const sheetUrl =
	// 'https://docs.google.com/spreadsheets/d/1XHLFPW_9km6STO6rRYe_MqguEJJWSIa5febc8MIiWA0/export?format=csv&gid=0'
	'https://docs.google.com/spreadsheets/d/1xhB61d1cry1iPZLxpN_N4G0FXd86z7b5_xNF5lh2g3o/export?format=csv&gid=0'

// Debug function to test sheet accessibility
async function debugSheetAccess() {
	console.log('🔍 Testing sheet accessibility...')
	try {
		const response = await fetch(sheetUrl, { method: 'HEAD' })
		console.log('📡 HEAD request result:', {
			status: response.status,
			statusText: response.statusText,
			contentType: response.headers.get('content-type'),
			contentLength: response.headers.get('content-length')
		})
	} catch (error) {
		console.error('❌ HEAD request failed:', error)
	}
}

async function fetchAndParseData(): Promise<IncidentData[]> {
	console.log('🔍 Starting data fetch from:', sheetUrl)
	
	const response = await fetch(sheetUrl)
	console.log('📡 Fetch response status:', response.status, response.statusText)
	console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

	if (!response.ok) {
		console.error('❌ Fetch failed:', response.status, response.statusText)
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
	}

	const csvText = await response.text()
	console.log('📄 CSV text length:', csvText.length)
	console.log('📄 First 500 characters of CSV:', csvText.substring(0, 500))
	console.log('📄 Last 200 characters of CSV:', csvText.substring(Math.max(0, csvText.length - 200)))
	
	// Check for potential CSV parsing issues
	const lines = csvText.split('\n')
	console.log('📄 CSV line count:', lines.length)
	console.log('📄 First line (headers):', lines[0])
	console.log('📄 Second line (first data):', lines[1])
	console.log('📄 Last line:', lines[lines.length - 1])
	
	// Parse headers to understand column structure
	const headerLine = lines[0]
	const headers = headerLine.split(',')
	console.log('📄 Parsed headers:', headers)
	console.log('📄 Header count:', headers.length)

	let records: IncidentData[]
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
				console.log(`📝 Record ${context.lines}:`, record)
				console.log(`📝 Available columns:`, Object.keys(record))
			}
			
			// Auto-detect type if missing - assume 'incident' if not specified
			if (!record.type || record.type.trim() === '') {
				// If we have latitude/longitude, it's likely an incident
				if (record.latitude && record.longitude) {
					record.type = 'incident'
					console.log(`🔧 Auto-detected type 'incident' for record ${context.lines}`)
				} else if (record.title && record.date) {
					record.type = 'event'
					console.log(`🔧 Auto-detected type 'event' for record ${context.lines}`)
				}
			}
			
			if (record.type === 'incident') {
				// More lenient required fields - only id and date are truly required
				const criticalFields = ['id', 'date']
				const hasMissingCritical = criticalFields.some((field) => {
					const value = record[field]
					if (value === undefined || value === null) return true
					if (typeof value === 'string') return value.trim() === ''
					return false
				})
				
				if (hasMissingCritical) {
					if (context.lines < 10) {
						console.log(`⚠️ Incident record ${context.lines} missing critical fields:`, {
							record,
							missingFields: criticalFields.filter(field => {
								const value = record[field]
								return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
							})
						})
					}
					return undefined
				}
				
				// Log warnings for missing optional fields but still process the record
				const optionalFields = ['latitude', 'longitude', 'killedOrWounded']
				const missingOptional = optionalFields.filter(field => {
					const value = record[field]
					return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
				})
				
				if (missingOptional.length > 0 && context.lines < 20) {
					console.log(`⚠️ Incident record ${context.lines} missing optional fields (will still process):`, {
						id: record.id,
						date: record.date,
						missingOptional
					})
				}
				
				return record
			} else if (record.type === 'event') {
				const requiredFields = ['id', 'date']
				const hasMissingRequired = requiredFields.some((field) => {
					const value = record[field]
					if (value === undefined || value === null) return true
					if (typeof value === 'string') return value.trim() === ''
					return false
				})
				
				if (hasMissingRequired) {
					if (context.lines < 10) {
						console.log(`⚠️ Event record ${context.lines} missing required fields:`, {
							record,
							missingFields: requiredFields.filter(field => {
								const value = record[field]
								return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
							})
						})
					}
					return undefined
				}
				
				return record
			}
			
			if (context.lines < 10) {
				console.log(`⚠️ Unknown record type ${context.lines}:`, record.type, 'for record:', record)
			}
			return undefined
		},
		cast: (value, context) => {
			switch (context.column as keyof IncidentData) {
				case 'id':
					return parseInt(value)
				case 'killedOrWounded':
					return value === '' ? undefined : parseInt(value)
				case 'latitude':
				case 'longitude':
					return value === '' ? undefined : parseFloat(value)
				case 'title':
					// Provide fallback for empty titles
					return value === '' ? 'Untitled' : value
				case 'date':
				case 'description':
				case 'type':
				case 'imageUrl':
				case 'imageCaption':
				case 'videoUrl':
				case 'videoCaption':
				case 'sources':
				default:
					return value
			}
		}
	})
	} catch (parseError) {
		console.error('❌ CSV parsing failed:', parseError)
		console.error('❌ CSV content that failed to parse:', csvText.substring(0, 1000))
		throw new Error(`CSV parsing failed: ${parseError}`)
	}

	console.log('📊 Total records parsed:', records.length)
	console.log('📊 First 3 parsed records:', records.slice(0, 3))
	console.log('📊 Record types breakdown:', {
		incidents: records.filter(r => r.type === 'incident').length,
		events: records.filter(r => r.type === 'event').length,
		other: records.filter(r => r.type !== 'incident' && r.type !== 'event').length
	})

	const sorted = [...records].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	)

	console.log('📅 Date range:', {
		earliest: sorted[0]?.date,
		latest: sorted[sorted.length - 1]?.date
	})

	sorted.forEach((item, index) => {
		item.chronoId = index
		item.weekYear = getISOWeekYearString(new Date(item.date))
	})

	console.log('✅ Data processing complete. Returning', sorted.length, 'records')
	return sorted
}

async function loadCachedData(): Promise<{ incidentsData: IncidentData[]; lastUpdated: string; buildTime: string; metadata?: Record<string, unknown> }> {
	try {
		console.log('📦 Attempting to load cached data...')
		const cachedData = await import('$lib/data/gaza-map/cached-incidents.json')
		console.log('📦 Cached data loaded successfully:', {
			recordCount: cachedData.default.incidentsData?.length || 0,
			lastUpdated: cachedData.default.lastUpdated,
			buildTime: cachedData.default.buildTime
		})
		return cachedData.default
	} catch (error) {
		console.warn('⚠️ Cache file not found, fetching live data...', error)
		const incidentsData = await fetchAndParseData()
		return {
			incidentsData,
			lastUpdated: new Date().toISOString(),
			buildTime: new Date().toISOString()
		}
	}
}

// Determine if we should use cached data based on environment
function shouldUseCachedData(): boolean {
	// Always fetch fresh data in development
	if (dev) {
		console.log('🔧 Development mode detected - will fetch fresh data')
		return false
	}

	// Check if we're in production based on PUBLIC_BASE_URL
	const isProduction = PUBLIC_BASE_URL.includes('interactive.thenewhumanitarian.org')
	console.log('🌐 Environment check:', {
		PUBLIC_BASE_URL,
		isProduction,
		willUseCached: isProduction
	})

	// Use cached data only in production
	return isProduction
}

export const load: PageServerLoad = async () => {
	console.log('🚀 Starting page load function')
	
	// Run sheet accessibility test
	await debugSheetAccess()
	
	if (shouldUseCachedData()) {
		// In production, use cached data with fallback
		console.log('📦 Using cached data for production')
		const result = await loadCachedData()
		console.log('📦 Cached data result:', {
			recordCount: result.incidentsData?.length || 0,
			lastUpdated: result.lastUpdated
		})
		return result
	} else {
		// In development/preview, try to fetch fresh data, fallback to cached
		console.log('🔄 Fetching fresh data for development/preview')
		try {
			const incidentsData = await fetchAndParseData()
			const result = {
				incidentsData,
				lastUpdated: new Date().toISOString(),
				buildTime: new Date().toISOString()
			}
			console.log('✅ Fresh data fetch successful:', {
				recordCount: result.incidentsData?.length || 0,
				lastUpdated: result.lastUpdated
			})
			return result
		} catch (error) {
			console.error('❌ Failed to fetch fresh data, falling back to cached data:', error)
			const fallbackResult = await loadCachedData()
			console.log('🔄 Fallback to cached data result:', {
				recordCount: fallbackResult.incidentsData?.length || 0,
				lastUpdated: fallbackResult.lastUpdated
			})
			return fallbackResult
		}
	}
}
