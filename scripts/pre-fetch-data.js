#!/usr/bin/env node

/**
 * Main data fetching orchestrator
 * 
 * This script coordinates multiple project-specific data fetch scripts.
 * Each project has its own fetch script (e.g., pre-fetch-gaza-data.js)
 * that can be run independently or through this orchestrator.
 * 
 * To add a new project:
 * 1. Create a script: scripts/pre-fetch-[project-name]-data.js
 * 2. Export a function: export async function fetch[ProjectName]Data()
 * 3. Import and add it to the PROJECTS array below
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration: List of projects to fetch data for
const PROJECTS = [
  {
    name: 'Gaza Map',
    script: './pre-fetch-gaza-data.js',
    fetchFunction: 'fetchGazaData'
  }
  // Add more projects here:
  // {
  //   name: 'Project Name',
  //   script: './pre-fetch-project-name-data.js',
  //   fetchFunction: 'fetchProjectNameData'
  // }
]

/**
 * Fetch data for a single project
 */
async function fetchProjectData(project) {
  const startTime = Date.now()
  
  try {
    console.log(`\n🚀 Starting ${project.name} data fetch...`)
    
    // Dynamically import the project's fetch script
    const projectModule = await import(join(__dirname, project.script))
    
    // Get the fetch function
    const fetchFunction = projectModule[project.fetchFunction]
    
    if (!fetchFunction || typeof fetchFunction !== 'function') {
      throw new Error(`Fetch function "${project.fetchFunction}" not found in ${project.script}`)
    }
    
    // Execute the fetch function
    const success = await fetchFunction()
    
    const duration = Date.now() - startTime
    
    if (success) {
      console.log(`✅ ${project.name} completed successfully in ${duration}ms`)
      return {
        success: true,
        project: project.name,
        duration
      }
    } else {
      console.error(`❌ ${project.name} completed with errors in ${duration}ms`)
      return {
        success: false,
        project: project.name,
        duration,
        error: 'Fetch function returned false'
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ ${project.name} failed after ${duration}ms:`, error.message)
    
    return {
      success: false,
      project: project.name,
      duration,
      error: error.message
    }
  }
}

/**
 * Main orchestrator function
 * Fetches data for all projects in parallel using Promise.all
 */
async function fetchAllProjects() {
  const overallStartTime = Date.now()
  
  console.log('🏗️  Starting data fetching orchestrator...')
  console.log(`📅 Build time: ${new Date().toISOString()}`)
  console.log(`📦 Projects to fetch: ${PROJECTS.length}`)
  console.log(`📋 Projects: ${PROJECTS.map(p => p.name).join(', ')}`)
  
  // Fetch all projects in parallel
  const results = await Promise.all(
    PROJECTS.map(project => fetchProjectData(project))
  )
  
  const totalDuration = Date.now() - overallStartTime
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Data Fetching Summary')
  console.log('='.repeat(60))
  console.log(`⏱️  Total duration: ${totalDuration}ms`)
  console.log(`✅ Successful: ${successful.length}/${PROJECTS.length}`)
  console.log(`❌ Failed: ${failed.length}/${PROJECTS.length}`)
  
  if (successful.length > 0) {
    console.log('\n✅ Successful projects:')
    successful.forEach(result => {
      console.log(`  • ${result.project}: ${result.duration}ms`)
    })
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed projects:')
    failed.forEach(result => {
      console.log(`  • ${result.project}: ${result.error}`)
    })
  }
  
  console.log('='.repeat(60) + '\n')
  
  // Return true if all projects succeeded, false otherwise
  // This allows the build to continue even if some projects fail
  return failed.length === 0
}

/**
 * Handle command line arguments
 * Allows running specific projects: node pre-fetch-data.js gaza
 */
function parseArguments() {
  const args = process.argv.slice(2)
  return args.filter(arg => !arg.startsWith('--'))
}

/**
 * Main execution
 */
async function main() {
  try {
    const requestedProjects = parseArguments()
    
    if (requestedProjects.length > 0) {
      // Filter to only requested projects
      const filteredProjects = PROJECTS.filter(project =>
        requestedProjects.some(requested =>
          project.name.toLowerCase().includes(requested.toLowerCase()) ||
          project.script.toLowerCase().includes(requested.toLowerCase())
        )
      )
      
      if (filteredProjects.length === 0) {
        console.error('❌ No matching projects found for:', requestedProjects.join(', '))
        console.log('Available projects:', PROJECTS.map(p => p.name).join(', '))
        process.exit(1)
      }
      
      console.log(`🎯 Running filtered projects: ${filteredProjects.map(p => p.name).join(', ')}`)
      
      // Run filtered projects
      const results = await Promise.all(
        filteredProjects.map(project => fetchProjectData(project))
      )
      
      const allSucceeded = results.every(r => r.success)
      process.exit(allSucceeded ? 0 : 1)
    } else {
      // Run all projects
      const success = await fetchAllProjects()
      process.exit(success ? 0 : 1)
    }
  } catch (error) {
    console.error('💥 Fatal error in orchestrator:', error)
    process.exit(1)
  }
}

// Export for programmatic use
export { fetchAllProjects, fetchProjectData, PROJECTS }

// Run if this file is executed directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('pre-fetch-data.js')

if (isMainModule) {
  main()
}

