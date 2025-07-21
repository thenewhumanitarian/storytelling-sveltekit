import { parse } from 'csv-parse/sync'
import type { PageServerLoad } from './$types'
import type { IncidentData } from '$lib/components/gaza-map/types'

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
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYgKblF52DLu-hmfA1xHL94GAJrzQQLQsNTchOv4aIVL1TnFAT8WEAw4DwFox9pCqiuzJhEfn4mp9s/pub?output=csv'

export const load: PageServerLoad = async () => {
	const response = await fetch(sheetUrl)
	const csvText = await response.text()

	const records: IncidentData[] = parse(csvText, {
		columns: true,
		trim: true,
		skip_empty_lines: true,
		on_record: (record: Record<string, string>) => {
			// Accept both incidents and events
			if (record.type === 'incident') {
				const requiredFields = ['id', 'title', 'date', 'latitude', 'longitude', 'killedOrWounded']
				const hasMissingRequired = requiredFields.some((field) => {
					const value = record[field]
					if (value === undefined || value === null) return true
					if (typeof value === 'string') return value.trim() === ''
					return false
				})
				return hasMissingRequired ? undefined : record
			} else if (record.type === 'event') {
				// For events, only id, type, title, date are required
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
				case 'date':
				case 'description':
				case 'type':
				case 'imageUrl':
				case 'imageCaption':
				case 'videoUrl':
				case 'videoCaption':
				default:
					return value
			}
		}
	})

	// ✅ Sort by date ascending
	const sorted = [...records].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	)

	// ✅ Add chronoId and weekYear
	sorted.forEach((item, index) => {
		item.chronoId = index
		item.weekYear = getISOWeekYearString(new Date(item.date))
	})

	return {
		incidentsData: sorted
	}
}
