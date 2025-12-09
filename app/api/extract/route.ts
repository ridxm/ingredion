import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { extractMetricsWithGemini, transformMetricsToReport } from "@/lib/gemini-pdf-extractor"
import { generateInsights } from "@/lib/ai-insights"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      )
    }

    const results = []

    for (const file of files) {
      // Save uploaded PDF
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadsDir = path.join(process.cwd(), "data", "uploads")
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const filepath = path.join(uploadsDir, filename)

      await writeFile(filepath, buffer)

      // Extract data from PDF using Gemini
      const extractionResult = await extractMetricsWithGemini(filepath, apiKey)

      if (!extractionResult.success) {
        console.error(`Failed to extract metrics from ${file.name}:`, extractionResult.error)
        return NextResponse.json(
          { error: `Extraction failed: ${extractionResult.error}` },
          { status: 400 }
        )
      }

      // Transform extracted metrics to report format
      const reportData = transformMetricsToReport(extractionResult.metrics || [])

      // Create a comprehensive report object
      const extractedData = {
        company: file.name.replace(/\.[^/.]+$/, "").split("-")[0] || "Unknown",
        year: new Date().getFullYear(),
        metrics: reportData.metrics,
        rawMetrics: reportData.rawMetrics,
        dataQuality: {
          score: 85,
          warnings: [],
          missingRequiredMetrics: [],
          metricDetails: [],
        },
      }

      // Generate AI insights
      const insights = await generateInsights(extractedData)
      extractedData.insights = insights

      // Save extracted data as JSON
      const reportsDir = path.join(process.cwd(), "data", "reports")
      if (!existsSync(reportsDir)) {
        await mkdir(reportsDir, { recursive: true })
      }

      const jsonFilename = `${extractedData.company.toLowerCase().replace(/\s+/g, "-")}-${extractedData.year}.json`
      const jsonPath = path.join(reportsDir, jsonFilename)

      await writeFile(jsonPath, JSON.stringify(extractedData, null, 2))

      results.push({
        filename: file.name,
        company: extractedData.company,
        year: extractedData.year,
        jsonPath: jsonFilename,
        metrics: extractedData.metrics,
        metricsCount: extractionResult.total_metrics_extracted,
        numPages: extractionResult.num_pages,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} file(s) using Gemini extractor`,
      results,
    })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      { error: "Failed to process PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

