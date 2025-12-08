"use client"

import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { Card } from "./ui/card"
import type { DataQuality } from "@/lib/types"

interface DataQualityCardProps {
  dataQuality?: DataQuality
}

export default function DataQualityCard({ dataQuality }: DataQualityCardProps) {
  if (!dataQuality) return null

  const { score, warnings, missingRequiredMetrics, metricDetails } = dataQuality

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-6 h-6 text-green-500" />
    if (score >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    return <AlertCircle className="w-6 h-6 text-red-500" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    if (score >= 60) return "Moderate"
    return "Needs Improvement"
  }

  const highQualityCount = metricDetails.filter((m) => m.dataQuality === "high").length
  const mediumQualityCount = metricDetails.filter((m) => m.dataQuality === "medium").length
  const lowQualityCount = metricDetails.filter((m) => m.dataQuality === "low").length

  return (
    <Card className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F5F5F6]">Data Quality</h3>
          <div className="flex items-center gap-2">
            {getScoreIcon(score)}
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B6E76]">Quality Score</span>
          <span className={`font-medium ${getScoreColor(score)}`}>{getScoreLabel(score)}</span>
        </div>

        <div className="w-full bg-[#141518] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Metric Quality Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="text-center">
            <p className="text-xs text-[#6B6E76] mb-1">High Quality</p>
            <p className="text-lg font-semibold text-green-500">{highQualityCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#6B6E76] mb-1">Medium</p>
            <p className="text-lg font-semibold text-yellow-500">{mediumQualityCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#6B6E76] mb-1">Low Quality</p>
            <p className="text-lg font-semibold text-red-500">{lowQualityCount}</p>
          </div>
        </div>

        {/* Missing Required Metrics */}
        {missingRequiredMetrics.length > 0 && (
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-500 mb-1">
                  Missing Required Metrics ({missingRequiredMetrics.length})
                </p>
                <ul className="text-xs text-[#A0A3AA] space-y-1">
                  {missingRequiredMetrics.slice(0, 3).map((metric, i) => (
                    <li key={i}>• {metric}</li>
                  ))}
                  {missingRequiredMetrics.length > 3 && (
                    <li className="text-[#6B6E76]">
                      +{missingRequiredMetrics.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-500 mb-1">
                  Warnings ({warnings.length})
                </p>
                <ul className="text-xs text-[#A0A3AA] space-y-1 max-h-32 overflow-y-auto">
                  {warnings.slice(0, 5).map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                  {warnings.length > 5 && (
                    <li className="text-[#6B6E76]">+{warnings.length - 5} more...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* All Good */}
        {missingRequiredMetrics.length === 0 && warnings.length === 0 && score >= 80 && (
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-xs font-medium">All data quality checks passed</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

