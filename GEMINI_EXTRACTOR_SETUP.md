# Gemini ESG Extractor Integration Guide

## Overview
This document explains how the Python Gemini extractor has been integrated into the Next.js website.

## Architecture

### Components

1. **Python Extractor Module** (`python_extractor/`)
   - `gemini_extractor.py` - Gemini API client for metric extraction
   - `pdf_parser.py` - PDF text extraction and chunking
   - `pdf_splitter.py` - PDF splitting utility
   - `extractor_service.py` - Main service entry point
   - `requirements.txt` - Python dependencies

2. **Node.js Wrapper** (`lib/gemini-pdf-extractor.ts`)
   - Spawns Python process from Node.js
   - Handles child process communication
   - Transforms metrics to report format

3. **API Route** (`app/api/extract/route.ts`)
   - File upload handler
   - Calls Gemini extractor
   - Generates insights
   - Saves results

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd website/python_extractor
pip install -r requirements.txt
cd ..
```

### 2. Set Environment Variables

Add to your `.env.local`:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 3. Install/Update Node.js Dependencies

```bash
npm install
# or
pnpm install
```

## How It Works

### Extraction Flow

```
User Upload
    ↓
API Route (extract/route.ts)
    ↓
Save PDF File
    ↓
Call extractMetricsWithGemini()
    ↓
Spawn Python Process
    ↓
Python: Parse PDF → Extract Text → Call Gemini API
    ↓
Python Returns JSON Results
    ↓
Transform to Report Format
    ↓
Generate Insights
    ↓
Save Report & Return Results
```

### Key Functions

#### `extractMetricsWithGemini(filePath, apiKey)`
- Spawns Python process with `extractor_service.py`
- Passes file path and API key as arguments
- Returns structured extraction results
- Handles errors and process communication

#### `transformMetricsToReport(extractedMetrics)`
- Maps Gemini output to standard metric format
- Creates report-compatible structure
- Preserves raw metrics for reference

## Extracted Metrics Format

The Python extractor returns metrics in this format:

```json
[
  {
    "metric_name": "Carbon Emissions",
    "value": "1000",
    "unit": "tonnes CO2e",
    "year": 2024,
    "category": "Environmental"
  },
  {
    "metric_name": "Water Consumption",
    "value": "5000",
    "unit": "cubic meters",
    "year": 2024,
    "category": "Environmental"
  }
]
```

These are automatically transformed to the internal metrics format.

## API Response Format

The extract endpoint returns:

```json
{
  "success": true,
  "message": "Successfully processed 1 file(s) using Gemini extractor",
  "results": [
    {
      "filename": "report.pdf",
      "company": "Company Name",
      "year": 2024,
      "jsonPath": "company-name-2024.json",
      "metrics": { /* extracted metrics */ },
      "metricsCount": 25,
      "numPages": 50
    }
  ]
}
```

## Configuration

### Python Extractor Settings

In `python_extractor/pdf_parser.py`:
```python
PDFParser(chunk_size=4000, chunk_overlap=200)
```
- `chunk_size`: Characters per text chunk (for Gemini API)
- `chunk_overlap`: Overlap between chunks (for context preservation)

In `python_extractor/gemini_extractor.py`:
```python
model="gemini-2.5-pro"  # Model to use for extraction
```

### Node.js Child Process Settings

In `lib/gemini-pdf-extractor.ts`:
```typescript
spawn("python3", [pythonPath, filePath, apiKey], {
  cwd: join(process.cwd(), "python_extractor"),
  // ...
})
```

## Troubleshooting

### Python Process Won't Start
- Ensure `python3` is in PATH
- Check that `python_extractor/requirements.txt` dependencies are installed
- Verify permissions on Python files

### API Key Issues
- Set `GOOGLE_API_KEY` in `.env.local`
- Verify API key has access to Gemini API
- Check Google Cloud console for quota/billing issues

### Extraction Failures
- Check PDF file integrity
- Verify PDF is text-extractable (not scanned image)
- Review error logs from Python process

### Performance Issues
- Large PDFs are automatically chunked
- Adjust `chunk_size` in PDF parser if needed
- Consider adding request timeout in API route

## File Structure

```
website/
├── python_extractor/          # Python extraction modules
│   ├── __init__.py
│   ├── gemini_extractor.py   # Gemini API client
│   ├── pdf_parser.py         # PDF text extraction
│   ├── pdf_splitter.py       # PDF splitting utility
│   ├── extractor_service.py  # Main entry point
│   └── requirements.txt       # Python dependencies
├── lib/
│   ├── gemini-pdf-extractor.ts  # Node.js wrapper
│   └── ...                      # Other utilities
├── app/api/extract/
│   └── route.ts               # Updated API endpoint
└── ...
```

## Next Steps

1. ✅ Python extractor modules integrated
2. ✅ Node.js wrapper created
3. ✅ API route updated to use Gemini
4. Consider: Add metric validation
5. Consider: Add caching mechanism
6. Consider: Add progress tracking for large files
