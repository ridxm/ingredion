# Ingredion Sustainability Intelligence Platform

AI-Driven ESG Analytics, Data Extraction & Insights Dashboard

## Overview

This platform provides automated ESG data extraction from sustainability reports, normalization, industry benchmarking, strategic insights, and executive-level visual reporting.

## Features

- **PDF Upload & Extraction**: Upload sustainability reports (PDF) and automatically extract ESG metrics using OpenAI
- **Data Storage**: JSON-based storage system for extracted metrics
- **Dashboard**: Executive dashboard with KPIs, charts, peer comparison, and AI insights
- **Framework Analysis**: Track coverage for GRI, TCFD, SBTi, SDGs, CDP
- **AI Insights**: Automated generation of strategic insights and recommendations
- **Target Tracking**: Monitor progress toward sustainability goals

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TailwindCSS, ShadCN UI
- **AI**: OpenAI GPT-4 for data extraction and insights generation
- **Charts**: Recharts
- **PDF Processing**: pdf-parse
- **Data Storage**: JSON files (no database required)

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd Ingredion
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Upload a Report

1. Navigate to the **Admin** page from the sidebar
2. Click **Upload Reports** tab
3. Upload a PDF sustainability report
4. The system will:
   - Extract text from the PDF
   - Use OpenAI to extract structured ESG metrics
   - Generate AI insights
   - Save data as JSON in `data/reports/`

### View Dashboard

1. Navigate to the **Dashboard** page
2. View real-time ESG metrics, charts, peer comparisons, and AI insights
3. All data is loaded from the JSON files created during upload

## Project Structure

```
/Users/riddhima/Developer/Ingredion/
├── app/
│   ├── api/
│   │   ├── extract/          # PDF extraction endpoint
│   │   └── data/             # Data loading endpoint
│   ├── layout.tsx            # Global layout
│   └── page.tsx              # Landing page
├── components/
│   ├── pages/                # Feature pages (dashboard, admin, etc.)
│   ├── ui/                   # ShadCN UI components
│   ├── upload-report.tsx     # PDF upload component
│   └── sidebar.tsx           # Navigation
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── pdf-extractor.ts      # OpenAI PDF extraction
│   ├── ai-insights.ts        # AI insights generation
│   ├── data-loader.ts        # JSON data loading utilities
│   └── utils.ts              # Utility functions
├── data/
│   ├── schema.json           # JSON schema definition
│   ├── reports/              # Extracted ESG data (JSON files)
│   └── uploads/              # Uploaded PDF files
└── public/                   # Static assets
```

## Data Flow

1. **Upload PDF** → `components/upload-report.tsx`
2. **API Processing** → `app/api/extract/route.ts`
3. **Text Extraction** → `lib/pdf-extractor.ts` (using pdf-parse)
4. **AI Extraction** → OpenAI API extracts structured data
5. **AI Insights** → `lib/ai-insights.ts` generates strategic insights
6. **Save JSON** → `data/reports/{company}-{year}.json`
7. **Load Data** → `lib/data-loader.ts` reads JSON files
8. **Display** → Dashboard and other pages fetch via `app/api/data/route.ts`

## JSON Schema

Each extracted report is saved as:

```json
{
  "company": "Company Name",
  "year": 2024,
  "reportDate": "2024-01-01",
  "reportUrl": "filename.pdf",
  "metrics": {
    "scope1": 100,
    "scope2": 200,
    "totalEmissions": 300,
    "renewable_energy_pct": 50,
    "water_intensity": 2.5,
    "waste_landfill_pct": 10
  },
  "frameworks": {
    "GRI": 85,
    "TCFD": 75,
    "SBTi": 80,
    "SDG": 70
  },
  "targets": [...],
  "insights": [...]
}
```

## API Endpoints

### POST /api/extract
Upload and process PDF reports

**Request**: FormData with PDF files
**Response**: Extracted data and saved file paths

### GET /api/data?company=Ingredion&endpoint=dashboard
Load dashboard data for a company

**Parameters**:
- `company`: Company name (default: "Ingredion")
- `endpoint`: "dashboard" | "companies" | "report"

## Development

### Add New Metrics

1. Update `lib/types.ts` - add to `ESGMetrics` interface
2. Update `lib/pdf-extractor.ts` - add to extraction prompt
3. Update dashboard to display new metrics

### Add New Pages

1. Create component in `components/pages/`
2. Add route in sidebar navigation
3. Create API endpoint if needed for data loading

## Troubleshooting

### OpenAI API Errors
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Verify you have API credits available

### PDF Extraction Issues
- Ensure PDF is text-based (not scanned images)
- Check `data/uploads/` for uploaded files
- Review API logs in terminal

### No Data on Dashboard
- Upload at least one report via Admin panel
- Check `data/reports/` contains JSON files
- Verify company name matches

## Future Enhancements

- [ ] Multi-company comparison views
- [ ] Historical trend analysis
- [ ] Scenario modeling
- [ ] Materiality assessment automation
- [ ] Integration with Sunhat
- [ ] Advanced AI recommendations
- [ ] Export reports as PDF

## License

Proprietary - Ingredion Internal Use Only

# ingredion
