#!/usr/bin/env node

import { parse } from 'csv-parse/sync'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Polyfill fetch for Node.js (using built-in https module)
import https from 'https'
import http from 'http'

function fetch(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        // Handle redirects manually
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          const location = res.headers.location
          if (location) {
            console.log(`🔄 Following redirect to: ${location}`)
            // Recursively follow the redirect
            fetch(location).then(resolve).catch(reject)
            return
          }
        }
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({
            ok: true,
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data)
          })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration for different data sources
const DATA_SOURCES = {
  gaza: {
    name: 'Gaza Map Incidents',
    url: 'https://docs.google.com/spreadsheets/d/1xhB61d1cry1iPZLxpN_N4G0FXd86z7b5_xNF5lh2g3o/export?format=csv&gid=0',
    fallbackPath: 'src/lib/data/gaza-map/20250721-sample-data-gaza.csv',
    outputPath: 'src/lib/data/gaza-map/cached-incidents.json',
    processor: processGazaData
  }
  // Add more data sources here as needed:
  // example: {
  //   name: 'Example Data',
  //   url: 'https://api.example.com/data',
  //   fallbackPath: 'src/lib/data/example/fallback-data.csv',
  //   outputPath: 'src/lib/data/example/cached-data.json',
  //   processor: processExampleData
  // }
}

// Helper function to calculate ISO week number + year
function getISOWeekYearString(date) {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const weekNumber = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
  )
  return `${String(weekNumber).padStart(2, '0')}-${target.getFullYear()}`
}

// Gaza data processor
async function processGazaData(csvText) {
  console.log('📊 Processing Gaza incidents and events data...')
  
  // Check if we got HTML instead of CSV
  if (csvText.includes('<HTML>') || csvText.includes('<html>')) {
    throw new Error('Received HTML instead of CSV. The Google Sheet may not be properly published or the URL is incorrect.')
  }
  
  const records = parse(csvText, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
    on_record: (record) => {
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
      switch (context.column) {
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
        case 'sources':
        default:
          return value
      }
    }
  })

  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  sorted.forEach((item, index) => {
    item.chronoId = index
    item.weekYear = getISOWeekYearString(new Date(item.date))
  })

  return {
    incidentsData: sorted,
    lastUpdated: new Date().toISOString(),
    buildTime: new Date().toISOString(),
    metadata: {
      totalRecords: sorted.length,
      incidents: sorted.filter(r => r.type === 'incident').length,
      events: sorted.filter(r => r.type === 'event').length,
      dateRange: {
        start: sorted[0]?.date,
        end: sorted[sorted.length - 1]?.date
      }
    }
  }
}

// Generic data fetcher with fallback support
async function fetchData(url, sourceName, fallbackPath = null) {
  console.log(`🔄 Fetching ${sourceName} from ${url}...`)
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.text()
    console.log(`✅ Successfully fetched ${sourceName} (${data.length} characters)`)
    
    // Debug: Show first 200 characters to help diagnose issues
    console.log(`🔍 First 200 characters: ${data.substring(0, 200)}...`)
    
    return data
  } catch (error) {
    console.error(`❌ Failed to fetch ${sourceName}:`, error.message)
    
    // Try fallback if available
    if (fallbackPath) {
      console.log(`🔄 Trying fallback file: ${fallbackPath}`)
      try {
        const fallbackData = await fs.readFile(fallbackPath, 'utf-8')
        console.log(`✅ Successfully loaded fallback data for ${sourceName} (${fallbackData.length} characters)`)
        console.log(`⚠️  Using fallback data - this may be outdated`)
        return fallbackData
      } catch (fallbackError) {
        console.error(`❌ Fallback file also failed:`, fallbackError.message)
        throw new Error(`Both remote and fallback data sources failed: ${error.message}`)
      }
    }
    
    throw error
  }
}

// Save data to file
async function saveData(data, outputPath, sourceName) {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath)
    await fs.mkdir(dir, { recursive: true })
    
    // Write the data
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2))
    
    console.log(`💾 Saved ${sourceName} to ${outputPath}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to save ${sourceName}:`, error.message)
    throw error
  }
}

// Process a single data source
async function processDataSource(sourceKey, sourceConfig) {
  const startTime = Date.now()
  
  try {
    console.log(`\n🚀 Processing ${sourceConfig.name}...`)
    
    // Fetch the data (with fallback support)
    const rawData = await fetchData(sourceConfig.url, sourceConfig.name, sourceConfig.fallbackPath)
    
    // Process the data
    const processedData = await sourceConfig.processor(rawData)
    
    // Save the processed data
    await saveData(processedData, sourceConfig.outputPath, sourceConfig.name)
    
    const duration = Date.now() - startTime
    console.log(`✅ ${sourceConfig.name} completed in ${duration}ms`)
    
    return {
      success: true,
      source: sourceKey,
      duration,
      recordCount: processedData.metadata?.totalRecords || 0
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ ${sourceConfig.name} failed after ${duration}ms:`, error.message)
    
    return {
      success: false,
      source: sourceKey,
      duration,
      error: error.message
    }
  }
}

// Main function to process all data sources
async function preFetchAllData() {
  const startTime = Date.now()
  console.log('🏗️  Starting build-time data fetching...')
  console.log(`📅 Build time: ${new Date().toISOString()}`)
  
  const results = []
  const sourceKeys = Object.keys(DATA_SOURCES)
  
  for (const sourceKey of sourceKeys) {
    const sourceConfig = DATA_SOURCES[sourceKey]
    const result = await processDataSource(sourceKey, sourceConfig)
    results.push(result)
  }
  
  const totalDuration = Date.now() - startTime
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log('\n📊 Build-time data fetching summary:')
  console.log(`⏱️  Total duration: ${totalDuration}ms`)
  console.log(`✅ Successful: ${successful.length}/${sourceKeys.length}`)
  console.log(`❌ Failed: ${failed.length}/${sourceKeys.length}`)
  
  if (successful.length > 0) {
    console.log('\n✅ Successful sources:')
    successful.forEach(result => {
      console.log(`  • ${DATA_SOURCES[result.source].name}: ${result.recordCount} records (${result.duration}ms)`)
    })
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed sources:')
    failed.forEach(result => {
      console.log(`  • ${DATA_SOURCES[result.source].name}: ${result.error}`)
    })
  }
  
  // Don't exit with error code if any source failed - just warn
  // This allows the build to continue with partial data
  if (failed.length > 0) {
    console.log('\n⚠️  Some data sources failed. Build may continue with partial data.')
    // Don't exit with error code - let the build continue
    return false
  }
  
  console.log('\n🎉 All data sources processed successfully!')
  return true
}

// Handle command line arguments
function parseArguments() {
  const args = process.argv.slice(2)
  const sources = args.filter(arg => !arg.startsWith('--'))
  const options = args.filter(arg => arg.startsWith('--'))
  
  return { sources, options }
}

// Main execution
async function main() {
  try {
    const { sources, options } = parseArguments()
    
    // If specific sources are requested, filter them
    if (sources.length > 0) {
      const requestedSources = {}
      for (const source of sources) {
        if (DATA_SOURCES[source]) {
          requestedSources[source] = DATA_SOURCES[source]
        } else {
          console.warn(`⚠️  Unknown data source: ${source}`)
        }
      }
      
      if (Object.keys(requestedSources).length === 0) {
        console.error('❌ No valid data sources specified')
        process.exit(1)
      }
      
      // Temporarily replace DATA_SOURCES with filtered version
      const originalSources = DATA_SOURCES
      Object.assign(DATA_SOURCES, requestedSources)
      
      const success = await preFetchAllData()
      
      // Restore original sources
      Object.assign(DATA_SOURCES, originalSources)
      
      // Only exit with error if no sources succeeded
      if (!success) {
        process.exit(1)
      }
    } else {
      // Process all sources
      const success = await preFetchAllData()
      
      // Only exit with error if no sources succeeded
      if (!success) {
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('💥 Fatal error during data fetching:', error)
    process.exit(1)
  }
}

// Export for potential programmatic use
export { preFetchAllData, processDataSource, DATA_SOURCES }

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
} 