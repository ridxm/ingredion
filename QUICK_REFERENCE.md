# Quick Reference - Metric Normalization

## The Problem You Asked About

> "There's many metrics. Some might have it, some might not. The units may not align, so you may have to normalize so there's consistency across data."

## The Solution

A complete normalization system that automatically:
1. ✅ Detects units in reports
2. ✅ Converts to standard units
3. ✅ Handles missing metrics gracefully
4. ✅ Recognizes different naming variations
5. ✅ Validates data quality
6. ✅ Scores reliability (0-100)

## How It Works (Simple)

```
Company A Report: "Direct emissions: 250,000 metric tons CO2e"
Company B Report: "Scope 1: 250 kt CO2e"
Company C Report: "Scope1 GHG: 0.25 MT CO2e"
       ↓
  [AI Extraction + Normalization]
       ↓
All three stored as: scope1 = 250 kt CO2e
```

## What Gets Normalized

### Units
- **Emissions**: kt, t, MT, metric tons, kg → Standard: kt CO2e
- **Energy**: GWh, MWh, kWh, TJ, GJ → Standard: GWh
- **Water**: m³, ML, GL, L, gallons → Standard: million m³
- **Percentages**: 0.62, 62%, "62 percent" → Standard: 62%

### Names
- "Scope 1" = "Direct Emissions" = "Scope 1 GHG" → scope1
- "Renewable %" = "Clean Energy" = "Green Power" → renewable_energy_pct
- "Water Intensity" = "Water per ton" = "Specific water use" → water_intensity

### Missing Data
- Calculates totals from parts (Scope1 + Scope2 = Total)
- Estimates complementary values (Recycled% = 100 - Landfill%)
- Marks missing required metrics as warnings

## Quick Usage

### For Uploading Reports
1. Upload PDF as normal
2. System normalizes automatically
3. Check quality score on dashboard
4. Done!

### For Viewing Results
**Dashboard**: Quality score card shows overall health
**Data Quality Page**: Detailed metric-by-metric analysis

### For Understanding Quality Scores
- **90-100**: Excellent - Use confidently
- **80-89**: Good - Minor conversions done
- **70-79**: Fair - Some warnings
- **60-69**: Moderate - Review recommended
- **<60**: Poor - Manual check needed

## Configuration Files

### `lib/metric-config.ts`
Defines all standard metrics, units, and conversions

### `lib/metric-normalizer.ts`
Does the actual normalization work

## Adding New Metrics (Developers)

Add to `lib/metric-config.ts`:
```typescript
biodiversity: {
  id: "biodiversity",
  name: "Biodiversity Score",
  standardUnit: "score",
  aliases: ["biodiversity", "bio score", "nature score"],
  unitConversions: { "score": 1 },
  category: "environmental",
  dataType: "absolute",
  required: false
}
```

That's it! AI will now extract it automatically.

## Real Example

### Input PDF:
```
"Ingredion achieved 105,000 metric tons of Scope 1 emissions
and 235 kt CO2e of Scope 2 emissions. Renewable energy was 62%."
```

### Normalized Output:
```json
{
  "scope1": 105,              // Converted: 105,000 tons → 105 kt
  "scope2": 235,              // Already in kt
  "totalEmissions": 340,      // Calculated
  "renewable_energy_pct": 62  // Already normalized
}
```

### Quality Report:
```
Score: 92 (Excellent)
Warnings:
  - Converted Scope 1 from metric tons to kt
  - Calculated total from Scope 1+2
Metrics: 10 extracted, 9 high quality, 1 medium
```

## Key Benefits

✅ **Automatic**: No manual unit conversions needed
✅ **Consistent**: All data in same units
✅ **Transparent**: Every conversion logged
✅ **Quality-scored**: Know how reliable data is
✅ **Flexible**: Handles missing data gracefully

## Documentation

- **Full Technical Docs**: `NORMALIZATION.md`
- **Executive Summary**: `NORMALIZATION_SUMMARY.md`
- **Change Log**: `UPDATE_LOG.md`
- **This Guide**: `QUICK_REFERENCE.md`

## Support

Issue: Metric not recognized
→ Add alias to `metric-config.ts`

Issue: Wrong unit conversion
→ Check `unitConversions` in metric definition

Issue: Low quality score
→ Check Data Quality page for specific warnings

## Status

✅ **Production Ready**

Upload reports now - normalization happens automatically!

