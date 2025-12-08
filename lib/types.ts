// ESG Data Types
export interface ESGReport {
  company: string
  year: number
  reportDate?: string
  reportUrl?: string
  metrics: ESGMetrics
  frameworks: FrameworkCoverage
  targets?: Target[]
  materiality?: MaterialityItem[]
  insights?: Insight[]
  dataQuality?: DataQuality
}

export interface DataQuality {
  score: number
  warnings: string[]
  missingRequiredMetrics: string[]
  metricDetails: {
    id: string
    name: string
    value: number
    unit: string
    originalValue: number
    originalUnit?: string
    confidence: number
    dataQuality: "high" | "medium" | "low"
    warnings: string[]
  }[]
}

export interface ESGMetrics {
  // Emissions
  scope1?: number
  scope2?: number
  scope3?: number
  totalEmissions?: number
  emissionsIntensity?: number
  
  // Energy
  renewable_energy_pct?: number
  totalEnergyConsumption?: number
  
  // Water
  water_intensity?: number
  waterWithdrawal?: number
  waterRecycled?: number
  
  // Waste
  waste_landfill_pct?: number
  wasteGenerated?: number
  wasteRecycled?: number
  
  // Social
  employeeTurnover?: number
  diversityPct?: number
  safetyIncidents?: number
  
  // Governance
  boardIndependence?: number
  womenInLeadership?: number
  
  // Other custom metrics
  [key: string]: number | undefined
}

export interface FrameworkCoverage {
  GRI?: number
  TCFD?: number
  SBTi?: number
  SDG?: number
  CDP?: number
  SASB?: number
  [key: string]: number | undefined
}

export interface Target {
  name: string
  baseline: number
  target: number
  deadline: number
  current: number
  progress: number
  category: string
}

export interface MaterialityItem {
  topic: string
  importance: number
  category: string
  stakeholderPriority?: number
  businessImpact?: number
}

export interface Insight {
  id: string
  title: string
  description: string
  category: string
  severity: "positive" | "alert" | "warning" | "action"
  tags: string[]
  generatedAt: string
}

export interface CompanyData {
  name: string
  industry: string
  reports: ESGReport[]
  lastUpdated: string
}

