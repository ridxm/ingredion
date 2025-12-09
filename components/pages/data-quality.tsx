"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Loader2,
  XCircle,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface DataQualityPageProps {
  company?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  emissions: "Emissions & Carbon",
  energy: "Energy",
  water: "Water",
  waste: "Waste",
  packaging: "Packaging",
  agriculture: "Agriculture & Sourcing",
  biodiversity: "Biodiversity",
  safety: "Safety",
  social: "Workforce",
  diversity: "Diversity & Inclusion",
  training: "Training & Development",
  community: "Community",
  supply_chain: "Supply Chain",
  governance: "Governance",
  product: "Product",
}

export default function DataQualityPage({ company = "Ingredion" }: DataQualityPageProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["emissions", "energy", "water"]))

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/data?company=${encodeURIComponent(company)}&endpoint=report`)
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Error fetching data quality:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [company])

  const downloadCSV = async () => {
    try {
      const response = await fetch(`/api/data?company=${encodeURIComponent(company)}&endpoint=report`)
      const reportData = await response.json()
      
      // Generate CSV from all metrics
      const lines: string[] = []
      lines.push("Metric ID,Metric Name,Category,Status,Value,Unit,Confidence,Quality")
      
      if (reportData.extractionReport?.allMetricsStatus) {
        for (const [id, metric] of Object.entries(reportData.extractionReport.allMetricsStatus)) {
          const m = metric as any
          lines.push([
            id,
            `"${m.name}"`,
            m.category,
            m.extracted ? "EXTRACTED" : "NOT FOUND",
            m.value ?? "",
            `"${m.unit || ""}"`,
            m.confidence ?? "",
            m.dataQuality || "",
          ].join(","))
        }
      }
      
      const blob = new Blob([lines.join("\n")], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${company}-${data?.year || "2024"}-all-metrics.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading CSV:", err)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#A0A3AA] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#A0A3AA]">Loading data quality analysis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen">
        <h1 className="text-3xl font-semibold text-[#F5F5F6]">Data Quality</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">No data available</p>
      </div>
    )
  }

  const extractionReport = data.extractionReport || {}
  const summary = extractionReport.summary || {}
  const byCategory = extractionReport.byCategory || {}
  const categoryStats = extractionReport.categoryStats || {}

  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Data Quality</h1>
          <p className="text-sm text-[#A0A3AA] mt-1">
            Extraction coverage for {data.company} ({data.year}) • {summary.totalPossibleMetrics || 0} possible metrics
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded-md hover:bg-[#1a1b1f] transition-colors"
        >
          <Download className="w-4 h-4 text-[#A0A3AA]" />
          <span className="text-sm text-[#F5F5F6]">Export All Metrics CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">Quality Score</p>
          <p className="text-2xl font-bold text-[#F5F5F6]">{summary.qualityScore || 0}%</p>
        </div>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">Coverage</p>
          <p className="text-2xl font-bold text-blue-400">{summary.extractionCoverage || 0}%</p>
        </div>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">Extracted</p>
          <p className="text-2xl font-bold text-green-500">{summary.totalExtracted || 0}</p>
        </div>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">Not Found</p>
          <p className="text-2xl font-bold text-red-500">{summary.totalNotExtracted || 0}</p>
        </div>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">High Quality</p>
          <p className="text-2xl font-bold text-green-400">{summary.highQualityCount || 0}</p>
        </div>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <p className="text-xs text-[#6B6E76] mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-500">{summary.warningsCount || 0}</p>
        </div>
      </div>

      {/* Category Coverage Bar */}
      <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#F5F5F6] mb-3">Coverage by Category</h2>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(categoryStats).map(([category, stats]: [string, any]) => (
            <div key={category} className="text-center">
              <div className="h-2 bg-[#1a1b1f] rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${stats.coverage}%` }}
                />
              </div>
              <p className="text-xs text-[#6B6E76] truncate">{CATEGORY_LABELS[category]?.split(" ")[1] || category}</p>
              <p className="text-xs text-[#A0A3AA]">{stats.extracted}/{stats.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics by Category */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#F5F5F6]">All Metrics by Category</h2>
        
        {Object.entries(byCategory).map(([category, data]: [string, any]) => {
          const isExpanded = expandedCategories.has(category)
          const stats = categoryStats[category] || { extracted: 0, total: 0, coverage: 0 }
          
          return (
            <div key={category} className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#141518] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#6B6E76]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#6B6E76]" />
                  )}
                  <span className="text-sm font-medium text-[#F5F5F6]">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-green-500">{stats.extracted} extracted</span>
                  <span className="text-xs text-red-500">{stats.total - stats.extracted} missing</span>
                  <div className="w-20 h-2 bg-[#1a1b1f] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${stats.coverage}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#A0A3AA] w-10">{stats.coverage}%</span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-[rgba(255,255,255,0.06)]">
                  {/* Extracted Metrics */}
                  {data.extracted?.length > 0 && (
                    <div className="p-3 border-b border-[rgba(255,255,255,0.03)]">
                      <p className="text-xs text-green-500 mb-2 font-medium">✓ Extracted ({data.extracted.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {data.extracted.map((metric: any) => (
                          <div key={metric.id} className="p-2 bg-green-500/5 border border-green-500/20 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-[#F5F5F6]">{metric.name}</span>
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-green-400">
                                {metric.value} {metric.unit}
                              </span>
                              {metric.confidence && (
                                <span className="text-xs text-[#6B6E76]">
                                  ({Math.round(metric.confidence * 100)}% conf)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Not Extracted Metrics */}
                  {data.notExtracted?.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs text-red-500 mb-2 font-medium">✗ Not Found ({data.notExtracted.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {data.notExtracted.map((metric: any) => (
                          <div key={metric.id} className="p-2 bg-red-500/5 border border-red-500/10 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#A0A3AA]">{metric.name}</span>
                              <XCircle className="w-3 h-3 text-red-500/50" />
                            </div>
                            <span className="text-xs text-[#6B6E76]">{metric.standardUnit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Warnings Section */}
      {extractionReport.warnings?.length > 0 && (
        <div className="bg-[#0F1012] border border-yellow-500/20 rounded-md p-4">
          <h2 className="text-sm font-semibold text-yellow-500 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings ({extractionReport.warnings.length})
          </h2>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {extractionReport.warnings.map((warning: string, i: number) => (
              <p key={i} className="text-xs text-[#A0A3AA]">• {warning}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
