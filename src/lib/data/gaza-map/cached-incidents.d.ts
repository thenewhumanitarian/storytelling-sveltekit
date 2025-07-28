declare module '$lib/data/gaza-map/cached-incidents.json' {
  import type { IncidentData } from '../../components/gaza-map/types'
  
  interface CachedData {
    incidentsData: IncidentData[]
    lastUpdated: string
    buildTime: string
  }
  
  const data: CachedData
  export default data
} 