# Build-Time Data Fetching System

This directory contains the build-time data fetching system for the TNH Storytelling SvelteKit application.

## Overview

The `pre-fetch-data.js` script is the main orchestrator that coordinates multiple project-specific data fetch scripts. Each project (like Gaza Map) has its own dedicated fetch script that can run independently or through the orchestrator.

**Architecture:**
- **`pre-fetch-data.js`**: Main orchestrator that runs all project fetch scripts in parallel
- **`pre-fetch-gaza-data.js`**: Gaza Map project-specific fetch script
- **Future projects**: Add new scripts following the same pattern

## How It Works

### Environment-Based Data Loading

- **Production** (`https://interactive.thenewhumanitarian.org/`): Uses cached data
- **Preview** (`https://storytelling-sveltekit-git-preview-thenewhumanitarian.vercel.app/`): Fetches fresh data
- **Local Development** (`https://localhost:5173`): Fetches fresh data

### Build Process

1. **Vercel Production Build**: Runs `node scripts/pre-fetch-gaza-data.js && vite build`
   - Fetches data from configured sources
   - Saves to `src/lib/data/` directory
   - Builds the app with cached data embedded

2. **Development**: Always fetches fresh data on each request

3. **Preview Deployments**: Always fetches fresh data (no caching)

## Usage

### Available Scripts

```bash
# Fetch all projects (orchestrator)
npm run pre-fetch-data

# Fetch only Gaza data (direct)
npm run pre-fetch-gaza

# Build with data fetching (runs orchestrator)
npm run build
```

### Command Line Options

```bash
# Run orchestrator for all projects
node scripts/pre-fetch-data.js

# Run orchestrator for specific projects (by name match)
node scripts/pre-fetch-data.js gaza

# Run a project script directly
node scripts/pre-fetch-gaza-data.js
```

## Adding New Projects

To add a new project to the orchestrator:

1. **Create a new project script**: `scripts/pre-fetch-[project-name]-data.js`
   - Copy the structure from `pre-fetch-gaza-data.js`
   - Export a function: `export async function fetch[ProjectName]Data()`
   - This function should return `true` on success, `false` on failure

2. **Add to orchestrator**: Edit `scripts/pre-fetch-data.js`
   ```javascript
   const PROJECTS = [
     {
       name: 'Gaza Map',
       script: './pre-fetch-gaza-data.js',
       fetchFunction: 'fetchGazaData'
     },
     {
       name: 'Your Project',
       script: './pre-fetch-your-project-data.js',
       fetchFunction: 'fetchYourProjectData'
     }
   ]
   ```

3. **Optional**: Add a direct npm script in `package.json`:
   ```json
   "pre-fetch-your-project": "node scripts/pre-fetch-your-project-data.js"
   ```

The orchestrator will automatically:
- Run all projects in parallel using `Promise.all`
- Handle errors gracefully (one failure won't stop others)
- Provide a summary of all results

```javascript
const DATA_SOURCES = {
  gaza: {
    name: 'Gaza Map Incidents',
    url: 'https://docs.google.com/spreadsheets/d/e/...',
    outputPath: 'src/lib/data/gaza-map/cached-incidents.json',
    processor: processGazaData
  },
  // Add your new source here
  yourNewSource: {
    name: 'Your Data Source',
    url: 'https://api.example.com/data',
    outputPath: 'src/lib/data/your-source/cached-data.json',
    processor: processYourData
  }
}
```

### Creating a Data Processor

Each data source needs a processor function that transforms the raw data:

```javascript
async function processYourData(rawData) {
  // Transform your raw data here
  const processedData = transformData(rawData)
  
  return {
    data: processedData,
    lastUpdated: new Date().toISOString(),
    buildTime: new Date().toISOString(),
    metadata: {
      totalRecords: processedData.length,
      // Add any relevant metadata
    }
  }
}
```

## File Structure

```
scripts/
├── pre-fetch-data.js          # Main orchestrator (runs all projects)
├── pre-fetch-gaza-data.js     # Gaza map data fetching script
└── README.md                  # This documentation

src/lib/data/
├── gaza-map/
│   ├── cached-incidents.json  # Cached Gaza data
│   └── cached-incidents.d.ts  # TypeScript declarations
└── [future-data-sources]/     # Future data sources
```

## Error Handling

The script includes comprehensive error handling:

- **Network failures**: Logs errors and continues with other sources
- **Invalid data**: Validates and filters records
- **File system errors**: Creates directories and handles write failures
- **Build failures**: Exits with error code if critical sources fail

## Monitoring

The script provides detailed logging:

- ✅ Success indicators
- ❌ Error messages
- 📊 Performance metrics
- 📅 Timestamps
- 📈 Record counts

## Benefits

- **Fast Production**: No runtime API calls in production
- **Fresh Development**: Always up-to-date data in development
- **Reliable**: Fallback to live fetch if cache fails
- **Scalable**: Easy to add new data sources
- **Vercel Optimized**: Works with your environment variables

## Troubleshooting

### Cache File Not Found
If the cache file is missing, the system will automatically fall back to live fetching.

### Build Failures
Check the build logs for specific error messages. Common issues:
- Network connectivity problems
- Invalid data format
- File system permissions

### Data Not Updating
- Clear the cache files in `src/lib/data/gaza-map/`
- Run `npm run pre-fetch-gaza` manually
- Check the source URLs are accessible 