import {
  METRIC_DEFINITIONS,
  getMetricDefinition,
  convertToStandardUnit,
  validateMetricValue,
  type MetricDefinition,
} from "./metric-config"

export interface RawMetric {
  name: string
  value: number
  unit?: string
  confidence?: number
}

export interface NormalizedMetric {
  id: string
  name: string
  value: number
  unit: string
  originalValue: number
  originalUnit?: string
  confidence: number
  dataQuality: "high" | "medium" | "low"
  warnings: string[]
}

export interface NormalizationResult {
  metrics: Record<string, number>
  metricDetails: NormalizedMetric[]
  dataQualityScore: number
  warnings: string[]
  missingRequiredMetrics: string[]
}

/**
 * Normalize extracted metrics to standard format
 */
export function normalizeMetrics(rawMetrics: RawMetric[]): NormalizationResult {
  const normalizedMetrics: Record<string, number> = {}
  const metricDetails: NormalizedMetric[] = []
  const warnings: string[] = []
  const processedMetricIds = new Set<string>()

  // Process each raw metric
  for (const raw of rawMetrics) {
    const result = normalizeSingleMetric(raw)

    if (result) {
      // Avoid duplicates - keep the one with highest confidence
      if (processedMetricIds.has(result.id)) {
        const existing = metricDetails.find((m) => m.id === result.id)
        if (existing && existing.confidence < result.confidence) {
          // Replace with higher confidence value
          normalizedMetrics[result.id] = result.value
          const index = metricDetails.indexOf(existing)
          metricDetails[index] = result
          warnings.push(
            `Duplicate metric '${result.name}' found. Using value with higher confidence.`
          )
        }
      } else {
        normalizedMetrics[result.id] = result.value
        metricDetails.push(result)
        processedMetricIds.add(result.id)
      }

      // Add metric-specific warnings
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings)
      }
    } else {
      warnings.push(`Could not normalize metric: ${raw.name}`)
    }
  }

  // Check for missing required metrics
  const missingRequiredMetrics: string[] = []
  for (const [id, definition] of Object.entries(METRIC_DEFINITIONS)) {
    if (definition.required && !processedMetricIds.has(id)) {
      missingRequiredMetrics.push(definition.name)
    }
  }

  // Calculate data quality score
  const dataQualityScore = calculateDataQualityScore(
    metricDetails,
    missingRequiredMetrics,
    warnings
  )

  // Auto-calculate derived metrics
  calculateDerivedMetrics(normalizedMetrics, warnings)

  return {
    metrics: normalizedMetrics,
    metricDetails,
    dataQualityScore,
    warnings,
    missingRequiredMetrics,
  }
}

/**
 * Normalize a single metric
 */
function normalizeSingleMetric(raw: RawMetric): NormalizedMetric | null {
  // Try to find metric definition - multiple matching strategies
  let definition = getMetricDefinition(raw.name)
  
  // Also try matching by ID directly (case-insensitive, various formats)
  if (!definition) {
    const normalizedName = raw.name.toLowerCase().replace(/[\s_-]+/g, "")
    for (const [id, def] of Object.entries(METRIC_DEFINITIONS)) {
      const normalizedId = id.toLowerCase().replace(/[\s_-]+/g, "")
      if (normalizedId === normalizedName || 
          normalizedId.includes(normalizedName) ||
          normalizedName.includes(normalizedId)) {
        definition = def
        break
      }
    }
  }
  
  // Try partial word matching
  if (!definition) {
    const words = raw.name.toLowerCase().split(/[\s_-]+/).filter(w => w.length > 3)
    for (const [id, def] of Object.entries(METRIC_DEFINITIONS)) {
      const idWords = id.toLowerCase().split(/(?=[A-Z])/).map(w => w.toLowerCase())
      const matchCount = words.filter(w => idWords.some(iw => iw.includes(w) || w.includes(iw))).length
      if (matchCount >= Math.min(2, words.length)) {
        definition = def
        break
      }
    }
  }

  if (!definition) {
    // Unknown metric - pass through but mark as needing review
    return {
      id: raw.name.toLowerCase().replace(/[\s-]+/g, "_"),
      name: raw.name,
      value: raw.value,
      unit: raw.unit || "unknown",
      originalValue: raw.value,
      originalUnit: raw.unit,
      confidence: raw.confidence || 0.7,
      dataQuality: "medium",
      warnings: [`New metric type: ${raw.name} - needs categorization`],
    }
  }

  const warnings: string[] = []

  // Convert to standard unit
  let normalizedValue = raw.value
  if (raw.unit) {
    const converted = convertToStandardUnit(raw.value, raw.unit, definition.id)
    if (converted !== null) {
      normalizedValue = converted
      if (raw.unit.toLowerCase() !== definition.standardUnit.toLowerCase()) {
        warnings.push(
          `Converted ${raw.name} from ${raw.unit} to ${definition.standardUnit}`
        )
      }
    } else {
      warnings.push(
        `Unknown unit '${raw.unit}' for ${raw.name}. Assuming ${definition.standardUnit}.`
      )
    }
  }

  // Round to appropriate precision
  normalizedValue = roundToPrecision(normalizedValue, definition)

  // Validate
  const validation = validateMetricValue(normalizedValue, definition.id)
  if (!validation.valid) {
    warnings.push(`Validation warning for ${raw.name}: ${validation.error}`)
  }

  // Determine data quality
  const dataQuality = determineDataQuality(raw, definition, warnings)

  return {
    id: definition.id,
    name: definition.name,
    value: normalizedValue,
    unit: definition.standardUnit,
    originalValue: raw.value,
    originalUnit: raw.unit,
    confidence: raw.confidence || 0.8,
    dataQuality,
    warnings,
  }
}

/**
 * Calculate derived metrics from available data
 */
function calculateDerivedMetrics(
  metrics: Record<string, number>,
  warnings: string[]
): void {
  // Calculate total emissions if not present but components are
  if (!metrics.totalEmissions) {
    const scope1 = metrics.scope1 || 0
    const scope2 = metrics.scope2 || 0
    const scope3 = metrics.scope3 || 0

    if (scope1 > 0 || scope2 > 0) {
      // Use Scope 1+2 if no Scope 3
      metrics.totalEmissions = scope1 + scope2 + scope3
      warnings.push(
        `Calculated total emissions (${metrics.totalEmissions} kt CO2e) from individual scopes`
      )
    }
  }

  // Calculate waste to landfill from recycling rate
  if (!metrics.waste_landfill_pct && metrics.wasteRecycled) {
    metrics.waste_landfill_pct = 100 - metrics.wasteRecycled
    warnings.push(
      `Calculated waste to landfill (${metrics.waste_landfill_pct}%) from recycling rate`
    )
  }

  // Calculate recycling rate from waste to landfill
  if (!metrics.wasteRecycled && metrics.waste_landfill_pct) {
    metrics.wasteRecycled = 100 - metrics.waste_landfill_pct
    warnings.push(
      `Calculated waste recycled (${metrics.wasteRecycled}%) from landfill percentage`
    )
  }

  // Validate calculated totals
  if (metrics.totalEmissions && metrics.scope1 && metrics.scope2) {
    const calculatedTotal = metrics.scope1 + metrics.scope2 + (metrics.scope3 || 0)
    const difference = Math.abs(metrics.totalEmissions - calculatedTotal)
    const percentDiff = (difference / metrics.totalEmissions) * 100

    if (percentDiff > 5) {
      warnings.push(
        `Total emissions (${metrics.totalEmissions}) differs from sum of scopes (${calculatedTotal}) by ${percentDiff.toFixed(1)}%`
      )
    }
  }
}

/**
 * Determine data quality level
 */
function determineDataQuality(
  raw: RawMetric,
  definition: MetricDefinition,
  warnings: string[]
): "high" | "medium" | "low" {
  let qualityScore = 100

  // Penalize for missing unit
  if (!raw.unit) {
    qualityScore -= 20
  }

  // Penalize for low confidence
  const confidence = raw.confidence || 0.8
  if (confidence < 0.5) {
    qualityScore -= 30
  } else if (confidence < 0.7) {
    qualityScore -= 15
  }

  // Penalize for warnings
  qualityScore -= warnings.length * 10

  // Penalize for non-standard units
  if (raw.unit && raw.unit.toLowerCase() !== definition.standardUnit.toLowerCase()) {
    qualityScore -= 5
  }

  if (qualityScore >= 80) return "high"
  if (qualityScore >= 60) return "medium"
  return "low"
}

/**
 * Calculate overall data quality score
 */
function calculateDataQualityScore(
  metrics: NormalizedMetric[],
  missingRequired: string[],
  warnings: string[]
): number {
  if (metrics.length === 0) return 0

  let score = 100

  // Penalize for missing required metrics
  score -= missingRequired.length * 15

  // Penalize based on individual metric quality
  const avgQualityScore =
    metrics.reduce((sum, m) => {
      const qScore = m.dataQuality === "high" ? 100 : m.dataQuality === "medium" ? 70 : 40
      return sum + qScore
    }, 0) / metrics.length

  score = score * 0.6 + avgQualityScore * 0.4

  // Penalize for warnings
  score -= Math.min(warnings.length * 2, 20)

  return Math.max(0, Math.min(100, score))
}

/**
 * Round to appropriate precision based on metric type
 */
function roundToPrecision(value: number, definition: MetricDefinition): number {
  // Percentages: 1 decimal place
  if (definition.dataType === "percentage") {
    return Math.round(value * 10) / 10
  }

  // Intensity metrics: 2 decimal places
  if (definition.dataType === "intensity") {
    return Math.round(value * 100) / 100
  }

  // Absolute values: round based on magnitude
  if (value < 1) {
    return Math.round(value * 100) / 100 // 2 decimals for small values
  } else if (value < 100) {
    return Math.round(value * 10) / 10 // 1 decimal
  } else {
    return Math.round(value) // whole numbers for large values
  }
}

/**
 * Export metric definitions for use in AI prompts
 */
export function getMetricDefinitionsForPrompt(): string {
  const metricList = Object.values(METRIC_DEFINITIONS)
    .map((def) => {
      return `- ${def.name} (${def.id}): Unit = ${def.standardUnit}, Aliases = [${def.aliases.slice(0, 3).join(", ")}]`
    })
    .join("\n")

  return metricList
}

/**
 * Detect potential unit from text context
 */
export function detectUnitFromContext(metricName: string, context: string): string | undefined {
  const definition = getMetricDefinition(metricName)
  if (!definition) return undefined

  const lowerContext = context.toLowerCase()

  // Check for each known unit
  for (const unit of Object.keys(definition.unitConversions)) {
    const lowerUnit = unit.toLowerCase()
    if (lowerContext.includes(lowerUnit)) {
      return unit
    }
  }

  return undefined
}

