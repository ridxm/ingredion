import OpenAI from "openai"
import { readFile } from "fs/promises"
import { spawn } from "child_process"
import { join } from "path"
import type { ESGReport } from "./types"
import { normalizeMetrics, getMetricDefinitionsForPrompt, type RawMetric } from "./metric-normalizer"
import { validateExtractedData, detectHallucination } from "./extraction-validator"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Extract ESG data from PDF using OpenAI with normalization
 */
export async function extractPDFData(filepath: string, filename: string): Promise<ESGReport> {
  try {
    // Extract text from PDF
    const pdfText = await extractTextFromPDF(filepath)

    // Use OpenAI to extract structured data - comprehensive extraction
    const rawData = await extractStructuredData(pdfText, filename)

    // Normalize metrics to standard units
    const normalizationResult = normalizeMetrics(rawData.rawMetrics || [])

    // Create report with normalized data
    const report: ESGReport = {
      ...rawData,
      metrics: normalizationResult.metrics,
      dataQuality: {
        score: normalizationResult.dataQualityScore,
        warnings: normalizationResult.warnings,
        missingRequiredMetrics: normalizationResult.missingRequiredMetrics,
        metricDetails: normalizationResult.metricDetails,
      },
    }

    // Validate the extraction
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
        report.dataQuality.warnings.unshift(...validation.errors.map(e => `ERROR: ${e}`))
        report.dataQuality.score = Math.min(report.dataQuality.score, validation.confidence)
      }
    }

    // Log extraction results
    console.log("Extraction complete:")
    console.log("- Company:", report.company)
    console.log("- Metrics extracted:", Object.keys(report.metrics).length)
    console.log("- Quality score:", report.dataQuality?.score)
    console.log("- Hallucination detected:", hallucination.isHallucination)

    return report
  } catch (error) {
    console.error("Error extracting PDF data:", error)
    throw error
  }
}

/**
 * Extract text from PDF using Python PyPDF2
 */
async function extractTextFromPDF(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = join(process.cwd(), "python_extractor", "pdf_text_extractor.py")
    const venvPython = join(process.cwd(), "python_extractor", "venv", "bin", "python3")

    const pythonProcess = spawn(venvPython, [pythonScript, filepath], {
      cwd: join(process.cwd(), "python_extractor"),
    })

    let stdout = ""
    let stderr = ""

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString()
      console.error("[Python PDF]", data.toString())
    })

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python PDF extractor failed with code:", code)
        resolve("")
        return
      }

      try {
        const result = JSON.parse(stdout)
        if (result.success) {
          console.log(`Extracted ${result.text_length} characters from ${result.num_pages} pages`)
          resolve(result.text)
        } else {
          console.error("PDF extraction failed:", result.error)
          resolve("")
        }
      } catch (error) {
        console.error("Failed to parse Python output:", stdout)
        resolve("")
      }
    })

    pythonProcess.on("error", (error) => {
      console.error("Failed to spawn Python process:", error.message)
      resolve("")
    })
  })
}

/**
 * COMPREHENSIVE ESG data extraction using OpenAI
 */
async function extractStructuredData(text: string, filename: string): Promise<any> {
  if (!text || text.trim().length < 100) {
    console.error("PDF text is empty or too short. Text length:", text.length)
    throw new Error("Could not extract sufficient text from PDF. The file may be image-based or corrupted.")
  }

  console.log(`Extracting from ${text.length} characters of PDF text`)
  
  // Use more text - up to 100K characters for comprehensive extraction
  const textToAnalyze = text.slice(0, 100000)
  
  const comprehensivePrompt = `You are an expert ESG/sustainability data analyst. Your task is to extract ALL quantitative sustainability metrics from this report.

IMPORTANT: Search the ENTIRE text thoroughly. Look for numbers with units in:
- Data tables
- Performance summaries
- Infographics text
- Footnotes
- Year-over-year comparisons

═══════════════════════════════════════════════════════════════
METRICS TO EXTRACT (find ALL that are present):
═══════════════════════════════════════════════════════════════

📊 EMISSIONS & CARBON:
- Carbon/GHG reduction percentage (e.g., "22% reduction", "reduced by 22%")
- Total carbon emissions in metric tons (Scope 1+2 combined)
- Scope 1 emissions (direct) in metric tons
- Scope 2 emissions (electricity) in metric tons  
- Scope 3 emissions (value chain) in metric tons
- Scope 3 reduction percentage
- Carbon intensity (emissions per unit/revenue)

⚡ ENERGY:
- Total energy consumption (GWh, MWh, TJ, GJ)
- Renewable electricity percentage (look for "X% renewable", "X% clean energy")
- Solar/wind capacity (MW)
- Energy intensity

💧 WATER:
- Total water withdrawal/use (cubic meters, gallons, liters)
- Water recycled/reused percentage
- Water intensity (per unit production)
- Water discharge

♻️ WASTE:
- Total waste generated (metric tons)
- Waste diverted from landfill percentage (look for "X% diversion", "X% avoidance")
- Waste recycled percentage
- Hazardous waste (metric tons)
- Food waste (metric tons)

📦 PACKAGING:
- Recyclable packaging percentage
- Recycled content percentage (PCR, rPET)
- Plastic reduction percentage
- Reusable packaging percentage

🌾 AGRICULTURE & SOURCING:
- Sustainable/regenerative agriculture (acres, hectares)
- Sustainably sourced ingredients percentage
- Deforestation-free percentage

🦺 SAFETY:
- TRIR / Total Recordable Incident Rate (per 200,000 hours)
- LTIR / Lost Time Injury Rate
- Facilities with zero injuries percentage
- Fatalities (should be 0 ideally)

👥 WORKFORCE:
- Total employees / headcount
- Employee turnover rate percentage
- New hires
- Employee engagement score

🌈 DIVERSITY:
- Women in workforce percentage
- Women in leadership/management percentage
- Women on board percentage
- Ethnic/racial diversity percentage

📚 TRAINING:
- Training hours per employee
- Training investment (USD)

🤝 COMMUNITY:
- Community investment (USD, millions)
- Volunteer hours
- People benefited

🔗 SUPPLY CHAIN:
- Supplier audits conducted
- Supplier compliance rate
- Local sourcing percentage

⚖️ GOVERNANCE:
- Board independence percentage
- CEO pay ratio
- Ethics training completion percentage

═══════════════════════════════════════════════════════════════
EXTRACTION RULES:
═══════════════════════════════════════════════════════════════

1. ONLY extract values that are EXPLICITLY stated with numbers
2. DO NOT guess, estimate, or make up any values
3. Include the EXACT unit as written in the report
4. For percentages found as decimals (0.22), convert to % (22%)
5. Pay attention to scale: thousands, millions, etc.
6. Look for CURRENT YEAR data (most recent, typically 2024 or 2023)
7. If a metric appears multiple times, use the one with more context
8. Set confidence: 0.95 if very clear, 0.85 if clear, 0.75 if somewhat clear

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (valid JSON only):
═══════════════════════════════════════════════════════════════

{
  "company": "Exact Company Name from Report",
  "year": 2024,
  "rawMetrics": [
    {"name": "carbonReductionPct", "value": 22, "unit": "%", "confidence": 0.95},
    {"name": "carbonAbsolute", "value": 2604910, "unit": "metric tons CO2e", "confidence": 0.9},
    {"name": "scope1", "value": 500000, "unit": "metric tons CO2e", "confidence": 0.9},
    {"name": "scope2", "value": 300000, "unit": "metric tons CO2e", "confidence": 0.9},
    {"name": "scope3", "value": 1800000, "unit": "metric tons CO2e", "confidence": 0.85},
    {"name": "scope3ReductionPct", "value": 7, "unit": "%", "confidence": 0.85},
    {"name": "totalEnergy", "value": 5000, "unit": "GWh", "confidence": 0.9},
    {"name": "renewableElectricity", "value": 32, "unit": "%", "confidence": 0.9},
    {"name": "waterWithdrawal", "value": 51503000, "unit": "cubic meters", "confidence": 0.9},
    {"name": "wasteLandfillAvoidance", "value": 92, "unit": "%", "confidence": 0.9},
    {"name": "totalWaste", "value": 276188, "unit": "metric tons", "confidence": 0.85},
    {"name": "recyclablePackaging", "value": 85, "unit": "%", "confidence": 0.85},
    {"name": "recycledContent", "value": 25, "unit": "%", "confidence": 0.85},
    {"name": "sustainableAgriculture", "value": 74000, "unit": "acres", "confidence": 0.8},
    {"name": "sustainableSourcing", "value": 85, "unit": "%", "confidence": 0.9},
    {"name": "trir", "value": 0.31, "unit": "per 200,000 hours", "confidence": 0.95},
    {"name": "zeroInjuryFacilities", "value": 73, "unit": "%", "confidence": 0.9},
    {"name": "totalEmployees", "value": 12000, "unit": "count", "confidence": 0.9},
    {"name": "employeeTurnover", "value": 15, "unit": "%", "confidence": 0.85},
    {"name": "womenLeadership", "value": 35, "unit": "%", "confidence": 0.9},
    {"name": "womenBoard", "value": 40, "unit": "%", "confidence": 0.9},
    {"name": "trainingHours", "value": 25, "unit": "hours", "confidence": 0.85},
    {"name": "communityInvestment", "value": 5000000, "unit": "USD", "confidence": 0.85},
    {"name": "volunteerHours", "value": 50000, "unit": "hours", "confidence": 0.8},
    {"name": "boardIndependence", "value": 80, "unit": "%", "confidence": 0.9}
  ],
  "targets": [
    {"name": "28% reduction in Scope 1+2 GHG emissions", "deadline": 2030, "category": "Emissions"},
    {"name": "15% reduction in Scope 3 emissions", "deadline": 2030, "category": "Emissions"},
    {"name": "100% renewable electricity", "deadline": 2030, "category": "Energy"},
    {"name": "Zero waste to landfill", "deadline": 2030, "category": "Waste"}
  ]
}

═══════════════════════════════════════════════════════════════
REPORT TEXT TO ANALYZE:
═══════════════════════════════════════════════════════════════

${textToAnalyze}

═══════════════════════════════════════════════════════════════
END OF REPORT TEXT
═══════════════════════════════════════════════════════════════

Now extract ALL metrics you can find. Remember:
- Search thoroughly - metrics may be scattered throughout
- Look for tables and data summaries
- Don't miss safety data like TRIR
- Include sustainability targets with deadlines
- If you cannot find a value, DO NOT include it

Return ONLY the JSON object, no other text.`

  try {
    console.log("Calling OpenAI for comprehensive extraction...")
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert ESG data extraction specialist. You meticulously analyze sustainability reports to extract quantitative metrics.

Key behaviors:
- You search the ENTIRE document thoroughly
- You identify numbers and their associated units carefully  
- You understand various ways metrics are reported (tables, prose, summaries)
- You distinguish between current year data and historical data
- You NEVER fabricate data - if a metric isn't clearly stated, you omit it
- You return only valid JSON with no additional text`,
        },
        {
          role: "user",
          content: comprehensivePrompt,
        },
      ],
      temperature: 0.1, // Very low temperature for consistent extraction
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0].message.content || "{}"
    console.log("OpenAI response received, parsing...")
    
    const extractedData = JSON.parse(responseText)
    
    console.log(`Extracted ${extractedData.rawMetrics?.length || 0} metrics`)

    // Ensure required fields exist
    return {
      company: extractedData.company || "Unknown Company",
      year: extractedData.year || new Date().getFullYear(),
      reportDate: extractedData.reportDate,
      reportUrl: filename,
      rawMetrics: extractedData.rawMetrics || [],
      frameworks: extractedData.frameworks || {},
      targets: extractedData.targets || [],
      materiality: extractedData.materiality || [],
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error)
    
    // Return fallback data if OpenAI fails
    return {
      company: "Unknown Company",
      year: new Date().getFullYear(),
      reportUrl: filename,
      rawMetrics: [],
      frameworks: {},
      targets: [],
    }
  }
}
