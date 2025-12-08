"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ArrowUp, ArrowDown, Zap, Droplet, Trash2, Leaf, Target, Loader2 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import DataQualityCard from "@/components/data-quality-card"

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141518] border border-[rgba(255,255,255,0.1)] rounded-md p-2 text-xs text-[#F5F5F6]">
        {payload[0].value}
      </div>
    )
  }
  return null
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

  const emissionsData = data.emissionsHistory || []
  const peerData = data.peerComparison || []
  const metrics = data.metrics || {}
  const frameworks = data.frameworks || {}
  const targets = data.targets || []
  const insights = data.insights || []

  // Calculate total scope 1+2
  const totalScope12 = (metrics.scope1 || 0) + (metrics.scope2 || 0)
  
  // Find net zero target progress
  const netZeroTarget = targets.find((t: any) => t.category === "Emissions")
  
  // Calculate peer rank
  const companyIndex = peerData.findIndex((p: any) => p.company === company)
  const peerRank = companyIndex >= 0 ? `${companyIndex + 1} of ${peerData.length}` : "N/A"

  const kpis = [
    {
      label: "Total Scope 1+2",
      value: `${totalScope12} kt CO₂e`,
      change: "-5.2%",
      positive: true,
      icon: Zap,
    },
    {
      label: "Renewable %",
      value: `${metrics.renewable_energy_pct || 0}%`,
      change: "+12%",
      positive: true,
      icon: Leaf,
    },
    {
      label: "Water Intensity",
      value: `${metrics.water_intensity || 0} m³/t`,
      change: "-3.1%",
      positive: true,
      icon: Droplet,
    },
    {
      label: "Waste to Landfill",
      value: `${metrics.waste_landfill_pct || 0}%`,
      change: "+1.2%",
      positive: false,
      icon: Trash2,
    },
    {
      label: "Peer Rank",
      value: peerRank,
      change: "↑",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "2030 Progress",
      value: `${netZeroTarget?.progress || 0}%`,
      change: "On track",
      positive: true,
      icon: Target,
    },
  ]

  // Generate priorities from targets
  const priorities = targets.slice(0, 5).map((target: any) => ({
    name: target.name,
    score: target.progress,
    urgent: target.progress < 50,
    category: target.category,
  }))

  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      <div>
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">{company}</p>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <button
              key={i}
              className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 hover:border-[rgba(255,255,255,0.12)] hover:bg-[#141518] transition-all duration-200 hover:scale-[1.02] cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className="text-[#A0A3AA] group-hover:text-[#F5F5F6] transition-colors" />
                <span
                  className={`text-xs font-medium flex items-center gap-0.5 ${kpi.positive ? "text-[#A0A3AA]" : "text-[#A0A3AA]"}`}
                >
                  {kpi.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-xs text-[#6B6E76] mb-1 font-medium">{kpi.label}</h3>
              <p className="text-base font-semibold text-[#F5F5F6]">{kpi.value}</p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 col-span-2 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Emissions Trajectory</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={emissionsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.15)" style={{ fontSize: "12px" }} />
              <YAxis stroke="rgba(255,255,255,0.15)" style={{ fontSize: "12px" }} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#E5E7EB"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Peer Ranking</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={peerData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={true} />
              <XAxis type="number" stroke="rgba(255,255,255,0.15)" style={{ fontSize: "12px" }} />
              <YAxis dataKey="company" type="category" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: "11px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#9CA3AF" radius={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <DataQualityCard dataQuality={data.dataQuality} />
        
        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 col-span-2 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Top 5 Priorities</h2>
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <button
                key={i}
                className="w-full p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded-md hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1A1D22] transition-all duration-150 text-left group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[#F5F5F6] truncate">{p.name}</p>
                      {p.urgent && (
                        <span className="text-xs px-2 py-0.5 bg-[rgba(255,255,255,0.06)] text-[#A0A3AA] rounded flex-shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6E76]">{p.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#F5F5F6] flex-shrink-0">{p.score}%</span>
                </div>
                <div className="w-full bg-[#0F1012] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#E5E7EB] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${p.score}%` }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Framework Coverage</h2>
          <div className="space-y-3">
            {Object.entries(frameworks).map(([name, coverage], i) => (
              <div key={name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#F5F5F6]">{name}</span>
                  <span className="text-xs text-[#A0A3AA]">{coverage}%</span>
                </div>
                <div className="w-full bg-[#141518] rounded-full h-1.5">
                  <div
                    className="bg-[#A0A3AA] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${coverage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-4 hover:border-[rgba(255,255,255,0.1)] transition-colors duration-200">
        <h2 className="text-sm font-semibold text-[#F5F5F6] mb-4">Recent AI Insights</h2>
          <div className="space-y-2">
          {insights.slice(0, 3).map((insight: any, i: number) => (
            <button
              key={i}
              className="w-full p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded text-sm hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1A1D22] transition-all duration-150 text-left group cursor-pointer"
            >
              <p className="text-xs text-[#F5F5F6] mb-2 font-medium group-hover:text-white">{insight.title}</p>
              <div className="flex gap-1.5">
                {insight.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-[rgba(255,255,255,0.06)] text-[#A0A3AA] rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
