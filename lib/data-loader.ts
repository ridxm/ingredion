import { readdir, readFile } from "fs/promises"
import path from "path"
import type { ESGReport } from "./types"

/**
 * Load all ESG reports from the data/reports directory
 */
export async function loadAllReports(): Promise<ESGReport[]> {
  try {
    const reportsDir = path.join(process.cwd(), "data", "reports")
    const files = await readdir(reportsDir)
    
    const jsonFiles = files.filter((file) => file.endsWith(".json"))
    
    const reports: ESGReport[] = []
    
    for (const file of jsonFiles) {
      const filePath = path.join(reportsDir, file)
      const fileContent = await readFile(filePath, "utf-8")
      const report = JSON.parse(fileContent)
      reports.push(report)
    }
    
    // Sort by year (most recent first)
    return reports.sort((a, b) => b.year - a.year)
  } catch (error) {
    console.error("Error loading reports:", error)
    return []
  }
}

/**
 * Load a specific company's reports
 */
export async function loadCompanyReports(companyName: string): Promise<ESGReport[]> {
  const allReports = await loadAllReports()
  return allReports.filter(
    (report) => report.company.toLowerCase() === companyName.toLowerCase()
  )
}

/**
 * Load the latest report for a company
 */
export async function loadLatestReport(companyName: string): Promise<ESGReport | null> {
  const reports = await loadCompanyReports(companyName)
  return reports.length > 0 ? reports[0] : null
}

/**
 * Load report by year
 */
export async function loadReportByYear(
  companyName: string,
  year: number
): Promise<ESGReport | null> {
  const reports = await loadCompanyReports(companyName)
  return reports.find((report) => report.year === year) || null
}

/**
 * Get list of all companies
 */
export async function getCompanyList(): Promise<string[]> {
  const reports = await loadAllReports()
  const companies = new Set(reports.map((report) => report.company))
  return Array.from(companies).sort()
}

/**
 * Get available years for a company
 */
export async function getAvailableYears(companyName: string): Promise<number[]> {
  const reports = await loadCompanyReports(companyName)
  return reports.map((report) => report.year).sort((a, b) => b - a)
}

/**
 * Calculate peer comparison data
 */
export async function getPeerComparison(metric: keyof ESGReport["metrics"]) {
  const reports = await loadAllReports()
  
  // Get latest report for each company
  const latestReports = new Map<string, ESGReport>()
  
  for (const report of reports) {
    const existing = latestReports.get(report.company)
    if (!existing || report.year > existing.year) {
      latestReports.set(report.company, report)
    }
  }
  
  // Build comparison data
  const comparison = Array.from(latestReports.values())
    .filter((report) => report.metrics[metric] !== undefined)
    .map((report) => ({
      company: report.company,
      value: report.metrics[metric] || 0,
      year: report.year,
    }))
    .sort((a, b) => a.value - b.value)
  
  return comparison
}

/**
 * Calculate historical trend for a company
 */
export async function getHistoricalTrend(
  companyName: string,
  metric: keyof ESGReport["metrics"]
) {
  const reports = await loadCompanyReports(companyName)
  
  return reports
    .filter((report) => report.metrics[metric] !== undefined)
    .map((report) => ({
      year: report.year,
      value: report.metrics[metric] || 0,
    }))
    .sort((a, b) => a.year - b.year)
}

