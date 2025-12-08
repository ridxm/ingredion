/**
 * Metric Configuration and Normalization Rules
 * 
 * This file defines:
 * - Standard metric definitions
 * - Unit conversions
 * - Metric aliases (different names for same metric)
 * - Validation rules
 */

export interface MetricDefinition {
  id: string
  name: string
  standardUnit: string
  aliases: string[]
  unitConversions: Record<string, number>
  category: "emissions" | "energy" | "water" | "waste" | "social" | "governance"
  dataType: "absolute" | "intensity" | "percentage"
  required: boolean
  validationRules?: {
    min?: number
    max?: number
    mustBePositive?: boolean
  }
}

/**
 * Standard ESG Metrics Configuration
 */
export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  // EMISSIONS METRICS
  scope1: {
    id: "scope1",
    name: "Scope 1 Emissions",
    standardUnit: "kt CO2e",
    aliases: [
      "scope 1",
      "scope1",
      "direct emissions",
      "scope 1 ghg",
      "scope 1 co2",
      "direct ghg emissions",
    ],
    unitConversions: {
      "kt CO2e": 1,
      "t CO2e": 0.001,
      "MT CO2e": 1000,
      "kg CO2e": 0.000001,
      "tons CO2e": 0.001,
      "metric tons CO2e": 0.001,
      "tonnes CO2e": 0.001,
    },
    category: "emissions",
    dataType: "absolute",
    required: true,
    validationRules: { min: 0 },
  },

  scope2: {
    id: "scope2",
    name: "Scope 2 Emissions",
    standardUnit: "kt CO2e",
    aliases: [
      "scope 2",
      "scope2",
      "indirect emissions",
      "scope 2 ghg",
      "scope 2 co2",
      "purchased electricity emissions",
      "location-based scope 2",
      "market-based scope 2",
    ],
    unitConversions: {
      "kt CO2e": 1,
      "t CO2e": 0.001,
      "MT CO2e": 1000,
      "kg CO2e": 0.000001,
      "tons CO2e": 0.001,
      "metric tons CO2e": 0.001,
      "tonnes CO2e": 0.001,
    },
    category: "emissions",
    dataType: "absolute",
    required: true,
    validationRules: { min: 0 },
  },

  scope3: {
    id: "scope3",
    name: "Scope 3 Emissions",
    standardUnit: "kt CO2e",
    aliases: [
      "scope 3",
      "scope3",
      "value chain emissions",
      "scope 3 ghg",
      "supply chain emissions",
      "upstream and downstream emissions",
    ],
    unitConversions: {
      "kt CO2e": 1,
      "t CO2e": 0.001,
      "MT CO2e": 1000,
      "kg CO2e": 0.000001,
      "tons CO2e": 0.001,
      "metric tons CO2e": 0.001,
      "tonnes CO2e": 0.001,
    },
    category: "emissions",
    dataType: "absolute",
    required: false,
    validationRules: { min: 0 },
  },

  totalEmissions: {
    id: "totalEmissions",
    name: "Total GHG Emissions",
    standardUnit: "kt CO2e",
    aliases: [
      "total emissions",
      "total ghg",
      "total co2",
      "total greenhouse gas",
      "scope 1+2",
      "scope 1+2+3",
      "combined emissions",
    ],
    unitConversions: {
      "kt CO2e": 1,
      "t CO2e": 0.001,
      "MT CO2e": 1000,
      "kg CO2e": 0.000001,
      "tons CO2e": 0.001,
      "metric tons CO2e": 0.001,
      "tonnes CO2e": 0.001,
    },
    category: "emissions",
    dataType: "absolute",
    required: true,
    validationRules: { min: 0 },
  },

  emissionsIntensity: {
    id: "emissionsIntensity",
    name: "Emissions Intensity",
    standardUnit: "kg CO2e/ton",
    aliases: [
      "emission intensity",
      "carbon intensity",
      "ghg intensity",
      "emissions per ton",
      "emissions per unit",
    ],
    unitConversions: {
      "kg CO2e/ton": 1,
      "kg CO2e/t": 1,
      "t CO2e/ton": 1000,
      "kg CO2e/kg": 1000,
      "g CO2e/kg": 1,
    },
    category: "emissions",
    dataType: "intensity",
    required: false,
    validationRules: { min: 0 },
  },

  // ENERGY METRICS
  renewable_energy_pct: {
    id: "renewable_energy_pct",
    name: "Renewable Energy Percentage",
    standardUnit: "%",
    aliases: [
      "renewable energy",
      "renewable %",
      "clean energy",
      "green energy",
      "renewable electricity",
      "renewable power percentage",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100, // 0.62 -> 62%
      "fraction": 100,
    },
    category: "energy",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  totalEnergyConsumption: {
    id: "totalEnergyConsumption",
    name: "Total Energy Consumption",
    standardUnit: "GWh",
    aliases: [
      "energy consumption",
      "total energy",
      "energy use",
      "electricity consumption",
    ],
    unitConversions: {
      "GWh": 1,
      "MWh": 0.001,
      "kWh": 0.000001,
      "TJ": 0.2778,
      "GJ": 0.0002778,
    },
    category: "energy",
    dataType: "absolute",
    required: false,
    validationRules: { min: 0 },
  },

  // WATER METRICS
  water_intensity: {
    id: "water_intensity",
    name: "Water Intensity",
    standardUnit: "m³/t",
    aliases: [
      "water intensity",
      "water use intensity",
      "water per ton",
      "specific water consumption",
    ],
    unitConversions: {
      "m³/t": 1,
      "m³/ton": 1,
      "L/t": 0.001,
      "L/ton": 0.001,
      "L/kg": 1,
      "m³/kg": 1000,
      "gal/ton": 0.00378541,
    },
    category: "water",
    dataType: "intensity",
    required: false,
    validationRules: { min: 0 },
  },

  waterWithdrawal: {
    id: "waterWithdrawal",
    name: "Water Withdrawal",
    standardUnit: "million m³",
    aliases: [
      "water withdrawal",
      "water intake",
      "total water use",
      "water consumption",
    ],
    unitConversions: {
      "million m³": 1,
      "m³": 0.000001,
      "ML": 0.001,
      "GL": 1,
      "thousand m³": 0.001,
    },
    category: "water",
    dataType: "absolute",
    required: false,
    validationRules: { min: 0 },
  },

  waterRecycled: {
    id: "waterRecycled",
    name: "Water Recycled %",
    standardUnit: "%",
    aliases: [
      "water recycling",
      "water reuse",
      "recycled water",
      "water recycled percentage",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "water",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  // WASTE METRICS
  waste_landfill_pct: {
    id: "waste_landfill_pct",
    name: "Waste to Landfill %",
    standardUnit: "%",
    aliases: [
      "waste to landfill",
      "landfill waste",
      "waste disposal",
      "landfill percentage",
      "non-recycled waste",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "waste",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  wasteGenerated: {
    id: "wasteGenerated",
    name: "Total Waste Generated",
    standardUnit: "kt",
    aliases: [
      "waste generated",
      "total waste",
      "waste production",
    ],
    unitConversions: {
      "kt": 1,
      "t": 0.001,
      "MT": 1000,
      "kg": 0.000001,
      "tons": 0.001,
      "metric tons": 0.001,
    },
    category: "waste",
    dataType: "absolute",
    required: false,
    validationRules: { min: 0 },
  },

  wasteRecycled: {
    id: "wasteRecycled",
    name: "Waste Recycled %",
    standardUnit: "%",
    aliases: [
      "waste recycling",
      "recycling rate",
      "waste diverted",
      "waste recovery",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "waste",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  // SOCIAL METRICS
  employeeTurnover: {
    id: "employeeTurnover",
    name: "Employee Turnover Rate",
    standardUnit: "%",
    aliases: [
      "turnover",
      "employee turnover",
      "attrition",
      "employee attrition rate",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "social",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  diversityPct: {
    id: "diversityPct",
    name: "Workforce Diversity %",
    standardUnit: "%",
    aliases: [
      "diversity",
      "workforce diversity",
      "employee diversity",
      "gender diversity",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "social",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  safetyIncidents: {
    id: "safetyIncidents",
    name: "Safety Incident Rate",
    standardUnit: "per 200,000 hours",
    aliases: [
      "trir",
      "total recordable incident rate",
      "safety incidents",
      "injury rate",
      "accident rate",
    ],
    unitConversions: {
      "per 200,000 hours": 1,
      "per million hours": 0.2,
      "per 100 employees": 1,
    },
    category: "social",
    dataType: "intensity",
    required: false,
    validationRules: { min: 0 },
  },

  womenInLeadership: {
    id: "womenInLeadership",
    name: "Women in Leadership %",
    standardUnit: "%",
    aliases: [
      "women in leadership",
      "female leadership",
      "women executives",
      "female managers",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "social",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },

  // GOVERNANCE METRICS
  boardIndependence: {
    id: "boardIndependence",
    name: "Board Independence %",
    standardUnit: "%",
    aliases: [
      "board independence",
      "independent directors",
      "independent board members",
    ],
    unitConversions: {
      "%": 1,
      "percent": 1,
      "decimal": 100,
    },
    category: "governance",
    dataType: "percentage",
    required: false,
    validationRules: { min: 0, max: 100 },
  },
}

/**
 * Get metric definition by name or alias
 */
export function getMetricDefinition(name: string): MetricDefinition | null {
  const normalizedName = name.toLowerCase().trim()

  // Check direct ID match
  if (METRIC_DEFINITIONS[normalizedName]) {
    return METRIC_DEFINITIONS[normalizedName]
  }

  // Check aliases
  for (const [id, definition] of Object.entries(METRIC_DEFINITIONS)) {
    if (definition.aliases.some((alias) => alias.toLowerCase() === normalizedName)) {
      return definition
    }
  }

  return null
}

/**
 * Convert value to standard unit
 */
export function convertToStandardUnit(
  value: number,
  fromUnit: string,
  metricId: string
): number | null {
  const definition = METRIC_DEFINITIONS[metricId]
  if (!definition) return null

  const normalizedUnit = fromUnit.toLowerCase().trim()
  
  // Find conversion factor
  for (const [unit, factor] of Object.entries(definition.unitConversions)) {
    if (unit.toLowerCase() === normalizedUnit) {
      return value * factor
    }
  }

  // If unit not found, assume it's already in standard unit
  return value
}

/**
 * Validate metric value
 */
export function validateMetricValue(
  value: number,
  metricId: string
): { valid: boolean; error?: string } {
  const definition = METRIC_DEFINITIONS[metricId]
  if (!definition) {
    return { valid: true } // Unknown metrics pass validation
  }

  const rules = definition.validationRules
  if (!rules) {
    return { valid: true }
  }

  if (rules.min !== undefined && value < rules.min) {
    return { valid: false, error: `Value ${value} is below minimum ${rules.min}` }
  }

  if (rules.max !== undefined && value > rules.max) {
    return { valid: false, error: `Value ${value} exceeds maximum ${rules.max}` }
  }

  if (rules.mustBePositive && value < 0) {
    return { valid: false, error: `Value must be positive` }
  }

  return { valid: true }
}

