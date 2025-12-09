import { spawn } from "child_process"
import { join } from "path"
import { normalizeMetrics, type RawMetric } from "./metric-normalizer"
import { validateExtractedData, detectHallucination } from "./extraction-validator"
import type { ESGReport } from "./types"

interface GeminiMetric {
  metric_name: string
  value: number
  unit: string
  year?: number
  category?: string
  confidence?: number
  source_text?: string
}

interface ExtractionResult {
  success: boolean
  file_path?: string
  company?: string
  year?: number
  num_pages?: number
  num_chunks?: number
  metrics?: GeminiMetric[]
  total_metrics_extracted?: number
  pdf_text_sample?: string
  error?: string
}

/**
 * Map Gemini metric names to our standard metric IDs
 */
const METRIC_NAME_MAP: Record<string, string> = {
  "scope 1 emissions": "scope1",
  "scope 1": "scope1",
  "direct emissions": "scope1",
  "scope 2 emissions": "scope2",
  "scope 2": "scope2",
  "indirect emissions": "scope2",
  "scope 3 emissions": "scope3",
  "scope 3": "scope3",
  "value chain emissions": "scope3",
  "total ghg emissions": "totalEmissions",
  "total emissions": "totalEmissions",
  "total greenhouse gas emissions": "totalEmissions",
  "renewable energy percentage": "renewable_energy_pct",
  "renewable energy": "renewable_energy_pct",
  "total energy consumption": "totalEnergyConsumption",
  "energy consumption": "totalEnergyConsumption",
  "water withdrawal": "waterWithdrawal",
  "water intake": "waterWithdrawal",
  "water intensity": "water_intensity",
  "waste to landfill": "waste_landfill_pct",
  "landfill waste": "waste_landfill_pct",
  "waste recycled percentage": "wasteRecycled",
  "waste recycling rate": "wasteRecycled",
  "employee turnover rate": "employeeTurnover",
  "employee turnover": "employeeTurnover",
  "turnover rate": "employeeTurnover",
  "women in leadership": "womenInLeadership",
  "female leadership": "womenInLeadership",
  "safety incident rate": "safetyIncidents",
  "trir": "safetyIncidents",
  "total recordable incident rate": "safetyIncidents",
  "board independence": "boardIndependence",
  "independent directors": "boardIndependence",
  "emissions intensity": "emissionsIntensity",
  "carbon intensity": "emissionsIntensity",
  "workforce diversity": "diversityPct",
  "diversity percentage": "diversityPct",
  "waste generated": "wasteGenerated",
  "total waste": "wasteGenerated",
}

/**
 * Transform Gemini metrics to RawMetric format for normalization
 */
function transformToRawMetrics(geminiMetrics: GeminiMetric[]): RawMetric[] {
  return geminiMetrics.map((metric) => {
    const normalizedName = metric.metric_name.toLowerCase().trim()
    const standardName = METRIC_NAME_MAP[normalizedName] || normalizedName.replace(/\s+/g, "_")
    
    return {
      name: standardName,
      value: typeof metric.value === "number" ? metric.value : parseFloat(String(metric.value)) || 0,
      unit: metric.unit || undefined,
      confidence: metric.confidence || 0.8,
    }
  })
}

/**
 * Call Python extractor service to extract metrics from PDF
 */
export async function extractMetricsWithGemini(filePath: string, apiKey: string): Promise<ExtractionResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = join(process.cwd(), "python_extractor", "extractor_service.py")
    const venvPython = join(process.cwd(), "python_extractor", "venv", "bin", "python3")

    const pythonProcess = spawn(venvPython, [pythonScript, filePath, apiKey], {
      cwd: join(process.cwd(), "python_extractor"),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        GOOGLE_API_KEY: apiKey,
      },
    })

    let stdout = ""
    let stderr = ""

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString()
      console.error("[Python]", data.toString())
    })

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python process exited with code:", code)
        console.error("Stderr:", stderr)
        reject(new Error(`Python extractor failed with code ${code}: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout) as ExtractionResult
        resolve(result)
      } catch (error) {
        console.error("Failed to parse Python output:", stdout)
        reject(new Error(`Failed to parse extraction results: ${error}`))
      }
    })

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`))
    })
  })
}

/**
 * Full extraction pipeline: extract -> normalize -> validate
 */
export async function extractAndNormalizeReport(
  filePath: string,
  apiKey: string,
  filename: string
): Promise<ESGReport> {
  // Step 1: Extract with Gemini
  console.log("Step 1: Extracting metrics with Gemini...")
  const extractionResult = await extractMetricsWithGemini(filePath, apiKey)

  if (!extractionResult.success) {
    throw new Error(extractionResult.error || "Extraction failed")
  }

  // Step 2: Transform to raw metrics
  console.log("Step 2: Transforming metrics...")
  const rawMetrics = transformToRawMetrics(extractionResult.metrics || [])
  console.log(`Transformed ${rawMetrics.length} metrics`)

  // Step 3: Normalize metrics
  console.log("Step 3: Normalizing metrics...")
  const normalizationResult = normalizeMetrics(rawMetrics)
  console.log(`Normalized metrics: ${Object.keys(normalizationResult.metrics).length}`)
  console.log(`Data quality score: ${normalizationResult.dataQualityScore}`)

  // Step 4: Create report object
  const report: ESGReport = {
    company: extractionResult.company || "Unknown",
    year: extractionResult.year || new Date().getFullYear(),
    reportDate: new Date().toISOString(),
    reportUrl: filename,
    metrics: normalizationResult.metrics,
    frameworks: {}, // TODO: Extract framework coverage
    targets: [], // TODO: Extract targets
    dataQuality: {
      score: normalizationResult.dataQualityScore,
      warnings: normalizationResult.warnings,
      missingRequiredMetrics: normalizationResult.missingRequiredMetrics,
      metricDetails: normalizationResult.metricDetails,
    },
  }

  // Step 5: Validate extraction
  console.log("Step 5: Validating extraction...")
  const pdfText = extractionResult.pdf_text_sample || ""
  const validation = validateExtractedData(report, pdfText)
  const hallucination = detectHallucination(report, pdfText)

  // Add validation results to data quality
  if (report.dataQuality) {
    report.dataQuality.warnings.push(...validation.warnings)

    if (hallucination.isHallucination) {
      report.dataQuality.warnings.unshift(`⚠️ HALLUCINATION DETECTED: ${hallucination.reason}`)
      report.dataQuality.score = Math.min(report.dataQuality.score, 30)
    }

    if (!validation.isValid) {
      report.dataQuality.warnings.unshift(...validation.errors.map((e) => `ERROR: ${e}`))
      report.dataQuality.score = Math.min(report.dataQuality.score, validation.confidence)
    }
  }

  // Store raw Gemini output for reference
  ;(report as any).rawGeminiMetrics = extractionResult.metrics
  ;(report as any).extractionMeta = {
    numPages: extractionResult.num_pages,
    numChunks: extractionResult.num_chunks,
    totalExtracted: extractionResult.total_metrics_extracted,
  }

  console.log("Extraction complete:")
  console.log("- Company:", report.company)
  console.log("- Year:", report.year)
  console.log("- Metrics extracted:", Object.keys(report.metrics).length)
  console.log("- Quality score:", report.dataQuality?.score)
  console.log("- Hallucination detected:", hallucination.isHallucination)

  return report
}

/**
 * Generate CSV content from extracted data - includes ALL metrics with status
 */
export function generateCSV(report: ESGReport): string {
  const { METRIC_DEFINITIONS } = require("./metric-config")
  const lines: string[] = []
  
  // Header
  lines.push("Metric ID,Metric Name,Category,Status,Value,Unit,Original Value,Original Unit,Confidence,Quality,Warnings")
  
  const extracted = report.dataQuality?.metricDetails || []
  const extractedIds = new Set(extracted.map((m: any) => m.id.toLowerCase()))
  
  // All metrics - both extracted and not extracted
  for (const [id, definition] of Object.entries(METRIC_DEFINITIONS)) {
    const def = definition as any
    const wasExtracted = extractedIds.has(id.toLowerCase())
    const extractedData = extracted.find((m: any) => m.id.toLowerCase() === id.toLowerCase())
    
    if (wasExtracted && extractedData) {
      const warnings = (extractedData.warnings || []).join("; ").replace(/"/g, '""')
      lines.push([
        id,
        `"${def.name}"`,
        def.category,
        "EXTRACTED",
        extractedData.value,
        `"${extractedData.unit}"`,
        extractedData.originalValue || "",
        `"${extractedData.originalUnit || ""}"`,
        extractedData.confidence || "",
        extractedData.dataQuality || "",
        `"${warnings}"`,
      ].join(","))
    } else {
      lines.push([
        id,
        `"${def.name}"`,
        def.category,
        "NOT FOUND",
        "",
        `"${def.standardUnit}"`,
        "",
        "",
        "",
        "",
        "",
      ].join(","))
    }
  }
  
  return lines.join("\n")
}

/**
 * Generate detailed extraction report for data quality page
 * Shows ALL possible metrics with extraction status
 */
export function generateExtractionReport(report: ESGReport) {
  // Import all metric definitions
  const { METRIC_DEFINITIONS, getAllCategories } = require("./metric-config")
  
  const extracted = report.dataQuality?.metricDetails || []
  const extractedIds = new Set(extracted.map((m: any) => m.id.toLowerCase()))
  const warnings = report.dataQuality?.warnings || []
  
  // Build complete metric status for ALL defined metrics
  const allMetricsStatus: Record<string, any> = {}
  const byCategory: Record<string, { extracted: any[], notExtracted: any[] }> = {}
  
  // Initialize categories
  for (const category of getAllCategories()) {
    byCategory[category] = { extracted: [], notExtracted: [] }
  }
  
  // Process all defined metrics
  for (const [id, definition] of Object.entries(METRIC_DEFINITIONS)) {
    const def = definition as any
    const wasExtracted = extractedIds.has(id.toLowerCase())
    const extractedData = extracted.find((m: any) => m.id.toLowerCase() === id.toLowerCase())
    
    const metricStatus = {
      id,
      name: def.name,
      category: def.category,
      standardUnit: def.standardUnit,
      required: def.required,
      extracted: wasExtracted,
      value: extractedData?.value || null,
      unit: extractedData?.unit || def.standardUnit,
      confidence: extractedData?.confidence || null,
      dataQuality: extractedData?.dataQuality || null,
      originalValue: extractedData?.originalValue || null,
      originalUnit: extractedData?.originalUnit || null,
      warnings: extractedData?.warnings || [],
    }
    
    allMetricsStatus[id] = metricStatus
    
    // Add to category
    const category = def.category || "other"
    if (!byCategory[category]) {
      byCategory[category] = { extracted: [], notExtracted: [] }
    }
    
    if (wasExtracted) {
      byCategory[category].extracted.push(metricStatus)
    } else {
      byCategory[category].notExtracted.push(metricStatus)
    }
  }
  
  // Calculate totals
  const totalPossible = Object.keys(METRIC_DEFINITIONS).length
  const totalExtracted = extracted.length
  const totalNotExtracted = totalPossible - totalExtracted
  
  // Coverage by category
  const categoryStats: Record<string, { total: number, extracted: number, coverage: number }> = {}
  for (const [cat, data] of Object.entries(byCategory)) {
    const total = data.extracted.length + data.notExtracted.length
    categoryStats[cat] = {
      total,
      extracted: data.extracted.length,
      coverage: total > 0 ? Math.round((data.extracted.length / total) * 100) : 0
    }
  }
  
  return {
    summary: {
      totalPossibleMetrics: totalPossible,
      totalExtracted,
      totalNotExtracted,
      extractionCoverage: Math.round((totalExtracted / totalPossible) * 100),
      qualityScore: report.dataQuality?.score || 0,
      warningsCount: warnings.length,
      highQualityCount: extracted.filter((m: any) => m.dataQuality === "high").length,
      mediumQualityCount: extracted.filter((m: any) => m.dataQuality === "medium").length,
      lowQualityCount: extracted.filter((m: any) => m.dataQuality === "low").length,
    },
    categoryStats,
    byCategory,
    allMetricsStatus,
    extracted,
    warnings,
  }
}
