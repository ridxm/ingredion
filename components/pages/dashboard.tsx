"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ArrowUp, ArrowDown, Zap, Droplet, Trash2, Leaf, Users, Shield, Loader2 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import DataQualityCard from "@/components/data-quality-card"

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141518] border border-[rgba(255,255,255,0.1)] rounded-md p-2 text-xs text-[#F5F5F6]">
        {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}
      </div>
    )
  }
  return null
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toLocaleString()
}

export default function Dashboard({ company = "Ingredion" }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/data?company=${encodeURIComponent(company)}&endpoint=dashboard`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
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
          <p className="text-sm text-[#A0A3AA]">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#050506] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-4">{error || "No data available"}</p>
          <p className="text-xs text-[#A0A3AA]">Please upload a sustainability report to get started</p>
        </div>
      </div>
    )
  }

  const metrics = data.metrics || {}
  const insights = data.insights || []

  // Build KPIs from extracted metrics
  const kpis = [
    {
      label: "Total Emissions",
      value: metrics.totalEmissions 
        ? `${formatLargeNumber(metrics.totalEmissions)} MT`
        : metrics.scope1 && metrics.scope2 
          ? `${formatLargeNumber(metrics.scope1 + metrics.scope2)} MT`
          : "N/A",
      sublabel: "Scope 1 + 2",
      icon: Zap,
    },
    {
      label: "Carbon Reduction",
      value: metrics.carbonReductionPct ? `${metrics.carbonReductionPct}%` : "N/A",
      sublabel: "vs baseline",
      icon: TrendingUp,
    },
    {
      label: "Renewable Energy",
      value: metrics.renewableElectricity 
        ? `${metrics.renewableElectricity}%` 
        : metrics.totalEnergy && metrics.totalEnergy < 100
          ? `${metrics.totalEnergy}%`
          : "N/A",
      sublabel: "of total",
      icon: Leaf,
    },
    {
      label: "Water Use",
      value: metrics.waterWithdrawal 
        ? `${formatLargeNumber(metrics.waterWithdrawal)} m³` 
        : "N/A",
      sublabel: "total withdrawal",
      icon: Droplet,
    },
    {
      label: "Waste Diverted",
      value: metrics.wasteLandfillAvoidance 
        ? `${metrics.wasteLandfillAvoidance}%` 
        : "N/A",
      sublabel: "from landfill",
      icon: Trash2,
    },
    {
      label: "Safety (TRIR)",
      value: metrics.trir ? `${metrics.trir}` : "N/A",
      sublabel: "per 200k hours",
      icon: Shield,
    },
  ]

  // Build emissions breakdown chart
  const emissionsBreakdown = []
  if (metrics.scope1) emissionsBreakdown.push({ name: "Scope 1", value: metrics.scope1 })
  if (metrics.scope2) emissionsBreakdown.push({ name: "Scope 2", value: metrics.scope2 })
  if (metrics.scope3) emissionsBreakdown.push({ name: "Scope 3", value: metrics.scope3 })

  // Additional metrics to display
  const additionalMetrics = [
    { label: "Scope 1", value: metrics.scope1 ? formatLargeNumber(metrics.scope1) + " MT" : "—" },
    { label: "Scope 2", value: metrics.scope2 ? formatLargeNumber(metrics.scope2) + " MT" : "—" },
    { label: "Scope 3", value: metrics.scope3 ? formatLargeNumber(metrics.scope3) + " MT" : "—" },
    { label: "Total Waste", value: metrics.totalWaste ? formatLargeNumber(metrics.totalWaste) + " MT" : "—" },
    { label: "Sustainable Agriculture", value: metrics.sustainableAgriculture ? formatLargeNumber(metrics.sustainableAgriculture) + " acres" : "—" },
    { label: "Sustainable Sourcing", value: metrics.sustainableSourcing ? metrics.sustainableSourcing + "%" : "—" },
    { label: "Zero Injury Facilities", value: metrics.zeroInjuryFacilities ? metrics.zeroInjuryFacilities + "%" : "—" },
    { label: "Women on Board", value: metrics.womenBoard ? metrics.womenBoard + "%" : "—" },
    { label: "Board Independence", value: metrics.boardIndependence ? metrics.boardIndependence + "%" : "—" },
  ]

  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      <div>
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">{company} • {data.year}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div
              key={i}
              className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className="text-[#A0A3AA]" />
              </div>
              <h3 className="text-xs text-[#6B6E76] mb-1 font-medium">{kpi.label}</h3>
              <p className="text-lg font-semibold text-[#F5F5F6]">{kpi.value}</p>
              <p className="text-xs text-[#6B6E76] mt-1">{kpi.sublabel}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Emissions Breakdown Chart */}
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 col-span-2">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Emissions Breakdown</h2>
          {emissionsBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={emissionsBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" style={{ fontSize: "12px" }} />
                <YAxis stroke="rgba(255,255,255,0.15)" style={{ fontSize: "12px" }} width={60} tickFormatter={(v) => formatLargeNumber(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-[#6B6E76]">
              No emissions data available
            </div>
          )}
        </div>

        {/* Data Quality Card */}
        <DataQualityCard dataQuality={data.dataQuality} />
      </div>

      {/* Additional Metrics Grid */}
      <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">All Extracted Metrics</h2>
        <div className="grid grid-cols-3 gap-3">
          {additionalMetrics.map((metric, i) => (
            <div key={i} className="p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded-md">
              <p className="text-xs text-[#6B6E76] mb-1">{metric.label}</p>
              <p className="text-sm font-medium text-[#F5F5F6]">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">AI Insights</h2>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded text-sm"
              >
                <p className="text-xs text-[#F5F5F6] mb-2 font-medium">{insight.title}</p>
                <div className="flex gap-1.5">
                  {insight.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-[rgba(255,255,255,0.06)] text-[#A0A3AA] rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
