import type { ESGReport, Insight } from "./types"

/**
 * Generate basic insights from extracted ESG data (without OpenAI)
 * This generates insights directly from the metrics without calling an API
 */
export async function generateInsights(reportData: ESGReport): Promise<Insight[]> {
  try {
    const insights: Insight[] = []

    // Generate insights based on available metrics
    if (reportData.metrics) {
      const metrics = reportData.metrics as Record<string, any>

      // Environmental insights
      if (metrics.totalEmissions || metrics.scope1 || metrics.scope2) {
        insights.push({
          id: "1",
          title: "Emissions Tracking",
          description: `Company has tracked emissions across ${Object.keys(metrics).filter(k => k.includes("scope") || k.includes("emission")).length} categories`,
          category: "Environmental",
          severity: "positive",
          tags: ["emissions", "tracking"],
          generatedAt: new Date().toISOString(),
        })
      }

      // Energy insights
      if (metrics.renewable_energy_pct || metrics.totalEnergyConsumption) {
        const renewablePercent = (metrics.renewable_energy_pct as number) || 0
        insights.push({
          id: "2",
          title: "Renewable Energy Progress",
          description: `${renewablePercent}% of energy comes from renewable sources`,
          category: "Environmental",
          severity: renewablePercent > 50 ? "positive" : "alert",
          tags: ["energy", "renewable"],
          generatedAt: new Date().toISOString(),
        })
      }

      // Water metrics
      if (metrics.waterWithdrawal || metrics.waterRecycled) {
        insights.push({
          id: "3",
          title: "Water Management",
          description: `Company is tracking water withdrawal and recycling initiatives`,
          category: "Environmental",
          severity: "positive",
          tags: ["water", "conservation"],
          generatedAt: new Date().toISOString(),
        })
      }

      // Waste management
      if (metrics.waste_landfill_pct !== undefined) {
        insights.push({
          id: "4",
          title: "Waste Reduction",
          description: `${metrics.waste_landfill_pct}% of waste is sent to landfill`,
          category: "Environmental",
          severity: (metrics.waste_landfill_pct as number) < 30 ? "positive" : "alert",
          tags: ["waste", "reduction"],
          generatedAt: new Date().toISOString(),
        })
      }
    }

    // If no metrics available, return a basic insight
    if (insights.length === 0) {
      insights.push({
        id: "1",
        title: "Report Successfully Extracted",
        description: `ESG metrics have been successfully extracted from ${reportData.company}'s ${reportData.year} report`,
        category: "General",
        severity: "positive",
        tags: ["extraction", "complete"],
        generatedAt: new Date().toISOString(),
      })
    }

    return insights
  } catch (error) {
    console.error("Error generating insights:", error)
    // Return empty array on error - insights are optional
    return []
  }
}

/**
 * Generate strategic priorities based on ESG data
 */
export async function generatePriorities(reportData: ESGReport) {
  try {
    // Return empty priorities for now - can be enhanced with AI later
    return []
  } catch (error) {
    console.error("Error generating priorities:", error)
    return []
  }
}

