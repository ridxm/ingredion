# Metric Normalization System

## Overview

The Ingredion ESG Platform includes a sophisticated metric normalization system that handles inconsistent units, naming variations, and data quality issues across different sustainability reports.

## The Problem

Different companies report ESG metrics in different ways:

### Unit Variations
- **Emissions**: kt CO2e, t CO2e, MT CO2e, metric tons, tonnes
- **Energy**: GWh, MWh, kWh, TJ, GJ
- **Water**: m³, ML, GL, liters, gallons
- **Percentages**: 62% vs 0.62 (decimal)

### Naming Variations
- "Scope 1" = "Direct Emissions" = "Scope 1 GHG" = "Direct GHG Emissions"
- "Renewable Energy" = "Clean Energy" = "Green Energy" = "Renewable Power"
- "Water Intensity" = "Water Use Intensity" = "Specific Water Consumption"

### Missing Data
- Not all companies report all metrics
- Some metrics are calculated vs measured
- Framework coverage may be estimated

## The Solution

### 1. Metric Configuration System

`lib/metric-config.ts` defines standard metrics with:

```typescript
{
  id: "scope1",
  name: "Scope 1 Emissions",
  standardUnit: "kt CO2e",
  aliases: ["scope 1", "direct emissions", "scope 1 ghg"],
  unitConversions: {
    "kt CO2e": 1,
    "t CO2e": 0.001,
    "MT CO2e": 1000,
    // ... more conversions
  },
  category: "emissions",
  dataType: "absolute",
  required: true,
  validationRules: { min: 0 }
}
```

**Supported Metrics:**

#### Emissions
- Scope 1, 2, 3 emissions
- Total emissions
- Emissions intensity

#### Energy
- Renewable energy percentage
- Total energy consumption

#### Water
- Water intensity
- Water withdrawal
- Water recycled percentage

#### Waste
- Waste to landfill percentage
- Total waste generated
- Waste recycled percentage

#### Social
- Employee turnover
- Diversity percentage
- Safety incident rate
- Women in leadership

#### Governance
- Board independence

### 2. Normalization Engine

`lib/metric-normalizer.ts` provides:

#### Unit Conversion
```typescript
// Automatic conversion to standard units
Input:  { name: "scope1", value: 100000, unit: "t CO2e" }
Output: { name: "Scope 1 Emissions", value: 100, unit: "kt CO2e" }
```

#### Alias Recognition
```typescript
// Recognizes naming variations
"Direct Emissions" → "scope1"
"Renewable %" → "renewable_energy_pct"
"Water per ton" → "water_intensity"
```

#### Derived Calculations
```typescript
// Auto-calculates missing metrics
If scope1 = 100 and scope2 = 200
Then totalEmissions = 300 (calculated)

If wasteRecycled = 80%
Then waste_landfill_pct = 20% (calculated)
```

#### Data Validation
```typescript
// Validates ranges
renewable_energy_pct: must be 0-100
emissions: must be >= 0
percentages: automatically detected and validated
```

### 3. Quality Scoring

Each metric receives a quality score based on:

- **Unit Availability**: Does it have a unit? (+)
- **Confidence**: How confident is the AI extraction? (0-1)
- **Standard Unit**: Is it already in standard unit? (+)
- **Validation**: Does it pass validation rules? (+)
- **Warnings**: Any normalization issues? (-)

**Quality Levels:**
- **High** (80-100): Clear, standard format, validated
- **Medium** (60-79): Minor issues, unit conversions needed
- **Low** (<60): Missing units, low confidence, multiple warnings

### 4. Overall Data Quality Score

```typescript
dataQualityScore = 100 
  - (missingRequiredMetrics × 15)
  - (warnings × 2)
  + (avgMetricQuality × 0.4)
```

## Data Flow

```
1. PDF Upload
   ↓
2. OpenAI Extraction (with units)
   {
     "rawMetrics": [
       { "name": "scope 1", "value": 100000, "unit": "t CO2e", "confidence": 0.9 }
     ]
   }
   ↓
3. Normalization
   - Recognize "scope 1" → "scope1"
   - Convert 100000 t CO2e → 100 kt CO2e
   - Validate: 100 >= 0 ✓
   - Quality: high (confidence 0.9, unit present, validated)
   ↓
4. Standardized Output
   {
     "metrics": { "scope1": 100 },
     "dataQuality": {
       "score": 92,
       "warnings": ["Converted from t CO2e to kt CO2e"],
       "metricDetails": [...]
     }
   }
```

## Usage Examples

### Adding a New Metric

1. Define in `lib/metric-config.ts`:
```typescript
myNewMetric: {
  id: "myNewMetric",
  name: "My New Metric",
  standardUnit: "units",
  aliases: ["my metric", "new metric"],
  unitConversions: {
    "units": 1,
    "other_units": 0.001,
  },
  category: "emissions",
  dataType: "absolute",
  required: false,
}
```

2. AI will automatically extract it
3. Normalization happens automatically
4. Dashboard displays it

### Handling Custom Units

The system handles unknown units gracefully:
- Logs a warning
- Assumes value is in standard unit
- Marks quality as "low"
- Still includes the data

### Checking Data Quality

View data quality on:
- **Dashboard**: Quick data quality card
- **Data Quality Page**: Detailed analysis with all metrics, warnings, and normalization steps

## API Integration

### Extraction with Normalization

```typescript
// lib/pdf-extractor.ts
const rawData = await extractStructuredData(pdfText, filename)
const normalizationResult = normalizeMetrics(rawData.rawMetrics)

return {
  ...rawData,
  metrics: normalizationResult.metrics,
  dataQuality: {
    score: normalizationResult.dataQualityScore,
    warnings: normalizationResult.warnings,
    // ... more details
  }
}
```

### Loading Normalized Data

```typescript
// Frontend
const response = await fetch('/api/data?company=Ingredion&endpoint=dashboard')
const data = await response.json()

console.log(data.metrics.scope1) // Always in kt CO2e
console.log(data.dataQuality.score) // 0-100
console.log(data.dataQuality.warnings) // Array of warnings
```

## Benefits

### 1. Consistency
All metrics stored in standard units, making comparisons valid

### 2. Flexibility
Handles various input formats without manual intervention

### 3. Transparency
Every conversion and calculation is logged with warnings

### 4. Quality Assurance
Data quality score helps identify extraction issues

### 5. Extensibility
Easy to add new metrics and unit conversions

## Configuration

### Standard Units Reference

| Metric Type | Standard Unit | Alternative Units Supported |
|------------|---------------|----------------------------|
| Emissions | kt CO2e | t CO2e, MT CO2e, metric tons, kg |
| Energy | GWh | MWh, kWh, TJ, GJ |
| Water Volume | million m³ | m³, ML, GL, thousand m³ |
| Water Intensity | m³/t | L/t, L/kg, m³/kg, gal/ton |
| Waste | kt | t, MT, kg, tons, metric tons |
| Percentages | % | percent, decimal (0-1), fraction |

### Validation Rules

| Metric Category | Rules |
|----------------|-------|
| Emissions | min: 0 |
| Percentages | min: 0, max: 100 |
| All Metrics | mustBePositive (configurable) |

## Troubleshooting

### Issue: Metric not recognized
**Solution**: Add aliases to `METRIC_DEFINITIONS` in `lib/metric-config.ts`

### Issue: Wrong unit conversion
**Solution**: Add conversion factor to `unitConversions` in metric definition

### Issue: Low data quality score
**Check**:
1. Are units being extracted? (check raw OpenAI response)
2. Are there validation errors? (check warnings)
3. Are required metrics missing? (check missingRequiredMetrics)

### Issue: Duplicate metrics
**Handled automatically**: System keeps the value with highest confidence

## Future Enhancements

- [ ] Machine learning for unit detection
- [ ] Historical trend analysis for anomaly detection
- [ ] Cross-company metric benchmarking
- [ ] Automatic metric relationship validation (e.g., Scope1+2 = Total)
- [ ] Support for regional/temporal unit differences
- [ ] Custom metric definitions per company
- [ ] Confidence score improvement over time

## Examples from Real Reports

### Example 1: Unit Conversion

**Input from Report:**
```
"Our Scope 1 emissions were 250,000 metric tons of CO2e"
```

**Extraction:**
```json
{
  "name": "scope 1",
  "value": 250000,
  "unit": "metric tons CO2e",
  "confidence": 0.95
}
```

**Normalization:**
```json
{
  "id": "scope1",
  "value": 250,
  "unit": "kt CO2e",
  "originalValue": 250000,
  "originalUnit": "metric tons CO2e",
  "dataQuality": "high"
}
```

### Example 2: Missing Units

**Input from Report:**
```
"Renewable energy: 62"
```

**Extraction:**
```json
{
  "name": "renewable energy",
  "value": 62,
  "unit": null,
  "confidence": 0.7
}
```

**Normalization:**
```json
{
  "id": "renewable_energy_pct",
  "value": 62,
  "unit": "%",
  "warnings": ["Unit not specified, assumed %"],
  "dataQuality": "medium"
}
```

### Example 3: Alias Recognition

**Input from Report:**
```
"Direct GHG emissions from operations: 105 kt CO2-equivalent"
```

**Extraction:**
```json
{
  "name": "direct ghg emissions",
  "value": 105,
  "unit": "kt CO2e",
  "confidence": 0.9
}
```

**Normalization:**
```json
{
  "id": "scope1",
  "name": "Scope 1 Emissions",
  "value": 105,
  "unit": "kt CO2e",
  "dataQuality": "high"
}
```

