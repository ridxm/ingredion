import OpenAI from "openai"
import { readFile } from "fs/promises"
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
    // Extract text using a PDF library (you'll need to install pdf-parse)
    const pdfText = await extractTextFromPDF(filepath)

    // Use OpenAI to extract structured data from the text
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
 * Extract text from PDF using pdfjs-dist
 */
async function extractTextFromPDF(filepath: string): Promise<string> {
  try {
    // Use dynamic require for pdfjs-dist
    // @ts-ignore
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js")
    
    const dataBuffer = await readFile(filepath)
    const typedArray = new Uint8Array(dataBuffer)
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: typedArray,
      useSystemFonts: true,
    })
    
    const pdf = await loadingTask.promise
    let fullText = ""
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ")
      fullText += pageText + "\n"
    }
    
    console.log(`Extracted ${fullText.length} characters from ${pdf.numPages} pages`)
    return fullText
  } catch (error) {
    console.error("Error parsing PDF with pdfjs-dist:", error)
    return ""
  }
}

/**
 * Use OpenAI to extract structured ESG data from text with unit detection
 */
async function extractStructuredData(text: string, filename: string): Promise<any> {
  const metricDefinitions = getMetricDefinitionsForPrompt()
  
  // Check if we actually have text to extract from
  if (!text || text.trim().length < 100) {
    console.error("PDF text is empty or too short. Text length:", text.length)
    throw new Error("Could not extract sufficient text from PDF. The file may be image-based or corrupted.")
  }

  console.log("Extracting from PDF text. First 500 chars:", text.substring(0, 500))
  
  const prompt = `You are an expert ESG data analyst. Extract ONLY the data that is ACTUALLY PRESENT in the following sustainability report.

CRITICAL RULES:
1. DO NOT make up or estimate any data
2. DO NOT use placeholder or example values
3. If you cannot find a metric in the text, OMIT it entirely
4. The company name MUST be the exact name from the report
5. Only extract metrics that are explicitly stated with numbers
6. Include the exact unit as written in the report

Standard Metrics to Extract (ONLY if present):
${metricDefinitions}

Return ONLY valid JSON in this EXACT format:
{
  "company": "Company Name",
  "year": 2024,
  "reportDate": "2024-01-01",
  "reportUrl": "${filename}",
  "rawMetrics": [
    {
      "name": "scope1",
      "value": 100,
      "unit": "kt CO2e",
      "confidence": 0.9
    },
    {
      "name": "renewable energy",
      "value": 62,
      "unit": "%",
      "confidence": 0.85
    }
  ],
  "frameworks": {
    "GRI": 85,
    "TCFD": 75,
    "SBTi": 80,
    "SDG": 70
  },
  "targets": [
    {
      "name": "Net Zero by 2050",
      "baseline": 600,
      "target": 0,
      "deadline": 2050,
      "current": 400,
      "progress": 50,
      "category": "Emissions"
    }
  ]
}

EXTRACTION RULES:
1. ONLY extract data that is EXPLICITLY stated in the report text
2. DO NOT invent, estimate, or use placeholder values
3. Always include the unit exactly as written (kt CO2e, t CO2e, %, m³/t, etc.)
4. Set confidence based on clarity: 0.9+ if very clear, 0.7-0.9 if somewhat clear, below 0.7 if unclear
5. The company name must match what's in the report - do not make up a name
6. If a value is not clearly stated, OMIT that metric entirely
7. For percentages, use % not decimal (62% not 0.62)
8. If you cannot find clear data, return an empty rawMetrics array

COMMON UNIT VARIATIONS:
- Emissions: kt CO2e, t CO2e, MT CO2e, metric tons CO2e, tonnes CO2e
- Energy: GWh, MWh, kWh, TJ, GJ
- Water: m³, ML, GL, L, gallons
- Weight: kt, t, MT, kg, tons, metric tons

WARNING: If the text below does not contain clear sustainability metrics, return minimal data with empty rawMetrics array. Do NOT fabricate data.

Report text (first 20000 chars):
${text.slice(0, 20000)}

END OF REPORT TEXT

Now extract ONLY what is actually present above. If you see no clear metrics, return:
{
  "company": "Unknown",
  "year": ${new Date().getFullYear()},
  "rawMetrics": [],
  "frameworks": {},
  "targets": []
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert ESG data analyst specializing in extracting structured data from sustainability reports. You are meticulous about capturing units and metric variations. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for more deterministic extraction
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0].message.content || "{}"
    const extractedData = JSON.parse(responseText)

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

