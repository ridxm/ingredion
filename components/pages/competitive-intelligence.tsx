"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

interface CompanyData {
  company: string
  year: number
  metrics: Record<string, number>
}

const CHART_COLORS = ["#4ADE80", "#60A5FA", "#F472B6", "#FBBF24", "#A78BFA", "#34D399"]

const METRIC_LABELS: Record<string, string> = {
  carbonReductionPct: "Carbon Reduction %",
  totalEmissions: "Total Emissions",
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
  renewableElectricity: "Renewable Energy %",
  waterWithdrawal: "Water Use",
  wasteLandfillAvoidance: "Waste Diverted %",
  totalWaste: "Total Waste",
  trir: "Safety (TRIR)",
  zeroInjuryFacilities: "Zero Injury %",
  sustainableSourcing: "Sustainable Sourcing %",
  sustainableAgriculture: "Sustainable Agriculture",
  womenBoard: "Women on Board %",
  boardIndependence: "Board Independence %",
}

function formatValue(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M"
  if (value >= 1000) return (value / 1000).toFixed(1) + "K"
  return value.toLocaleString()
}

export default function CompetitiveIntelligence({ company }: { company: string }) {
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [companyData, setCompanyData] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState("carbonReductionPct")

  // Load available companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/data?endpoint=companies")
        if (response.ok) {
          const data = await response.json()
          if (data.companies && data.companies.length > 0) {
            setAvailableCompanies(data.companies)
            // Default select all companies (up to 5)
            setSelectedCompanies(data.companies.slice(0, 5))
          }
        }
      } catch (error) {
        console.error("Error loading companies:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCompanies()
  }, [])

  // Fetch data for selected companies
  useEffect(() => {
    async function fetchCompanyData() {
      if (selectedCompanies.length === 0) {
        setCompanyData([])
        return
      }

      const dataPromises = selectedCompanies.map(async (companyName) => {
        try {
          const response = await fetch(
            `/api/data?company=${encodeURIComponent(companyName)}&endpoint=dashboard`
          )
          if (response.ok) {
            const data = await response.json()
            return {
              company: companyName,
              year: data.year,
              metrics: data.metrics || {},
            }
          }
        } catch (error) {
          console.error(`Error fetching data for ${companyName}:`, error)
        }
        return null
      })

      const results = await Promise.all(dataPromises)
      setCompanyData(results.filter((r): r is CompanyData => r !== null))
    }

    fetchCompanyData()
  }, [selectedCompanies])

  const toggleCompany = (companyName: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyName)
        ? prev.filter((c) => c !== companyName)
        : [...prev, companyName]
    )
  }

  // Build comparison bar chart data
  const buildBarChartData = (metricKey: string) => {
    return companyData
      .filter((d) => d.metrics[metricKey] !== undefined)
      .map((d) => ({
        company: d.company,
        value: d.metrics[metricKey],
      }))
      .sort((a, b) => b.value - a.value)
  }

  // Build radar chart data for multiple metrics
  const buildRadarData = () => {
    const radarMetrics = [
      "carbonReductionPct",
      "renewableElectricity",
      "wasteLandfillAvoidance",
      "sustainableSourcing",
      "zeroInjuryFacilities",
    ]

    return radarMetrics.map((metric) => {
      const point: any = { metric: METRIC_LABELS[metric] || metric }
      companyData.forEach((d) => {
        point[d.company] = d.metrics[metric] || 0
      })
      return point
    })
  }

  // Build comparison table data
  const buildTableData = () => {
    const allMetrics = new Set<string>()
    companyData.forEach((d) => {
      Object.keys(d.metrics).forEach((m) => allMetrics.add(m))
    })

    return Array.from(allMetrics)
      .filter((m) => METRIC_LABELS[m])
      .map((metric) => ({
        metric,
        label: METRIC_LABELS[metric],
        values: companyData.map((d) => ({
          company: d.company,
          value: d.metrics[metric],
        })),
      }))
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#A0A3AA] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#A0A3AA]">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (availableCompanies.length === 0) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen">
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight mb-4">Compare</h1>
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-8 text-center">
          <p className="text-sm text-[#A0A3AA] mb-2">No companies available for comparison</p>
          <p className="text-xs text-[#6B6E76]">Upload sustainability reports in the Admin page to get started</p>
        </div>
      </div>
    )
  }

  const barChartData = buildBarChartData(selectedMetric)
  const radarData = buildRadarData()
  const tableData = buildTableData()

  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      <div>
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Compare</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">
          Compare ESG metrics across {availableCompanies.length} uploaded companies
        </p>
      </div>

      {/* Company Selection */}
      <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#F5F5F6] mb-3">Select Companies to Compare</h2>
        <div className="flex flex-wrap gap-2">
          {availableCompanies.map((c) => {
            const isSelected = selectedCompanies.includes(c)
            return (
              <button
                key={c}
                onClick={() => toggleCompany(c)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-green-500/20 border border-green-500/50 text-green-400"
                    : "bg-[#141518] border border-[rgba(255,255,255,0.06)] text-[#A0A3AA] hover:text-[#F5F5F6] hover:border-[rgba(255,255,255,0.12)]"
                }`}
              >
                {isSelected ? <Check className="w-4 h-4" /> : null}
                {c}
              </button>
            )
          })}
        </div>
        {selectedCompanies.length === 0 && (
          <p className="text-xs text-[#6B6E76] mt-2">Select at least one company to view comparisons</p>
        )}
      </div>

      {selectedCompanies.length > 0 && companyData.length > 0 && (
        <>
          {/* Metric Selector + Bar Chart */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#F5F5F6]">Metric Comparison</h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-1.5 bg-[#141518] border border-[rgba(255,255,255,0.1)] rounded-md text-sm text-[#F5F5F6] focus:outline-none"
                >
                  {Object.entries(METRIC_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={formatValue} />
                    <YAxis dataKey="company" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#141518", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
                      labelStyle={{ color: "#F5F5F6" }}
                      formatter={(value: number) => [formatValue(value), METRIC_LABELS[selectedMetric]]}
                    />
                    <Bar dataKey="value" fill="#4ADE80" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-[#6B6E76]">
                  No data for this metric
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
              <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="p-3 bg-[#141518] rounded-md">
                  <p className="text-xs text-[#6B6E76] mb-1">Companies Selected</p>
                  <p className="text-xl font-bold text-[#F5F5F6]">{selectedCompanies.length}</p>
                </div>
                <div className="p-3 bg-[#141518] rounded-md">
                  <p className="text-xs text-[#6B6E76] mb-1">With Data</p>
                  <p className="text-xl font-bold text-green-400">{companyData.length}</p>
                </div>
                {barChartData.length > 0 && (
                  <>
                    <div className="p-3 bg-[#141518] rounded-md">
                      <p className="text-xs text-[#6B6E76] mb-1">Highest ({METRIC_LABELS[selectedMetric]})</p>
                      <p className="text-sm font-medium text-green-400">{barChartData[0]?.company}</p>
                      <p className="text-xs text-[#A0A3AA]">{formatValue(barChartData[0]?.value || 0)}</p>
                    </div>
                    <div className="p-3 bg-[#141518] rounded-md">
                      <p className="text-xs text-[#6B6E76] mb-1">Lowest</p>
                      <p className="text-sm font-medium text-red-400">{barChartData[barChartData.length - 1]?.company}</p>
                      <p className="text-xs text-[#A0A3AA]">{formatValue(barChartData[barChartData.length - 1]?.value || 0)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Radar Chart - Performance Overview */}
          {companyData.length >= 2 && radarData.some((d) => Object.keys(d).length > 1) && (
            <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
              <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Performance Radar (% Metrics)</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9 }} />
                  {companyData.slice(0, 5).map((d, i) => (
                    <Radar
                      key={d.company}
                      name={d.company}
                      dataKey={d.company}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">All Metrics Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-4 py-3 text-left text-[#6B6E76] font-medium">Metric</th>
                    {companyData.map((d) => (
                      <th key={d.company} className="px-4 py-3 text-left text-[#F5F5F6] font-medium">
                        {d.company}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.metric} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#141518]">
                      <td className="px-4 py-3 text-[#A0A3AA]">{row.label}</td>
                      {row.values.map((v) => (
                        <td key={v.company} className="px-4 py-3 text-[#F5F5F6] font-medium">
                          {v.value !== undefined ? formatValue(v.value) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedCompanies.length > 0 && companyData.length === 0 && (
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-8 text-center">
          <Loader2 className="w-6 h-6 text-[#A0A3AA] animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#A0A3AA]">Loading comparison data...</p>
        </div>
      )}
    </div>
  )
}
