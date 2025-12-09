# System Architecture

## Overview

The Ingredion ESG Platform uses a simple, file-based architecture that processes PDF reports using AI and displays the data in an executive dashboard.

## Data Flow Diagram

```
┌─────────────────┐
│   User Uploads  │
│   PDF Report    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Upload Component                           │
│  components/upload-report.tsx               │
└────────┬────────────────────────────────────┘
         │
         │ POST /api/extract
         ▼
┌─────────────────────────────────────────────┐
│  API Route                                  │
│  app/api/extract/route.ts                   │
│  - Saves PDF to data/uploads/               │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  PDF Extractor                              │
│  lib/pdf-extractor.ts                       │
│  - Uses pdf-parse to extract text           │
│  - Sends text to OpenAI                     │
│  - Gets structured JSON back                │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  AI Insights Generator                      │
│  lib/ai-insights.ts                         │
│  - Analyzes extracted data                  │
│  - Generates strategic insights             │
│  - Returns insight objects                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  JSON Storage                               │
│  data/reports/{company}-{year}.json         │
│  - Stores complete ESG report data          │
└─────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────┐
│  Data Loader                                │
│  lib/data-loader.ts                         │
│  - Reads JSON files                         │
│  - Provides query functions                 │
└────────┬────────────────────────────────────┘
         │
         │ GET /api/data
         ▼
┌─────────────────────────────────────────────┐
│  Dashboard Component                        │
│  components/pages/dashboard.tsx             │
│  - Fetches data from API                    │
│  - Displays KPIs, charts, insights          │
└─────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components

1. **Upload Component** (`components/upload-report.tsx`)
   - File upload UI with drag-and-drop
   - Progress tracking
   - Success/error messaging
   - Preview of extracted data

2. **Dashboard Component** (`components/pages/dashboard.tsx`)
   - KPI cards (6 key metrics)
   - Emissions trajectory chart
   - Peer ranking chart
   - Strategic priorities list
   - Framework coverage bars
   - AI insights feed

3. **Admin Page** (`components/pages/admin.tsx`)
   - Tabs for upload and settings
   - Integrates upload component

### Backend Services

1. **Extract API** (`app/api/extract/route.ts`)
   - Handles file uploads
   - Orchestrates extraction pipeline
   - Saves results to JSON

2. **Data API** (`app/api/data/route.ts`)
   - Serves data to frontend
   - Supports multiple endpoints:
     - `dashboard`: Full dashboard data
     - `companies`: List of available companies
     - `report`: Specific report data

3. **PDF Extractor** (`lib/pdf-extractor.ts`)
   - Extracts text using pdf-parse
   - Calls OpenAI API with structured prompt
   - Validates and normalizes response

4. **AI Insights** (`lib/ai-insights.ts`)
   - Analyzes ESG metrics
   - Generates insights using GPT-4
   - Categorizes by severity and topic

5. **Data Loader** (`lib/data-loader.ts`)
   - Reads JSON files from disk
   - Provides utility functions:
     - `loadAllReports()`
     - `loadLatestReport(company)`
     - `getPeerComparison(metric)`
     - `getHistoricalTrend(company, metric)`

## Data Models

### ESGReport Type

```typescript
interface ESGReport {
  company: string
  year: number
  reportDate?: string
  reportUrl?: string
  metrics: ESGMetrics
  frameworks: FrameworkCoverage
  targets?: Target[]
  materiality?: MaterialityItem[]
  insights?: Insight[]
}
```

### Storage Format

JSON files stored at: `data/reports/{company}-{year}.json`

Example: `data/reports/ingredion-2024.json`

## AI Integration

### OpenAI Usage

1. **Data Extraction**
   - Model: GPT-4o
   - Temperature: 0.3 (deterministic)
   - Response format: JSON object
   - Input: First 15,000 characters of PDF text
   - Output: Structured ESG data

2. **Insights Generation**
   - Model: GPT-4o
   - Temperature: 0.7 (creative)
   - Response format: JSON array
   - Input: Extracted metrics and targets
   - Output: 3-5 strategic insights

### Prompt Engineering

The system uses carefully crafted prompts that:
- Specify exact JSON schema needed
- Provide context about ESG standards
- Request specific metric types
- Handle missing or unclear data
- Ensure consistent formatting

## File Structure

```
Ingredion/
├── app/
│   ├── api/
│   │   ├── extract/route.ts      # PDF processing API
│   │   └── data/route.ts         # Data serving API
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── pages/
│   │   ├── dashboard.tsx         # Main dashboard
│   │   ├── admin.tsx             # Upload interface
│   │   └── [other pages]
│   ├── ui/                       # ShadCN components
│   └── upload-report.tsx         # Upload component
├── lib/
│   ├── types.ts                  # TypeScript definitions
│   ├── pdf-extractor.ts          # OpenAI extraction
│   ├── ai-insights.ts            # Insights generation
│   ├── data-loader.ts            # JSON file reader
│   └── utils.ts
├── data/
│   ├── schema.json               # JSON schema
│   ├── reports/                  # Extracted data
│   │   └── {company}-{year}.json
│   └── uploads/                  # Original PDFs
│       └── {timestamp}-{filename}.pdf
└── public/                       # Static assets
```

## Security Considerations

1. **API Key Protection**
   - OpenAI key stored in `.env.local`
   - Never committed to git
   - Server-side only

2. **File Upload**
   - Only PDF files accepted
   - Files saved with timestamp prefix
   - No direct file execution

3. **Data Access**
   - All APIs are server-side
   - No direct file system access from client
   - JSON files read through API only

## Scalability

### Current Limitations
- File-based storage (not suitable for high volume)
- Synchronous PDF processing
- Single OpenAI API key

### Future Improvements
- Add database (PostgreSQL/MongoDB)
- Queue-based processing (Bull/Celery)
- Batch upload support
- Caching layer (Redis)
- User authentication
- Multi-tenant support

## Performance

### Typical Processing Times
- PDF upload: < 1 second
- Text extraction: 2-5 seconds
- OpenAI extraction: 10-20 seconds
- Insights generation: 5-10 seconds
- **Total**: ~20-40 seconds per report

### Optimization Opportunities
- Parallel processing of multiple PDFs
- Cache OpenAI responses
- Pre-process common report formats
- Use GPT-4o-mini for simpler tasks

## Error Handling

The system includes fallbacks at each stage:

1. **PDF Extraction Fails**: Returns empty string
2. **OpenAI API Error**: Returns fallback JSON structure
3. **Insights Generation Fails**: Returns basic "data extracted" message
4. **No Data Found**: Dashboard shows "upload report" prompt
5. **File Save Error**: Returns error to user with details

## Monitoring

Key metrics to track:
- Upload success rate
- Average processing time
- OpenAI API costs
- Error rates by stage
- User engagement with insights

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Add New Metrics**
   - Update `types.ts`
   - Update extraction prompt
   - Update dashboard display

3. **Test with Sample Data**
   - Place JSON in `data/reports/`
   - Refresh dashboard
   - Verify display

4. **Deploy**
   - Set environment variables
   - Build: `npm run build`
   - Deploy to Vercel/similar

