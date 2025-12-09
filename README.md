# Ingredion ESG Platform

An AI-powered ESG (Environmental, Social, Governance) data extraction and analysis platform. Upload sustainability reports (PDFs) and automatically extract, normalize, and visualize ESG metrics.

## 🚀 Features

- **PDF Data Extraction** - Upload sustainability reports and extract 60+ ESG metrics using AI
- **Multi-Company Comparison** - Compare metrics across multiple companies with interactive charts
- **Data Quality Analysis** - See what was extracted vs. missing, with confidence scores
- **Dashboard Visualization** - View KPIs, emissions breakdown, and all metrics at a glance
- **CSV Export** - Download extracted metrics as CSV for further analysis

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **AI Extraction**: OpenAI GPT-4o
- **PDF Parsing**: Python + PyPDF2
- **UI Components**: Radix UI, Lucide Icons

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- OpenAI API key

## ⚙️ Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/ridxm/ingredion.git
cd ingredion
npm install
```

### 2. Set Up Python Environment

```bash
cd python_extractor
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ingredion/
├── app/
│   ├── api/
│   │   ├── data/route.ts       # Data retrieval API
│   │   └── extract/route.ts    # PDF upload & extraction API
│   ├── page.tsx                # Main app entry
│   └── layout.tsx
│
├── components/
│   ├── pages/
│   │   ├── dashboard.tsx       # Main dashboard with KPIs
│   │   ├── competitive-intelligence.tsx  # Compare companies
│   │   ├── data-quality.tsx    # Extraction quality analysis
│   │   ├── insights.tsx        # AI-generated insights
│   │   └── admin.tsx           # Upload management
│   ├── sidebar.tsx
│   ├── top-nav.tsx
│   └── upload-report.tsx
│
├── lib/
│   ├── pdf-extractor.ts        # OpenAI extraction logic
│   ├── metric-config.ts        # 63 metric definitions & aliases
│   ├── metric-normalizer.ts    # Unit conversion & normalization
│   ├── extraction-validator.ts # Data validation
│   ├── data-loader.ts          # Load saved reports
│   ├── ai-insights.ts          # Generate AI insights
│   └── types.ts                # TypeScript interfaces
│
├── python_extractor/
│   ├── pdf_text_extractor.py   # PDF to text extraction
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Python virtual environment
│
├── data/
│   ├── uploads/                # Uploaded PDFs
│   └── reports/                # Extracted JSON & CSV files
│
└── .env.local                  # Environment variables (create this)
```

## 🔌 API Endpoints

### POST `/api/extract`
Upload and extract data from PDF sustainability reports.

**Request**: `multipart/form-data`
- `files`: PDF file(s)
- `companyName`: Company name (required)

**Response**:
```json
{
  "success": true,
  "results": [{
    "company": "Ingredion",
    "year": 2024,
    "metricsCount": 15,
    "dataQuality": { "score": 89 }
  }]
}
```

### GET `/api/data`

| Parameter | Description |
|-----------|-------------|
| `endpoint=companies` | List all uploaded companies |
| `endpoint=dashboard&company=X` | Get dashboard data for company |
| `endpoint=report&company=X` | Get full report with extraction details |

## 📊 Metrics Extracted

The platform extracts metrics across these categories:

| Category | Example Metrics |
|----------|-----------------|
| **Emissions** | Scope 1/2/3, Carbon Reduction %, Intensity |
| **Energy** | Renewable %, Total Consumption |
| **Water** | Withdrawal, Recycled %, Intensity |
| **Waste** | Total Waste, Landfill Diversion % |
| **Safety** | TRIR, Zero Injury Facilities % |
| **Diversity** | Women in Leadership %, Board Diversity |
| **Governance** | Board Independence %, CEO Pay Ratio |

See `lib/metric-config.ts` for the full list of 63 metrics with aliases.

## 🔄 Extraction Pipeline

```
PDF Upload → Python Text Extraction → OpenAI Analysis → Normalization → Validation → Save JSON/CSV
```

1. **PDF Text Extraction** (`python_extractor/pdf_text_extractor.py`)
   - Uses PyPDF2 to extract text from all pages

2. **AI Extraction** (`lib/pdf-extractor.ts`)
   - Sends text to GPT-4o with comprehensive prompt
   - Extracts metrics with confidence scores

3. **Normalization** (`lib/metric-normalizer.ts`)
   - Maps extracted metrics to standard IDs
   - Converts units to standard format
   - Calculates derived metrics (e.g., total emissions)

4. **Validation** (`lib/extraction-validator.ts`)
   - Checks for hallucinations
   - Validates data ranges
   - Assigns quality scores

5. **Storage** (`data/reports/`)
   - Saves as `{company}-{year}.json`
   - Also generates `{company}-{year}-metrics.csv`

## 🖥️ Pages

| Page | Description |
|------|-------------|
| **Dashboard** | KPIs, emissions chart, all metrics grid |
| **Compare** | Multi-select companies, bar/radar charts, data table |
| **Data Quality** | Extraction coverage, missing metrics, warnings |
| **Insights** | AI-generated analysis and recommendations |
| **Admin** | Upload new reports |

## 🔧 Adding New Metrics

1. Open `lib/metric-config.ts`
2. Add to `METRIC_DEFINITIONS`:

```typescript
newMetricId: {
  name: "Display Name",
  aliases: ["alias1", "alias2", "alternate name"],
  standardUnit: "unit",
  category: "emissions", // or energy, water, waste, safety, etc.
  conversionFactors: {
    "other unit": 1.5, // multiply to convert to standard
  },
},
```

3. The extraction prompt in `lib/pdf-extractor.ts` will automatically include it

## 🐛 Troubleshooting

### "Could not extract text from PDF"
- Ensure Python venv is set up: `cd python_extractor && source venv/bin/activate`
- Check PyPDF2 is installed: `pip install PyPDF2`

### "OpenAI API key not configured"
- Create `.env.local` with `OPENAI_API_KEY=sk-...`
- Restart the dev server

### "No companies available"
- Upload at least one PDF in Admin page
- Check `data/reports/` for saved JSON files

## 📝 Future Improvements

- [ ] Support for more PDF formats (scanned/image PDFs with OCR)
- [ ] Historical trend analysis (multiple years per company)
- [ ] Benchmark against industry averages
- [ ] Export to PowerPoint/PDF reports
- [ ] User authentication
- [ ] Bulk upload support

## 👥 Team

Built for Ingredion ESG reporting and analysis.

## 📄 License

Private - Internal use only.
