/**
 * COMPREHENSIVE ESG Metric Configuration
 * 
 * Contains ALL possible sustainability metrics that might appear in reports
 * Null handling: metrics not found will be tracked as "not extracted"
 */

export interface MetricDefinition {
  id: string
  name: string
  standardUnit: string
  aliases: string[]
  unitConversions: Record<string, number>
  category: "emissions" | "energy" | "water" | "waste" | "biodiversity" | "packaging" | "social" | "safety" | "diversity" | "training" | "community" | "supply_chain" | "governance" | "agriculture" | "product"
  dataType: "absolute" | "intensity" | "percentage" | "count" | "currency" | "ratio"
  required: boolean
  description?: string
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  
  // ═══════════════════════════════════════════════════════════════════
  // EMISSIONS / CARBON METRICS
  // ═══════════════════════════════════════════════════════════════════
  
  carbonReductionPct: {
    id: "carbonReductionPct",
    name: "Carbon Reduction (Scope 1+2) %",
    standardUnit: "%",
    aliases: [
      "carbon reduction", "ghg reduction", "emission reduction", "emissions reduction",
      "co2 reduction", "greenhouse gas reduction", "carbon decrease",
      "scope 1 and 2 reduction", "scope 1+2 reduction", "combined scope reduction",
      "reduced carbon", "reduced emissions", "cut carbon", "lowered emissions",
      "absolute reduction in carbon", "reduction in carbon emissions",
      "emissions down", "carbon down", "percent reduction in emissions",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "emissions",
    dataType: "percentage",
    required: true,
    description: "Year-over-year reduction in Scope 1+2 emissions"
  },

  carbonAbsolute: {
    id: "carbonAbsolute",
    name: "Total Carbon Emissions (Scope 1+2)",
    standardUnit: "metric tons CO2e",
    aliases: [
      "carbon emissions", "total emissions", "ghg emissions", "greenhouse gas emissions",
      "scope 1 and 2 emissions", "scope 1+2 emissions", "combined emissions",
      "carbon footprint", "co2 emissions", "co2e emissions", "total carbon",
      "absolute emissions", "gross emissions", "operational emissions",
    ],
    unitConversions: {
      "metric tons CO2e": 1, "metric tons": 1, "MT CO2e": 1, "MTCO2e": 1,
      "t CO2e": 1, "tonnes CO2e": 1, "tons CO2e": 1,
      "kt CO2e": 1000, "thousand metric tons": 1000,
      "million metric tons": 1000000, "MMT CO2e": 1000000,
    },
    category: "emissions",
    dataType: "absolute",
    required: true,
  },

  scope1: {
    id: "scope1",
    name: "Scope 1 Emissions",
    standardUnit: "metric tons CO2e",
    aliases: [
      "scope 1", "scope one", "direct emissions", "direct ghg",
      "scope 1 ghg", "scope 1 carbon", "onsite emissions",
      "facility direct emissions", "combustion emissions",
    ],
    unitConversions: {
      "metric tons CO2e": 1, "kt CO2e": 1000, "t CO2e": 1, "tonnes": 1,
    },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  scope2: {
    id: "scope2",
    name: "Scope 2 Emissions",
    standardUnit: "metric tons CO2e",
    aliases: [
      "scope 2", "scope two", "indirect emissions", "purchased electricity emissions",
      "purchased energy emissions", "scope 2 ghg", "electricity emissions",
      "location-based scope 2", "market-based scope 2",
    ],
    unitConversions: {
      "metric tons CO2e": 1, "kt CO2e": 1000, "t CO2e": 1, "tonnes": 1,
    },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  scope3: {
    id: "scope3",
    name: "Scope 3 Emissions",
    standardUnit: "metric tons CO2e",
    aliases: [
      "scope 3", "scope three", "value chain emissions", "supply chain emissions",
      "upstream emissions", "downstream emissions", "indirect value chain",
      "scope 3 ghg", "scope 3 total",
    ],
    unitConversions: {
      "metric tons CO2e": 1, "kt CO2e": 1000, "t CO2e": 1, "MMT": 1000000,
    },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  scope3ReductionPct: {
    id: "scope3ReductionPct",
    name: "Scope 3 Reduction %",
    standardUnit: "%",
    aliases: [
      "scope 3 reduction", "scope three reduction", "value chain reduction",
      "supply chain emissions reduction", "reduced scope 3",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "emissions",
    dataType: "percentage",
    required: false,
  },

  emissionsIntensity: {
    id: "emissionsIntensity",
    name: "Emissions Intensity",
    standardUnit: "kg CO2e per unit",
    aliases: [
      "emissions intensity", "carbon intensity", "ghg intensity",
      "emission intensity", "co2 per unit", "carbon per ton",
      "emissions per revenue", "carbon per dollar",
    ],
    unitConversions: {
      "kg CO2e per unit": 1, "t CO2e per unit": 1000, "g CO2e per unit": 0.001,
    },
    category: "emissions",
    dataType: "intensity",
    required: false,
  },

  biogenicEmissions: {
    id: "biogenicEmissions",
    name: "Biogenic Emissions",
    standardUnit: "metric tons CO2e",
    aliases: ["biogenic", "biogenic carbon", "biogenic co2"],
    unitConversions: { "metric tons CO2e": 1, "kt CO2e": 1000 },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENERGY METRICS
  // ═══════════════════════════════════════════════════════════════════

  totalEnergy: {
    id: "totalEnergy",
    name: "Total Energy Consumption",
    standardUnit: "GWh",
    aliases: [
      "total energy", "energy consumption", "energy use", "energy usage",
      "energy consumed", "electricity consumption", "power consumption",
      "operational energy", "annual energy",
    ],
    unitConversions: {
      "GWh": 1, "MWh": 0.001, "kWh": 0.000001, "TWh": 1000,
      "TJ": 0.2778, "GJ": 0.0002778, "PJ": 277.8,
    },
    category: "energy",
    dataType: "absolute",
    required: false,
  },

  renewableElectricity: {
    id: "renewableElectricity",
    name: "Renewable Electricity %",
    standardUnit: "%",
    aliases: [
      "renewable electricity", "renewable energy", "renewable power",
      "green electricity", "clean energy", "renewables",
      "renewable sourced", "RE100", "100% renewable",
      "solar", "wind", "hydro",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "energy",
    dataType: "percentage",
    required: false,
  },

  energyIntensity: {
    id: "energyIntensity",
    name: "Energy Intensity",
    standardUnit: "MWh per unit",
    aliases: [
      "energy intensity", "energy per unit", "energy efficiency",
      "specific energy consumption", "energy per revenue",
    ],
    unitConversions: { "MWh per unit": 1, "GJ per unit": 0.2778 },
    category: "energy",
    dataType: "intensity",
    required: false,
  },

  solarCapacity: {
    id: "solarCapacity",
    name: "Solar Capacity",
    standardUnit: "MW",
    aliases: ["solar capacity", "solar power", "solar installed", "PV capacity"],
    unitConversions: { "MW": 1, "kW": 0.001, "GW": 1000 },
    category: "energy",
    dataType: "absolute",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // WATER METRICS
  // ═══════════════════════════════════════════════════════════════════

  waterWithdrawal: {
    id: "waterWithdrawal",
    name: "Water Withdrawal",
    standardUnit: "cubic meters",
    aliases: [
      "water withdrawal", "water withdrawn", "water use", "water usage",
      "water consumption", "total water", "water intake",
      "freshwater withdrawal", "global water use",
    ],
    unitConversions: {
      "cubic meters": 1, "m³": 1, "m3": 1,
      "ML": 1000, "megaliters": 1000, "GL": 1000000,
      "liters": 0.001, "L": 0.001,
      "gallons": 0.00378541, "million gallons": 3785.41,
    },
    category: "water",
    dataType: "absolute",
    required: false,
  },

  waterRecycled: {
    id: "waterRecycled",
    name: "Water Recycled/Reused %",
    standardUnit: "%",
    aliases: [
      "water recycled", "water reused", "recycled water", "water recycling",
      "water reuse", "reclaimed water", "water recirculated",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "water",
    dataType: "percentage",
    required: false,
  },

  waterIntensity: {
    id: "waterIntensity",
    name: "Water Intensity",
    standardUnit: "L per unit",
    aliases: [
      "water intensity", "water ratio", "water efficiency",
      "water per unit", "specific water consumption",
      "liters per liter", "water use ratio",
    ],
    unitConversions: { "L per unit": 1, "m³ per unit": 1000 },
    category: "water",
    dataType: "intensity",
    required: false,
  },

  waterDischarge: {
    id: "waterDischarge",
    name: "Water Discharge",
    standardUnit: "cubic meters",
    aliases: [
      "water discharge", "wastewater", "effluent", "water released",
      "discharged water", "water output",
    ],
    unitConversions: { "cubic meters": 1, "m³": 1, "ML": 1000 },
    category: "water",
    dataType: "absolute",
    required: false,
  },

  waterStressAreas: {
    id: "waterStressAreas",
    name: "Water from Stress Areas %",
    standardUnit: "%",
    aliases: [
      "water stress", "high stress water", "water scarce areas",
      "water risk areas", "stressed watersheds",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "water",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // WASTE METRICS
  // ═══════════════════════════════════════════════════════════════════

  totalWaste: {
    id: "totalWaste",
    name: "Total Waste Generated",
    standardUnit: "metric tons",
    aliases: [
      "total waste", "waste generated", "solid waste", "waste production",
      "waste output", "annual waste", "operational waste",
    ],
    unitConversions: {
      "metric tons": 1, "tonnes": 1, "t": 1, "MT": 1,
      "kt": 1000, "kg": 0.001, "tons": 0.907185,
    },
    category: "waste",
    dataType: "absolute",
    required: false,
  },

  wasteLandfillAvoidance: {
    id: "wasteLandfillAvoidance",
    name: "Waste Diverted from Landfill %",
    standardUnit: "%",
    aliases: [
      "landfill avoidance", "landfill diversion", "waste diversion",
      "diverted from landfill", "zero waste to landfill", "zero landfill",
      "waste recovery", "non-landfill",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "waste",
    dataType: "percentage",
    required: false,
  },

  wasteRecycled: {
    id: "wasteRecycled",
    name: "Waste Recycled %",
    standardUnit: "%",
    aliases: [
      "waste recycled", "recycling rate", "waste recycling",
      "material recycled", "recycled waste",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "waste",
    dataType: "percentage",
    required: false,
  },

  hazardousWaste: {
    id: "hazardousWaste",
    name: "Hazardous Waste",
    standardUnit: "metric tons",
    aliases: [
      "hazardous waste", "haz waste", "dangerous waste",
      "toxic waste", "regulated waste",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "waste",
    dataType: "absolute",
    required: false,
  },

  foodWaste: {
    id: "foodWaste",
    name: "Food Waste",
    standardUnit: "metric tons",
    aliases: [
      "food waste", "food loss", "organic waste",
      "food waste reduction", "food waste prevented",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "waste",
    dataType: "absolute",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // PACKAGING METRICS
  // ═══════════════════════════════════════════════════════════════════

  recyclablePackaging: {
    id: "recyclablePackaging",
    name: "Recyclable Packaging %",
    standardUnit: "%",
    aliases: [
      "recyclable packaging", "packaging recyclable", "recyclable materials",
      "recyclable content", "packaging recyclability",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "packaging",
    dataType: "percentage",
    required: false,
  },

  recycledContent: {
    id: "recycledContent",
    name: "Recycled Content in Packaging %",
    standardUnit: "%",
    aliases: [
      "recycled content", "recycled material", "PCR content",
      "post-consumer recycled", "rPET", "recycled plastic",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "packaging",
    dataType: "percentage",
    required: false,
  },

  plasticReduction: {
    id: "plasticReduction",
    name: "Plastic Reduction %",
    standardUnit: "%",
    aliases: [
      "plastic reduction", "reduced plastic", "virgin plastic reduction",
      "plastic free", "plastic elimination",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "packaging",
    dataType: "percentage",
    required: false,
  },

  reusablePackaging: {
    id: "reusablePackaging",
    name: "Reusable Packaging %",
    standardUnit: "%",
    aliases: [
      "reusable packaging", "refillable", "returnable packaging",
      "reuse", "circular packaging",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "packaging",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // AGRICULTURE / SOURCING METRICS
  // ═══════════════════════════════════════════════════════════════════

  sustainableAgriculture: {
    id: "sustainableAgriculture",
    name: "Sustainable/Regenerative Agriculture",
    standardUnit: "acres",
    aliases: [
      "sustainable agriculture", "regenerative agriculture", "sustainable farming",
      "sustainably sourced", "regenerative farming", "sustainable crops",
      "certified sustainable", "acres of crops", "farmland",
    ],
    unitConversions: {
      "acres": 1, "hectares": 2.47105, "ha": 2.47105,
      "K acres": 1000, "million acres": 1000000,
    },
    category: "agriculture",
    dataType: "absolute",
    required: false,
  },

  sustainableSourcing: {
    id: "sustainableSourcing",
    name: "Sustainably Sourced Ingredients %",
    standardUnit: "%",
    aliases: [
      "sustainably sourced", "sustainable sourcing", "certified sourcing",
      "responsible sourcing", "ethical sourcing", "tier 1 crops",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "agriculture",
    dataType: "percentage",
    required: false,
  },

  deforestationFree: {
    id: "deforestationFree",
    name: "Deforestation-Free Sourcing %",
    standardUnit: "%",
    aliases: [
      "deforestation free", "zero deforestation", "no deforestation",
      "deforestation-free supply chain", "forest positive",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "agriculture",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // BIODIVERSITY METRICS
  // ═══════════════════════════════════════════════════════════════════

  landRestored: {
    id: "landRestored",
    name: "Land Restored/Protected",
    standardUnit: "acres",
    aliases: [
      "land restored", "habitat restored", "land protected",
      "nature positive", "biodiversity areas", "conservation",
    ],
    unitConversions: { "acres": 1, "hectares": 2.47105 },
    category: "biodiversity",
    dataType: "absolute",
    required: false,
  },

  treesPlanted: {
    id: "treesPlanted",
    name: "Trees Planted",
    standardUnit: "count",
    aliases: [
      "trees planted", "reforestation", "afforestation",
      "tree planting", "seedlings planted",
    ],
    unitConversions: { "count": 1, "million": 1000000, "thousand": 1000 },
    category: "biodiversity",
    dataType: "count",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // SAFETY METRICS
  // ═══════════════════════════════════════════════════════════════════

  trir: {
    id: "trir",
    name: "Total Recordable Incident Rate (TRIR)",
    standardUnit: "per 200,000 hours",
    aliases: [
      "trir", "total recordable incident rate", "total recordable incidence rate",
      "recordable incident rate", "safety incident rate", "injury rate",
      "employee trir", "recordable injuries", "osha recordable",
    ],
    unitConversions: { "per 200,000 hours": 1, "per million hours": 0.2 },
    category: "safety",
    dataType: "intensity",
    required: false,
  },

  ltir: {
    id: "ltir",
    name: "Lost Time Injury Rate (LTIR)",
    standardUnit: "per 200,000 hours",
    aliases: [
      "ltir", "lost time injury rate", "lost time incident rate",
      "lti rate", "days away rate", "dart rate",
    ],
    unitConversions: { "per 200,000 hours": 1, "per million hours": 0.2 },
    category: "safety",
    dataType: "intensity",
    required: false,
  },

  fatalities: {
    id: "fatalities",
    name: "Workplace Fatalities",
    standardUnit: "count",
    aliases: [
      "fatalities", "workplace fatalities", "employee fatalities",
      "contractor fatalities", "deaths", "fatal injuries",
    ],
    unitConversions: { "count": 1 },
    category: "safety",
    dataType: "count",
    required: false,
  },

  zeroInjuryFacilities: {
    id: "zeroInjuryFacilities",
    name: "Facilities with Zero Injuries %",
    standardUnit: "%",
    aliases: [
      "zero injuries", "zero injury facilities", "injury free",
      "facilities with zero injuries", "no injuries",
      "perfect safety record", "zero recordables",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "safety",
    dataType: "percentage",
    required: false,
  },

  nearMisses: {
    id: "nearMisses",
    name: "Near Misses Reported",
    standardUnit: "count",
    aliases: [
      "near misses", "near miss", "close calls",
      "hazard reports", "safety observations",
    ],
    unitConversions: { "count": 1 },
    category: "safety",
    dataType: "count",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // WORKFORCE METRICS
  // ═══════════════════════════════════════════════════════════════════

  totalEmployees: {
    id: "totalEmployees",
    name: "Total Employees",
    standardUnit: "count",
    aliases: [
      "total employees", "headcount", "workforce", "employees",
      "full time employees", "FTEs", "staff",
    ],
    unitConversions: { "count": 1, "thousand": 1000, "K": 1000 },
    category: "social",
    dataType: "count",
    required: false,
  },

  employeeTurnover: {
    id: "employeeTurnover",
    name: "Employee Turnover Rate",
    standardUnit: "%",
    aliases: [
      "turnover", "employee turnover", "turnover rate",
      "attrition", "voluntary turnover", "staff turnover",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "social",
    dataType: "percentage",
    required: false,
  },

  newHires: {
    id: "newHires",
    name: "New Hires",
    standardUnit: "count",
    aliases: [
      "new hires", "new employees", "hires", "recruitment",
      "new joiners", "hired",
    ],
    unitConversions: { "count": 1 },
    category: "social",
    dataType: "count",
    required: false,
  },

  employeeEngagement: {
    id: "employeeEngagement",
    name: "Employee Engagement Score",
    standardUnit: "%",
    aliases: [
      "employee engagement", "engagement score", "satisfaction score",
      "employee satisfaction", "engagement survey",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "social",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // DIVERSITY METRICS
  // ═══════════════════════════════════════════════════════════════════

  womenWorkforce: {
    id: "womenWorkforce",
    name: "Women in Workforce %",
    standardUnit: "%",
    aliases: [
      "women workforce", "female employees", "women employees",
      "gender diversity", "women percentage",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "diversity",
    dataType: "percentage",
    required: false,
  },

  womenLeadership: {
    id: "womenLeadership",
    name: "Women in Leadership %",
    standardUnit: "%",
    aliases: [
      "women in leadership", "female leadership", "women leaders",
      "women executives", "women managers", "women in management",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "diversity",
    dataType: "percentage",
    required: false,
  },

  womenBoard: {
    id: "womenBoard",
    name: "Women on Board %",
    standardUnit: "%",
    aliases: [
      "women on board", "female directors", "women directors",
      "board gender diversity", "female board members",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "diversity",
    dataType: "percentage",
    required: false,
  },

  ethnicDiversity: {
    id: "ethnicDiversity",
    name: "Ethnic/Racial Diversity %",
    standardUnit: "%",
    aliases: [
      "ethnic diversity", "racial diversity", "BIPOC",
      "underrepresented groups", "minority representation",
      "people of color", "diverse employees",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "diversity",
    dataType: "percentage",
    required: false,
  },

  payGap: {
    id: "payGap",
    name: "Gender Pay Gap %",
    standardUnit: "%",
    aliases: [
      "pay gap", "gender pay gap", "wage gap",
      "pay equity", "equal pay",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "diversity",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TRAINING METRICS
  // ═══════════════════════════════════════════════════════════════════

  trainingHours: {
    id: "trainingHours",
    name: "Training Hours per Employee",
    standardUnit: "hours",
    aliases: [
      "training hours", "hours of training", "learning hours",
      "development hours", "training per employee",
    ],
    unitConversions: { "hours": 1 },
    category: "training",
    dataType: "intensity",
    required: false,
  },

  trainingInvestment: {
    id: "trainingInvestment",
    name: "Training Investment",
    standardUnit: "USD",
    aliases: [
      "training investment", "training spend", "learning investment",
      "development investment", "training budget",
    ],
    unitConversions: { "USD": 1, "million USD": 1000000, "$": 1 },
    category: "training",
    dataType: "currency",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMMUNITY METRICS
  // ═══════════════════════════════════════════════════════════════════

  communityInvestment: {
    id: "communityInvestment",
    name: "Community Investment",
    standardUnit: "USD",
    aliases: [
      "community investment", "social investment", "charitable giving",
      "donations", "philanthropy", "community contributions",
    ],
    unitConversions: { "USD": 1, "million USD": 1000000, "million": 1000000 },
    category: "community",
    dataType: "currency",
    required: false,
  },

  volunteerHours: {
    id: "volunteerHours",
    name: "Employee Volunteer Hours",
    standardUnit: "hours",
    aliases: [
      "volunteer hours", "volunteering", "employee volunteering",
      "community service hours", "volunteer time",
    ],
    unitConversions: { "hours": 1, "thousand hours": 1000 },
    category: "community",
    dataType: "absolute",
    required: false,
  },

  peopleBenefited: {
    id: "peopleBenefited",
    name: "People Benefited",
    standardUnit: "count",
    aliases: [
      "people benefited", "lives impacted", "beneficiaries",
      "people reached", "community members helped",
    ],
    unitConversions: { "count": 1, "million": 1000000, "thousand": 1000 },
    category: "community",
    dataType: "count",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // SUPPLY CHAIN METRICS
  // ═══════════════════════════════════════════════════════════════════

  supplierAudits: {
    id: "supplierAudits",
    name: "Supplier Audits Conducted",
    standardUnit: "count",
    aliases: [
      "supplier audits", "audits conducted", "vendor audits",
      "supplier assessments", "supply chain audits",
    ],
    unitConversions: { "count": 1 },
    category: "supply_chain",
    dataType: "count",
    required: false,
  },

  supplierCompliance: {
    id: "supplierCompliance",
    name: "Supplier Compliance Rate %",
    standardUnit: "%",
    aliases: [
      "supplier compliance", "vendor compliance", "supplier standards",
      "supply chain compliance", "ethical suppliers",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "supply_chain",
    dataType: "percentage",
    required: false,
  },

  localSourcing: {
    id: "localSourcing",
    name: "Local Sourcing %",
    standardUnit: "%",
    aliases: [
      "local sourcing", "locally sourced", "local suppliers",
      "regional sourcing", "local procurement",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "supply_chain",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // GOVERNANCE METRICS
  // ═══════════════════════════════════════════════════════════════════

  boardIndependence: {
    id: "boardIndependence",
    name: "Board Independence %",
    standardUnit: "%",
    aliases: [
      "board independence", "independent directors", "independent board",
      "non-executive directors", "outside directors",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "governance",
    dataType: "percentage",
    required: false,
  },

  ceoPayRatio: {
    id: "ceoPayRatio",
    name: "CEO Pay Ratio",
    standardUnit: "ratio",
    aliases: [
      "ceo pay ratio", "executive pay ratio", "pay ratio",
      "compensation ratio", "ceo to worker ratio",
    ],
    unitConversions: { "ratio": 1, ":1": 1 },
    category: "governance",
    dataType: "ratio",
    required: false,
  },

  ethicsTraining: {
    id: "ethicsTraining",
    name: "Ethics Training Completion %",
    standardUnit: "%",
    aliases: [
      "ethics training", "code of conduct training", "compliance training",
      "anti-corruption training", "integrity training",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "governance",
    dataType: "percentage",
    required: false,
  },

  dataBreaches: {
    id: "dataBreaches",
    name: "Data Breaches",
    standardUnit: "count",
    aliases: [
      "data breaches", "security breaches", "cyber incidents",
      "privacy breaches", "data incidents",
    ],
    unitConversions: { "count": 1 },
    category: "governance",
    dataType: "count",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRODUCT METRICS
  // ═══════════════════════════════════════════════════════════════════

  productRecalls: {
    id: "productRecalls",
    name: "Product Recalls",
    standardUnit: "count",
    aliases: [
      "product recalls", "recalls", "food safety recalls",
      "quality recalls", "safety recalls",
    ],
    unitConversions: { "count": 1 },
    category: "product",
    dataType: "count",
    required: false,
  },

  productCertified: {
    id: "productCertified",
    name: "Products Certified Sustainable %",
    standardUnit: "%",
    aliases: [
      "certified products", "sustainable products", "eco-certified",
      "certified sustainable", "green certified",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "product",
    dataType: "percentage",
    required: false,
  },

  customerSatisfaction: {
    id: "customerSatisfaction",
    name: "Customer Satisfaction Score",
    standardUnit: "%",
    aliases: [
      "customer satisfaction", "NPS", "net promoter score",
      "customer score", "satisfaction rating",
    ],
    unitConversions: { "%": 1, "percent": 1 },
    category: "product",
    dataType: "percentage",
    required: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // AIR QUALITY METRICS
  // ═══════════════════════════════════════════════════════════════════

  noxEmissions: {
    id: "noxEmissions",
    name: "NOx Emissions",
    standardUnit: "metric tons",
    aliases: [
      "nox", "nox emissions", "nitrogen oxides",
      "nitrogen oxide emissions",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  soxEmissions: {
    id: "soxEmissions",
    name: "SOx Emissions",
    standardUnit: "metric tons",
    aliases: [
      "sox", "sox emissions", "sulfur oxides",
      "sulfur dioxide", "so2",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  vocEmissions: {
    id: "vocEmissions",
    name: "VOC Emissions",
    standardUnit: "metric tons",
    aliases: [
      "voc", "vocs", "volatile organic compounds",
      "voc emissions",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },

  particulateMatter: {
    id: "particulateMatter",
    name: "Particulate Matter Emissions",
    standardUnit: "metric tons",
    aliases: [
      "particulate matter", "PM", "PM2.5", "PM10",
      "dust emissions", "particulates",
    ],
    unitConversions: { "metric tons": 1, "tonnes": 1, "kg": 0.001 },
    category: "emissions",
    dataType: "absolute",
    required: false,
  },
}

// Get all metric IDs for tracking what was/wasn't extracted
export function getAllMetricIds(): string[] {
  return Object.keys(METRIC_DEFINITIONS)
}

// Get metrics by category
export function getMetricsByCategory(category: string): MetricDefinition[] {
  return Object.values(METRIC_DEFINITIONS).filter(m => m.category === category)
}

// Get all categories
export function getAllCategories(): string[] {
  return [...new Set(Object.values(METRIC_DEFINITIONS).map(m => m.category))]
}

/**
 * Get metric definition by name or alias - COMPREHENSIVE MATCHING
 */
export function getMetricDefinition(name: string): MetricDefinition | null {
  const normalizedName = name.toLowerCase().trim().replace(/[_-]/g, " ")

  // Direct ID match
  for (const [id, definition] of Object.entries(METRIC_DEFINITIONS)) {
    if (id.toLowerCase() === normalizedName.replace(/\s+/g, "")) {
      return definition
    }
  }

  // Exact alias match
  for (const definition of Object.values(METRIC_DEFINITIONS)) {
    if (definition.aliases.some(a => a.toLowerCase() === normalizedName)) {
      return definition
    }
  }

  // Partial match
  for (const definition of Object.values(METRIC_DEFINITIONS)) {
    for (const alias of definition.aliases) {
      const aliasLower = alias.toLowerCase()
      if (normalizedName.includes(aliasLower) || aliasLower.includes(normalizedName)) {
        return definition
      }
    }
  }

  // Word overlap match
  const nameWords = new Set(normalizedName.split(/\s+/).filter(w => w.length > 2))
  for (const definition of Object.values(METRIC_DEFINITIONS)) {
    for (const alias of definition.aliases) {
      const aliasWords = new Set(alias.toLowerCase().split(/\s+/).filter(w => w.length > 2))
      const overlap = [...nameWords].filter(w => aliasWords.has(w))
      if (overlap.length >= 2) {
        return definition
      }
    }
  }

  return null
}

export function convertToStandardUnit(value: number, fromUnit: string, metricId: string): number | null {
  const definition = METRIC_DEFINITIONS[metricId]
  if (!definition) return null
  const normalizedUnit = fromUnit.toLowerCase().trim()
  for (const [unit, factor] of Object.entries(definition.unitConversions)) {
    if (unit.toLowerCase() === normalizedUnit) {
      return value * factor
    }
  }
  return value
}

export function validateMetricValue(value: number, metricId: string): { valid: boolean; error?: string } {
  const definition = METRIC_DEFINITIONS[metricId]
  if (!definition?.validationRules) return { valid: true }
  const rules = definition.validationRules
  if (rules.min !== undefined && value < rules.min) {
    return { valid: false, error: `Value ${value} below min ${rules.min}` }
  }
  if (rules.max !== undefined && value > rules.max) {
    return { valid: false, error: `Value ${value} exceeds max ${rules.max}` }
  }
  return { valid: true }
}
