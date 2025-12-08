/**
 * Validates extracted ESG data to catch hallucinations and errors
 */

import type { ESGReport } from "./types"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

/**
 * Validate extracted report data
 */
export function validateExtractedData(
  report: ESGReport,
  pdfText: string
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let confidence = 100

  // Check if company name appears in PDF text
  if (report.company && report.company !== "Unknown") {
    const companyInText = pdfText.toLowerCase().includes(report.company.toLowerCase())
    if (!companyInText) {
      errors.push(
        `Company name "${report.company}" not found in PDF text. Possible hallucination.`
      )
      confidence -= 30
    }
  } else {
    warnings.push("Company name could not be determined")
    confidence -= 10
  }

  // Check if we have any metrics at all
  const metricCount = Object.keys(report.metrics).length
  if (metricCount === 0) {
    errors.push("No metrics were extracted. PDF may be unreadable or contain no ESG data.")
    confidence -= 40
  } else if (metricCount < 3) {
    warnings.push(`Only ${metricCount} metrics extracted. This seems low for a sustainability report.`)
    confidence -= 15
  }

  // Check for suspiciously round numbers (sign of fake data)
  const suspiciouslyRoundNumbers = []
  for (const [key, value] of Object.entries(report.metrics)) {
    if (typeof value === "number" && value > 10) {
      // Check if it's a very round number (ends in 00 or 000)
      if (value % 100 === 0 || value % 1000 === 0) {
        suspiciouslyRoundNumbers.push(`${key}: ${value}`)
      }
    }
  }

  if (suspiciouslyRoundNumbers.length > 3) {
    warnings.push(
      `Multiple metrics have suspiciously round values: ${suspiciouslyRoundNumbers.slice(0, 3).join(", ")}. Verify accuracy.`
    )
    confidence -= 10
  }

  // Check data quality metadata if present
  if (report.dataQuality) {
    const avgConfidence =
      report.dataQuality.metricDetails.reduce((sum, m) => sum + m.confidence, 0) /
      report.dataQuality.metricDetails.length

    if (avgConfidence < 0.5) {
      warnings.push(`Average extraction confidence is low (${(avgConfidence * 100).toFixed(0)}%)`)
      confidence -= 15
    }

    const lowQualityCount = report.dataQuality.metricDetails.filter(
      (m) => m.dataQuality === "low"
    ).length

    if (lowQualityCount > metricCount / 2) {
      warnings.push(`Over half of metrics (${lowQualityCount}) are marked as low quality`)
      confidence -= 20
    }
  }

  // Check for common placeholder/fake company names
  const fakeCompanyNames = [
    "greentech",
    "sustainability inc",
    "eco company",
    "sample company",
    "example corp",
    "test company",
    "acme",
  ]

  const companyLower = report.company.toLowerCase()
  const isFakeName = fakeCompanyNames.some((fake) => companyLower.includes(fake))

  if (isFakeName) {
    errors.push(
      `Company name "${report.company}" appears to be a placeholder or fabricated name.`
    )
    confidence -= 35
  }

  // Check year is reasonable
  const currentYear = new Date().getFullYear()
  if (report.year < 2000 || report.year > currentYear + 1) {
    warnings.push(`Report year ${report.year} seems unusual`)
    confidence -= 5
  }

  // Determine if valid
  const isValid = errors.length === 0 && confidence >= 50

  return {
    isValid,
    errors,
    warnings,
    confidence: Math.max(0, Math.min(100, confidence)),
  }
}

/**
 * Check if extracted data seems fabricated
 */
export function detectHallucination(report: ESGReport, pdfText: string): {
  isHallucination: boolean
  reason: string
} {
  // Check company name
  if (
    report.company !== "Unknown" &&
    !pdfText.toLowerCase().includes(report.company.toLowerCase())
  ) {
    return {
      isHallucination: true,
      reason: `Company name "${report.company}" does not appear in the PDF text`,
    }
  }

  // Check for placeholder names
  const placeholderPatterns = ["greentech", "innovations", "sustainability inc", "eco corp"]
  const companyLower = report.company.toLowerCase()

  if (placeholderPatterns.some((pattern) => companyLower.includes(pattern))) {
    // Double check it's actually in the PDF
    if (!pdfText.toLowerCase().includes(companyLower)) {
      return {
        isHallucination: true,
        reason: `Company name "${report.company}" appears to be fabricated and is not in the PDF`,
      }
    }
  }

  // Check if we have metrics but no text mentions sustainability
  const sustainabilityTerms = [
    "emission",
    "carbon",
    "sustainability",
    "environmental",
    "renewable",
    "ghg",
    "co2",
    "scope",
  ]

  const textLower = pdfText.toLowerCase()
  const hasSustainabilityTerms = sustainabilityTerms.some((term) =>
    textLower.includes(term)
  )

  if (Object.keys(report.metrics).length > 5 && !hasSustainabilityTerms) {
    return {
      isHallucination: true,
      reason: "Extracted many metrics but PDF text contains no sustainability terminology",
    }
  }

  return {
    isHallucination: false,
    reason: "",
  }
}

