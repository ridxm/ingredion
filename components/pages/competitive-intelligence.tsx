"use client"

import { useState } from "react"
import {
  RadarChart,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

const radarData = [
  { metric: "Emissions", Ingredion: 85, ADM: 65, Cargill: 60, "Tate & Lyle": 75 },
  { metric: "Water", Ingredion: 78, ADM: 72, Cargill: 68, "Tate & Lyle": 75 },
  { metric: "Energy", Ingredion: 88, ADM: 70, Cargill: 72, "Tate & Lyle": 80 },
  { metric: "Waste", Ingredion: 75, ADM: 68, Cargill: 72, "Tate & Lyle": 70 },
  { metric: "Framework", Ingredion: 92, ADM: 78, Cargill: 85, "Tate & Lyle": 88 },
]

const rankingData = [
  { company: "Ingredion", score: 84 },
  { company: "Tate & Lyle", score: 78 },
  { company: "Cargill", score: 74 },
  { company: "ADM", score: 71 },
  { company: "BASF", score: 65 },
]

export default function CompetitiveIntelligence({ company }) {
  const [selectedCompanies, setSelectedCompanies] = useState(["Ingredion", "ADM", "Cargill"])
  const [metric, setMetric] = useState("emissions-intensity")

  return (
    <div className="p-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Competitive Intelligence</h1>
        <p className="text-muted-foreground">Compare {company} against peers</p>
      </div>

      {/* Filters */}
      <div className="glass p-6 rounded-lg border border-border/20 flex gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">Companies</label>
          <div className="flex gap-2 flex-wrap">
            {["Ingredion", "ADM", "Cargill", "Tate & Lyle", "BASF"].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(c)}
                  onChange={() =>
                    setSelectedCompanies(
                      selectedCompanies.includes(c)
                        ? selectedCompanies.filter((x) => x !== c)
                        : [...selectedCompanies, c],
                    )
                  }
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="emissions-intensity">Emissions Intensity</option>
            <option value="renewable-energy">Renewable Energy %</option>
            <option value="water-efficiency">Water Efficiency</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass p-6 rounded-lg border border-border/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
              <Radar name="Ingredion" dataKey="Ingredion" stroke="#4ADE80" fill="#4ADE80" fillOpacity={0.2} />
              <Radar name="ADM" dataKey="ADM" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking */}
        <div className="glass p-6 rounded-lg border border-border/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Overall Ranking</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
              <YAxis
                dataKey="company"
                type="category"
                stroke="rgba(255,255,255,0.5)"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Bar dataKey="score" fill="#4ADE80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peer Delta Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { metric: "Emissions Intensity", delta: "-22%", label: "vs Peer Median" },
          { metric: "Renewable Energy", delta: "+8%", label: "vs Peer Median" },
          { metric: "Water Efficiency", delta: "-5%", label: "vs Peer Median" },
        ].map((item, i) => (
          <div key={i} className="glass p-4 rounded-lg border border-border/20">
            <p className="text-sm text-muted-foreground mb-1">{item.metric}</p>
            <p className="text-2xl font-bold text-primary mb-1">{item.delta}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6 rounded-lg border border-border/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Lowest Emissions Intensity</h2>
          <div className="space-y-2">
            {rankingData.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <span className="font-medium text-foreground">
                  {i + 1}. {r.company}
                </span>
                <span className="text-sm text-primary font-bold">{r.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-lg border border-border/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Best Water Efficiency</h2>
          <div className="space-y-2">
            {rankingData.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <span className="font-medium text-foreground">
                  {i + 1}. {r.company}
                </span>
                <span className="text-sm text-primary font-bold">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Values Table */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Raw Data Values</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Company</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Emissions</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Energy</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Water</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Framework</th>
              </tr>
            </thead>
            <tbody>
              {["Ingredion", "ADM", "Cargill", "Tate & Lyle", "BASF"].map((c, i) => (
                <tr key={c} className="border-b border-border/10 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-foreground font-medium">{c}</td>
                  <td className="px-4 py-3 text-foreground">340</td>
                  <td className="px-4 py-3 text-foreground">62%</td>
                  <td className="px-4 py-3 text-foreground">2.8</td>
                  <td className="px-4 py-3 text-foreground">92%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
