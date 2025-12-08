"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, Loader2 } from "lucide-react"
import DataQualityCard from "@/components/data-quality-card"

interface DataQualityPageProps {
  company?: string
}

export default function DataQualityPage({ company = "Ingredion" }: DataQualityPageProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/data?company=${encodeURIComponent(company)}&endpoint=report`)

        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }

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

  if (!data || !data.dataQuality) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen">
        <div>
          <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Data Quality</h1>
          <p className="text-sm text-[#A0A3AA] mt-1">No data quality information available</p>
        </div>
      </div>
    )
  }

  const { dataQuality } = data
  const { metricDetails } = dataQuality

  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      <div>
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Data Quality</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">
          Metric normalization, validation, and quality analysis
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <DataQualityCard dataQuality={dataQuality} />

        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-6 col-span-2">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Metric Details</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {metricDetails.map((metric, i) => (
              <div
                key={i}
                className="p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#F5F5F6]">{metric.name}</p>
                      {metric.dataQuality === "high" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {metric.dataQuality === "medium" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      {metric.dataQuality === "low" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-[#A0A3AA]">
                        {metric.value} {metric.unit}
                      </p>
                      {metric.originalUnit && metric.originalUnit !== metric.unit && (
                        <p className="text-xs text-[#6B6E76]">
                          (from {metric.originalValue} {metric.originalUnit})
                        </p>
                      )}
                      <p className="text-xs text-[#6B6E76]">
                        Confidence: {(metric.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
                {metric.warnings.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    {metric.warnings.map((warning, j) => (
                      <p key={j} className="text-xs text-yellow-500">
                        ⚠ {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-6">
        <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Normalization Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-[#6B6E76] mb-2">Total Metrics Extracted</p>
            <p className="text-2xl font-bold text-[#F5F5F6]">{metricDetails.length}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B6E76] mb-2">Unit Conversions Applied</p>
            <p className="text-2xl font-bold text-[#F5F5F6]">
              {metricDetails.filter((m) => m.originalUnit && m.originalUnit !== m.unit).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B6E76] mb-2">Average Confidence</p>
            <p className="text-2xl font-bold text-[#F5F5F6]">
              {metricDetails.length > 0
                ? (
                    (metricDetails.reduce((sum, m) => sum + m.confidence, 0) / metricDetails.length) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
