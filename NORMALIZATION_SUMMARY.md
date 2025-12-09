# Metric Normalization & Data Quality System - Summary

## What Problem Does This Solve?

When extracting ESG data from different companies' sustainability reports, you face major challenges:

### 1. **Inconsistent Units**
```
Company A: "Scope 1 Emissions: 250,000 metric tons CO2e"
Company B: "Direct GHG: 250 kt CO2e"
Company C: "Scope 1: 250000000 kg CO2e"
```
All three are the same value but in different units!

### 2. **Different Naming**
```
"Scope 1" = "Direct Emissions" = "Direct GHG" = "Scope 1 CO2"
"Renewable Energy %" = "Clean Energy" = "Green Power Percentage"
```

### 3. **Missing or Unclear Units**
```
"Water usage: 2.8" (Is this m³/t? L/kg? gallons/ton?)
"Renewable: 62" (Is this 62% or 0.62?)
```

## How The System Solves It

### Step 1: Enhanced AI Extraction

The OpenAI prompt now asks for:
- **Value AND unit** for every metric
- **Confidence score** (how sure the AI is)
- **Multiple naming variations** of the same metric

Example extraction:
```json
{
  "rawMetrics": [
    {
      "name": "scope 1",
      "value": 250000,
      "unit": "metric tons CO2e",
      "confidence": 0.95
    },
    {
      "name": "renewable energy",
      "value": 62,
      "unit": "%",
      "confidence": 0.9
    }
  ]
}
```

### Step 2: Metric Recognition

The system has a configuration file (`lib/metric-config.ts`) with:

**30+ standard ESG metrics** including:
- All emission types (Scope 1, 2, 3)
- Energy metrics (renewable %, total consumption)
- Water metrics (intensity, withdrawal, recycled)
- Waste metrics (landfill %, recycled %)
- Social metrics (diversity, turnover, safety)
- Governance metrics (board independence)

**Each metric has:**
- Standard unit (e.g., "kt CO2e")
- Aliases (e.g., "scope 1" = "direct emissions" = "scope1")
- Unit conversions (e.g., t CO2e → kt CO2e = ×0.001)
- Validation rules (e.g., percentages must be 0-100)

### Step 3: Automatic Normalization

The normalizer (`lib/metric-normalizer.ts`):

1. **Recognizes the metric** by checking aliases
   ```
   "direct emissions" → identified as "scope1"
   ```

2. **Converts to standard unit**
   ```
   250000 metric tons CO2e → 250 kt CO2e
   ```

3. **Validates the value**
   ```
   250 >= 0 ✓ (emissions can't be negative)
   ```

4. **Assigns quality score**
   ```
   High quality: unit present, high confidence, validated
   ```

5. **Logs everything**
   ```
   Warning: "Converted from metric tons CO2e to kt CO2e"
   ```

### Step 4: Data Quality Scoring

Every report gets a quality score (0-100) based on:
- Are required metrics present?
- Are units specified?
- How confident is the AI?
- Did values pass validation?
- How many warnings were generated?

**Quality Levels:**
- **90-100**: Excellent - All data clear and validated
- **80-89**: Good - Minor unit conversions needed
- **70-79**: Fair - Some warnings or missing optional metrics
- **60-69**: Moderate - Missing some data or low confidence
- **<60**: Poor - Many issues, needs review

## What You Get

### 1. Consistent Data Storage

All metrics stored in standard units:
```json
{
  "scope1": 250,              // Always in kt CO2e
  "renewable_energy_pct": 62, // Always in %
  "water_intensity": 2.8      // Always in m³/t
}
```

### 2. Transparent Conversions

Every conversion is logged:
```json
{
  "value": 250,
  "unit": "kt CO2e",
  "originalValue": 250000,
  "originalUnit": "metric tons CO2e",
  "warnings": ["Converted from metric tons CO2e to kt CO2e"]
}
```

### 3. Data Quality Insights

See exactly how good your data is:
- Overall quality score
- Metric-by-metric quality levels
- List of warnings
- Missing required metrics
- Confidence scores

### 4. Automatic Calculations

The system can auto-calculate:
- Total emissions from Scope 1+2+3
- Landfill % from recycling %
- Validates that totals match sums

## How to Use It

### For Users (Upload Reports)

1. Upload PDF report via Admin page
2. System extracts, normalizes, and validates automatically
3. View results on Dashboard with quality indicator
4. Check Data Quality page for detailed analysis

### For Developers (Add New Metrics)

1. Add metric definition to `lib/metric-config.ts`:
```typescript
myMetric: {
  id: "myMetric",
  name: "My Metric",
  standardUnit: "units",
  aliases: ["my metric", "metric name"],
  unitConversions: {
    "units": 1,
    "other": 0.001
  },
  category: "emissions",
  dataType: "absolute",
  required: false
}
```

2. That's it! AI will extract it and normalization happens automatically.

### For Analysts (Interpret Data)

Check the data quality card on dashboard:
- **Green/High (80-100)**: Data is reliable, use confidently
- **Yellow/Medium (60-79)**: Data is usable but review warnings
- **Red/Low (<60)**: Data has issues, manual review recommended

## Real-World Example

### Input (from PDF):
```
"In 2024, Ingredion achieved direct emissions of 105,000 metric tons 
of CO2 equivalent, while our indirect emissions from purchased 
electricity totaled 235 kt CO2e. Our renewable energy stood at 62%."
```

### AI Extraction:
```json
{
  "rawMetrics": [
    {
      "name": "direct emissions",
      "value": 105000,
      "unit": "metric tons CO2e",
      "confidence": 0.95
    },
    {
      "name": "indirect emissions",
      "value": 235,
      "unit": "kt CO2e",
      "confidence": 0.9
    },
    {
      "name": "renewable energy",
      "value": 62,
      "unit": "%",
      "confidence": 0.9
    }
  ]
}
```

### After Normalization:
```json
{
  "metrics": {
    "scope1": 105,              // Converted: 105000 tons → 105 kt
    "scope2": 235,              // Already in kt CO2e
    "totalEmissions": 340,      // Auto-calculated
    "renewable_energy_pct": 62  // Already in %
  },
  "dataQuality": {
    "score": 92,
    "warnings": [
      "Converted Scope 1 from metric tons CO2e to kt CO2e",
      "Calculated total emissions from Scope 1+2"
    ],
    "metricDetails": [
      {
        "id": "scope1",
        "value": 105,
        "unit": "kt CO2e",
        "originalValue": 105000,
        "originalUnit": "metric tons CO2e",
        "confidence": 0.95,
        "dataQuality": "high"
      }
      // ... more details
    ]
  }
}
```

### Dashboard Display:
- KPI shows: "Total Scope 1+2: 340 kt CO₂e"
- Data Quality: 92 (Excellent)
- Warnings button shows conversion details
- All metrics comparable across companies

## Technical Architecture

```
┌──────────────────────┐
│   PDF Report Upload   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  OpenAI Extraction (Enhanced)        │
│  - Extracts value + unit             │
│  - Multiple naming variations        │
│  - Confidence scoring                │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Metric Normalizer                   │
│  1. Recognize metric by aliases      │
│  2. Convert to standard unit         │
│  3. Validate value                   │
│  4. Calculate quality score          │
│  5. Log warnings                     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Standardized JSON Storage           │
│  - All metrics in standard units     │
│  - Data quality metadata included    │
│  - Conversion history preserved      │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Dashboard / Data Quality Page       │
│  - Displays normalized metrics       │
│  - Shows quality indicators          │
│  - Allows drilling into details      │
└──────────────────────────────────────┘
```

## Files Created

1. **`lib/metric-config.ts`** (529 lines)
   - Defines 20+ standard ESG metrics
   - Unit conversions for each metric
   - Aliases and validation rules

2. **`lib/metric-normalizer.ts`** (414 lines)
   - Normalization engine
   - Unit conversion logic
   - Quality scoring algorithm
   - Derived metric calculations

3. **`components/data-quality-card.tsx`** (159 lines)
   - Compact quality indicator for dashboard
   - Shows score, warnings, missing metrics

4. **`components/pages/data-quality.tsx`** (144 lines)
   - Full data quality analysis page
   - Metric-by-metric details
   - Normalization summary

5. **`NORMALIZATION.md`** (Full documentation)
   - Complete guide to normalization system
   - Examples and troubleshooting
   - Configuration reference

## Benefits

### For Data Consistency
- All companies' data in same units
- Valid cross-company comparisons
- No manual unit conversions needed

### For Data Quality
- Transparent quality scoring
- Automatic validation
- Early warning of data issues

### For Extensibility
- Easy to add new metrics
- Simple to add new units
- Flexible configuration

### For Trust
- Every conversion logged
- Original values preserved
- Full audit trail

## What's Next

The system is production-ready for:
- Uploading sustainability reports
- Automatic extraction and normalization
- Dashboard display with quality indicators
- Data quality analysis

Future enhancements could include:
- Machine learning for better unit detection
- Anomaly detection across historical data
- Automatic metric relationship validation
- Company-specific metric definitions

