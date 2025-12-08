import OpenAI from "openai"
import type { ESGReport, Insight } from "./types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate AI insights from extracted ESG data
 */
export async function generateInsights(reportData: ESGReport): Promise<Insight[]> {
  try {
    const prompt = `You are an ESG strategy consultant analyzing sustainability performance data.

Given the following ESG data for ${reportData.company} (${reportData.year}):

Metrics:
${JSON.stringify(reportData.metrics, null, 2)}

Framework Coverage:
${JSON.stringify(reportData.frameworks, null, 2)}

Targets:
${JSON.stringify(reportData.targets, null, 2)}

Generate 3-5 strategic insights about this company's ESG performance. Each insight should:
1. Identify a key trend, achievement, risk, or opportunity
2. Provide actionable context
3. Be categorized by topic area
4. Have an appropriate severity level

Return a JSON array of insights in this format:
[
  {
    "id": "1",
    "title": "Brief insight title",
    "description": "Detailed description with context and implications",
    "category": "Energy|Water|Emissions|Waste|Social|Governance|Supply Chain",
    "severity": "positive|alert|warning|action",
    "tags": ["tag1", "tag2"],
    "generatedAt": "${new Date().toISOString()}"
  }
]

Focus on:
- Performance vs targets
- Year-over-year trends
- Framework alignment gaps
- Strategic priorities
- Risk areas
- Opportunities for improvement
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert ESG strategist providing data-driven insights. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0].message.content || '{"insights": []}'
    const response = JSON.parse(responseText)
    
    // Handle both array and object responses
    const insights = Array.isArray(response) ? response : (response.insights || [])

    return insights.map((insight: any, index: number) => ({
      id: insight.id || String(index + 1),
      title: insight.title || "Insight",
      description: insight.description || "",
      category: insight.category || "General",
      severity: insight.severity || "warning",
      tags: insight.tags || [insight.category],
      generatedAt: insight.generatedAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Error generating insights:", error)
    
    // Return default insights if AI fails
    return [
      {
        id: "1",
        title: "Data successfully extracted",
        description: `ESG data for ${reportData.company} has been extracted and is ready for analysis.`,
        category: "General",
        severity: "positive",
        tags: ["Data Quality", "Positive"],
        generatedAt: new Date().toISOString(),
      },
    ]
  }
}

/**
 * Generate strategic priorities based on ESG data
 */
export async function generatePriorities(reportData: ESGReport) {
  try {
    const prompt = `Based on this ESG data, identify the top 5 strategic priorities for ${reportData.company}.

Data:
${JSON.stringify(reportData.metrics, null, 2)}

Return JSON array of priorities:
[
  {
    "name": "Priority name",
    "score": 85,
    "urgent": true,
    "category": "Energy|Water|Waste|Supply|Land|Social"
  }
]
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an ESG strategist. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0].message.content || '{"priorities": []}'
    const response = JSON.parse(responseText)
    
    return Array.isArray(response) ? response : (response.priorities || [])
  } catch (error) {
    console.error("Error generating priorities:", error)
    return []
  }
}

