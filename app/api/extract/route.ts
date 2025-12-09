import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { extractPDFData } from "@/lib/pdf-extractor"
import { generateInsights } from "@/lib/ai-insights"
import { generateCSV, generateExtractionReport } from "@/lib/gemini-pdf-extractor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const companyNameInput = formData.get("companyName") as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    if (!companyNameInput || !companyNameInput.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const results = []
    const companyName = companyNameInput.trim()

    for (const file of files) {
      console.log(`\n${"=".repeat(60)}`)
      console.log(`Processing: ${file.name} for company: ${companyName}`)
      console.log("=".repeat(60))

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
      console.log(`Saved PDF to: ${filepath}`)

      try {
        // Extract data from PDF using OpenAI + normalization pipeline
        const extractedData = await extractPDFData(filepath, file.name)

        // Override company name with user input
        extractedData.company = companyName

        // Generate AI insights
        console.log("Generating AI insights...")
        const insights = await generateInsights(extractedData)
        extractedData.insights = insights

        // Generate extraction report for data quality page
        const extractionReport = generateExtractionReport(extractedData)
        ;(extractedData as any).extractionReport = extractionReport

        // Ensure reports directory exists
        const reportsDir = path.join(process.cwd(), "data", "reports")
        if (!existsSync(reportsDir)) {
          await mkdir(reportsDir, { recursive: true })
        }

        // Save extracted data as JSON - use user-provided company name
        const safeCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        const jsonFilename = `${safeCompanyName}-${extractedData.year}.json`
        const jsonPath = path.join(reportsDir, jsonFilename)

        await writeFile(jsonPath, JSON.stringify(extractedData, null, 2))
        console.log(`Saved JSON to: ${jsonPath}`)

        // Generate and save CSV
        const csvContent = generateCSV(extractedData)
        const csvFilename = `${safeCompanyName}-${extractedData.year}-metrics.csv`
        const csvPath = path.join(reportsDir, csvFilename)

        await writeFile(csvPath, csvContent)
        console.log(`Saved CSV to: ${csvPath}`)

        // Summary
        const summary = {
          filename: file.name,
          company: extractedData.company,
          year: extractedData.year,
          jsonPath: jsonFilename,
          csvPath: csvFilename,
          metrics: extractedData.metrics,
          metricsCount: Object.keys(extractedData.metrics).length,
          dataQuality: {
            score: extractedData.dataQuality?.score || 0,
            extracted: extractedData.dataQuality?.metricDetails?.length || 0,
            missing: extractedData.dataQuality?.missingRequiredMetrics?.length || 0,
            warnings: extractedData.dataQuality?.warnings?.length || 0,
          },
        }

        console.log(`\nExtraction Summary:`)
        console.log(`- Company: ${summary.company}`)
        console.log(`- Year: ${summary.year}`)
        console.log(`- Metrics extracted: ${summary.metricsCount}`)
        console.log(`- Quality score: ${summary.dataQuality.score}`)
        console.log(`- Missing required: ${summary.dataQuality.missing}`)

        results.push(summary)
      } catch (extractError) {
        console.error(`Failed to extract from ${file.name}:`, extractError)
        results.push({
          filename: file.name,
          error: extractError instanceof Error ? extractError.message : "Unknown extraction error",
          success: false,
        })
      }
    }

    // Check if all failed
    const allFailed = results.every((r) => (r as any).error)
    if (allFailed) {
      return NextResponse.json(
        {
          success: false,
          error: "All files failed to process",
          results,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${files.length} file(s) using OpenAI extractor with normalization`,
      results,
    })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
