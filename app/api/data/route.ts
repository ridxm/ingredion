import { NextRequest, NextResponse } from "next/server"
import {
  loadLatestReport,
  getPeerComparison,
  getHistoricalTrend,
  getCompanyList,
} from "@/lib/data-loader"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const company = searchParams.get("company") || "Ingredion"
    const endpoint = searchParams.get("endpoint") || "dashboard"

    switch (endpoint) {
      case "dashboard": {
        const report = await loadLatestReport(company)
        
        if (!report) {
          return NextResponse.json(
            { error: "No data found for company" },
            { status: 404 }
          )
        }

        // Get historical emissions data
        const emissionsHistory = await getHistoricalTrend(company, "totalEmissions")
        
        // Get peer comparison
        const peerComparison = await getPeerComparison("totalEmissions")

        return NextResponse.json({
          company: report.company,
          year: report.year,
          metrics: report.metrics,
          frameworks: report.frameworks,
          targets: report.targets,
          insights: report.insights,
          dataQuality: report.dataQuality,
          emissionsHistory,
          peerComparison,
        })
      }

      case "companies": {
        const companies = await getCompanyList()
        return NextResponse.json({ companies })
      }

      case "report": {
        const report = await loadLatestReport(company)
        return NextResponse.json(report)
      }

      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json(
      { error: "Failed to fetch data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

