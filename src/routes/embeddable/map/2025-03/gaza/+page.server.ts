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
	'https://docs.google.com/spreadsheets/d/1xhB61d1cry1iPZLxpN_N4G0FXd86z7b5_xNF5lh2g3o/export?format=csv&gid=0'

async function fetchAndParseData(): Promise<IncidentData[]> {
	const response = await fetch(sheetUrl)

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
	}

	const csvText = await response.text()

	const records: IncidentData[] = parse(csvText, {
		columns: true,
		trim: true,
		skip_empty_lines: true,
		on_record: (record: Record<string, string>) => {
			if (record.type === 'incident') {
				const requiredFields = ['id', 'date', 'latitude', 'longitude', 'killedOrWounded']
				const hasMissingRequired = requiredFields.some((field) => {
					const value = record[field]
					if (value === undefined || value === null) return true
					if (typeof value === 'string') return value.trim() === ''
					return false
				})
				return hasMissingRequired ? undefined : record
			} else if (record.type === 'event') {
				const requiredFields = ['id', 'type', 'title', 'date']
				const hasMissingRequired = requiredFields.some((field) => {
					const value = record[field]
					if (value === undefined || value === null) return true
					if (typeof value === 'string') return value.trim() === ''
					return false
				})
				return hasMissingRequired ? undefined : record
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

	const sorted = [...records].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	)

	sorted.forEach((item, index) => {
		item.chronoId = index
		item.weekYear = getISOWeekYearString(new Date(item.date))
	})

	return sorted
}

async function loadCachedData(): Promise<{ incidentsData: IncidentData[]; lastUpdated: string; buildTime: string; metadata?: Record<string, unknown> }> {
	try {
		const cachedData = await import('$lib/data/gaza-map/cached-incidents.json')
		return cachedData.default
	} catch {
		console.warn('Cache file not found, fetching live data...')
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
	if (dev) return false

	// Check if we're in production based on PUBLIC_BASE_URL
	const isProduction = PUBLIC_BASE_URL.includes('interactive.thenewhumanitarian.org')

	// Use cached data only in production
	return isProduction
}

export const load: PageServerLoad = async () => {
	if (shouldUseCachedData()) {
		// In production, use cached data with fallback
		console.log('📦 Using cached data for production')
		return await loadCachedData()
	} else {
		// In development/preview, try to fetch fresh data, fallback to cached
		console.log('🔄 Fetching fresh data for development/preview')
		try {
			const incidentsData = await fetchAndParseData()
			return {
				incidentsData,
				lastUpdated: new Date().toISOString(),
				buildTime: new Date().toISOString()
			}
		} catch (error) {
			console.warn('Failed to fetch fresh data, falling back to cached data:', error)
			return await loadCachedData()
		}
	}
}
