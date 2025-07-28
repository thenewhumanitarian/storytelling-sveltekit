# Build-Time Data Fetching System

This directory contains the build-time data fetching system for the TNH Storytelling SvelteKit application.

## Overview

The `pre-fetch-data.js` script fetches data from external sources during the build process and caches it as JSON files. This ensures fast production deployments and reduces runtime API calls.

## How It Works

### Environment-Based Data Loading

- **Production** (`https://interactive.thenewhumanitarian.org/`): Uses cached data
- **Preview** (`https://storytelling-sveltekit-git-preview-thenewhumanitarian.vercel.app/`): Fetches fresh data
- **Local Development** (`https://localhost:5173`): Fetches fresh data

### Build Process

1. **Vercel Production Build**: Runs `node scripts/pre-fetch-data.js && vite build`
   - Fetches data from configured sources
   - Saves to `src/lib/data/` directory
   - Builds the app with cached data embedded

2. **Development**: Always fetches fresh data on each request

3. **Preview Deployments**: Always fetches fresh data (no caching)

## Usage

### Available Scripts

```bash
# Fetch all data sources
npm run pre-fetch-data

# Fetch only Gaza data
npm run pre-fetch-gaza

# Build with data fetching
npm run build
```

### Command Line Options

```bash
# Fetch specific data sources
node scripts/pre-fetch-data.js gaza
node scripts/pre-fetch-data.js gaza example

# Fetch all sources
node scripts/pre-fetch-data.js
```

## Adding New Data Sources

To add a new data source, edit `scripts/pre-fetch-data.js` and add a new entry to the `DATA_SOURCES` object:

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
├── pre-fetch-data.js          # Main data fetching script
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
- Clear the cache files in `src/lib/data/`
- Run `npm run pre-fetch-data` manually
- Check the source URLs are accessible 