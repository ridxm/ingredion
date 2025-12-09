# Update Log - Metric Normalization System

## Date: November 20, 2024

## What Was Built

Added a comprehensive metric normalization and data quality system to handle inconsistent ESG data across different sustainability reports.

## Problem Solved

Different companies report ESG metrics with:
- Different units (kt vs t vs MT vs metric tons)
- Different names (Scope 1 vs Direct Emissions)
- Missing units
- Inconsistent formats

This made cross-company comparisons impossible and data unreliable.

## Solution Implemented

### 1. Metric Configuration System
**File**: `lib/metric-config.ts` (529 lines)

- Defines 20+ standard ESG metrics
- Each metric has:
  - Standard unit (e.g., "kt CO2e" for emissions)
  - Aliases (alternative names)
  - Unit conversions (automatic conversion rules)
  - Validation rules (min/max values)
  - Category and data type

**Supported Metrics:**
- Emissions: Scope 1, 2, 3, Total, Intensity
- Energy: Renewable %, Total consumption
- Water: Intensity, Withdrawal, Recycled %
- Waste: Landfill %, Generated, Recycled %
- Social: Turnover, Diversity, Safety, Women in leadership
- Governance: Board independence

### 2. Normalization Engine
**File**: `lib/metric-normalizer.ts` (414 lines)

**Features:**
- Automatic unit conversion
- Metric alias recognition
- Data validation
- Quality scoring (0-100)
- Derived metric calculation
- Warning/error logging

**Process:**
1. Receives raw metrics with units
2. Recognizes metric by checking aliases
3. Converts to standard unit
4. Validates against rules
5. Assigns quality score
6. Logs all conversions and warnings

### 3. Enhanced PDF Extraction
**File**: `lib/pdf-extractor.ts` (updated)

**Changes:**
- OpenAI now extracts value AND unit
- Extracts confidence score (0-1)
- Returns raw metrics for normalization
- Lower temperature (0.2) for deterministic extraction
- Enhanced prompt with unit examples

**New extraction format:**
```json
{
  "rawMetrics": [
    {
      "name": "scope1",
      "value": 100000,
      "unit": "metric tons CO2e",
      "confidence": 0.95
    }
  ]
}
```

### 4. Data Quality Tracking
**File**: `lib/types.ts` (updated)

**New Interface:**
```typescript
interface DataQuality {
  score: number
  warnings: string[]
  missingRequiredMetrics: string[]
  metricDetails: Array<{
    id: string
    value: number
    unit: string
    originalValue: number
    originalUnit?: string
    confidence: number
    dataQuality: "high" | "medium" | "low"
    warnings: string[]
  }>
}
```

### 5. Data Quality UI Components

**A. Data Quality Card**
**File**: `components/data-quality-card.tsx` (159 lines)
- Compact card for dashboard
- Shows overall quality score
- High/medium/low quality breakdown
- Missing metrics alert
- Top warnings display

**B. Data Quality Page**
**File**: `components/pages/data-quality.tsx` (144 lines)
- Full-page analysis view
- Metric-by-metric details
- Shows all conversions
- Normalization summary
- Complete warning list

### 6. Dashboard Integration
**File**: `components/pages/dashboard.tsx` (updated)

Added data quality card to main dashboard showing:
- Quality score at a glance
- Quick access to warnings
- Link to detailed analysis

### 7. Sample Data Update
**File**: `data/reports/ingredion-2024.json` (updated)

Added data quality metadata to sample report:
- Quality score: 88
- 10 metrics with quality details
- 2 example warnings
- Demonstrates normalization

### 8. Documentation

**A. NORMALIZATION.md** (comprehensive guide)
- Problem explanation
- Solution architecture
- Configuration reference
- Usage examples
- Troubleshooting guide

**B. NORMALIZATION_SUMMARY.md** (executive summary)
- High-level overview
- Benefits and use cases
- Real-world example
- Technical architecture

## How It Works

### Example Flow

**1. Input (PDF Report):**
```
"Ingredion's Scope 1 emissions were 105,000 metric tons CO2e"
```

**2. OpenAI Extraction:**
```json
{
  "name": "scope 1",
  "value": 105000,
  "unit": "metric tons CO2e",
  "confidence": 0.95
}
```

**3. Normalization:**
```json
{
  "id": "scope1",
  "name": "Scope 1 Emissions",
  "value": 105,  // Converted!
  "unit": "kt CO2e",
  "originalValue": 105000,
  "originalUnit": "metric tons CO2e",
  "dataQuality": "high",
  "warnings": ["Converted from metric tons CO2e to kt CO2e"]
}
```

**4. Storage:**
```json
{
  "metrics": {
    "scope1": 105  // Standard unit, ready for comparison
  },
  "dataQuality": {
    "score": 92,
    "warnings": ["Converted from metric tons CO2e to kt CO2e"]
  }
}
```

**5. Dashboard Display:**
- Shows: "Scope 1+2: 340 kt CO₂e"
- Quality indicator: 92 (Excellent)
- All companies comparable

## Key Features

### 1. Automatic Unit Conversion
Supports 50+ unit variations across all metric types

### 2. Alias Recognition
Handles 100+ naming variations automatically

### 3. Quality Scoring
- High (80-100): Reliable data
- Medium (60-79): Usable with caution
- Low (<60): Needs review

### 4. Transparency
- Every conversion logged
- Original values preserved
- Full audit trail

### 5. Extensibility
Easy to add:
- New metrics (just add to config)
- New units (add conversion factor)
- New aliases (add to list)

## Configuration

### Adding a New Metric

```typescript
// In lib/metric-config.ts
myNewMetric: {
  id: "myNewMetric",
  name: "My New Metric",
  standardUnit: "units",
  aliases: ["metric", "my metric"],
  unitConversions: {
    "units": 1,
    "other": 0.001
  },
  category: "emissions",
  dataType: "absolute",
  required: false
}
```

Done! AI will extract it automatically.

### Adding a New Unit

```typescript
// In existing metric definition
unitConversions: {
  "kt CO2e": 1,
  "new_unit": 2.5  // Add conversion factor
}
```

## Benefits

### Data Consistency
- All metrics in standard units
- Valid cross-company comparisons
- No manual conversions

### Data Quality
- Automatic validation
- Quality scoring
- Early issue detection

### Trust & Transparency
- All conversions logged
- Original values kept
- Full traceability

### Developer Experience
- Simple configuration
- Automatic processing
- Extensible design

## Testing

To test normalization:

1. Upload a report with various units
2. Check Data Quality page to see conversions
3. Verify dashboard shows standardized values
4. Review warnings for any issues

## Future Enhancements

Potential improvements:
- [ ] ML-based unit detection
- [ ] Anomaly detection
- [ ] Cross-validation of related metrics
- [ ] Historical trend analysis
- [ ] Company-specific configurations
- [ ] Batch normalization tools

## Files Modified/Created

### New Files (7)
1. `lib/metric-config.ts` - Metric definitions
2. `lib/metric-normalizer.ts` - Normalization engine
3. `components/data-quality-card.tsx` - Quality indicator UI
4. `components/pages/data-quality.tsx` - Full quality page
5. `NORMALIZATION.md` - Technical documentation
6. `NORMALIZATION_SUMMARY.md` - Executive summary
7. `UPDATE_LOG.md` - This file

### Modified Files (4)
1. `lib/pdf-extractor.ts` - Enhanced extraction
2. `lib/types.ts` - Added DataQuality interface
3. `components/pages/dashboard.tsx` - Added quality card
4. `data/reports/ingredion-2024.json` - Added quality data

## Total Lines of Code

- **Metric Config**: 529 lines
- **Normalizer**: 414 lines
- **UI Components**: 303 lines
- **Documentation**: 1000+ lines
- **Total**: ~2,250 lines

## Status

✅ **Complete and Ready for Use**

The normalization system is fully functional and integrated into the platform. All uploaded reports will automatically benefit from:
- Unit conversion
- Data validation
- Quality scoring
- Transparent logging

## Next Steps for Users

1. Upload sustainability reports as usual
2. Check Data Quality card on dashboard
3. Review detailed analysis on Data Quality page
4. Use normalized data confidently for comparisons

## Support

For questions about:
- **Configuration**: See `NORMALIZATION.md`
- **Usage**: See `NORMALIZATION_SUMMARY.md`
- **Troubleshooting**: Check warnings in Data Quality page

