"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, CheckCircle } from "lucide-react"

const targetData = {
  emissions: {
    data: [
      { year: 2020, actual: 450, target: 450 },
      { year: 2021, actual: 425, target: 435 },
      { year: 2022, actual: 400, target: 420 },
      { year: 2023, actual: 365, target: 405 },
      { year: 2024, actual: 340, target: 390 },
      { year: 2025, actual: null, target: 375 },
      { year: 2030, actual: null, target: 225 },
    ],
    status: "on-track",
    gap: 165,
    required: 16.5,
    progress: 64,
  },
  energy: {
    data: [
      { year: 2020, actual: 38, target: 38 },
      { year: 2021, actual: 45, target: 45 },
      { year: 2022, actual: 52, target: 55 },
      { year: 2023, actual: 59, target: 65 },
      { year: 2024, actual: 62, target: 75 },
      { year: 2025, actual: null, target: 82 },
      { year: 2030, actual: null, target: 100 },
    ],
    status: "ahead",
    gap: 38,
    required: 7.6,
    progress: 62,
  },
}

const tabs = ["Emissions", "Energy", "Water", "Waste", "Agriculture"]

export default function TargetAnalyzer({ company }) {
  const [activeTab, setActiveTab] = useState("Emissions")
  const data = targetData[activeTab.toLowerCase()] || targetData.emissions

  const statusColor = {
    "on-track": "text-primary bg-primary/10",
    "at-risk": "text-destructive bg-destructive/10",
    ahead: "text-primary bg-primary/10",
  }

  return (
    <div className="p-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Target Gap Analyzer</h1>
        <p className="text-muted-foreground">2030 All Life Plan Progress – {company}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/20">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass p-4 rounded-lg border border-border/20">
          <h3 className="text-xs text-muted-foreground mb-2">Status</h3>
          <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${statusColor[data.status]}`}>
            {data.status === "on-track" ? "✓ On Track" : data.status === "ahead" ? "↑ Ahead" : "⚠ At Risk"}
          </div>
        </div>
        <div className="glass p-4 rounded-lg border border-border/20">
          <h3 className="text-xs text-muted-foreground mb-2">Gap to 2030</h3>
          <p className="text-2xl font-bold text-foreground">{data.gap}</p>
        </div>
        <div className="glass p-4 rounded-lg border border-border/20">
          <h3 className="text-xs text-muted-foreground mb-2">Yearly Improvement</h3>
          <p className="text-2xl font-bold text-foreground">{data.required}%</p>
        </div>
        <div className="glass p-4 rounded-lg border border-border/20">
          <h3 className="text-xs text-muted-foreground mb-2">Progress</h3>
          <p className="text-2xl font-bold text-primary">{data.progress}%</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">{activeTab} Trend & Target</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#4ADE80" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#60A5FA"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Values Table */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Yearly Values</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Year</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actual</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Target</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Gap</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.slice(0, 6).map((row, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-foreground font-medium">{row.year}</td>
                  <td className="px-4 py-3 text-foreground">{row.actual || "—"}</td>
                  <td className="px-4 py-3 text-foreground">{row.target}</td>
                  <td className="px-4 py-3 text-foreground">
                    {row.actual ? (row.target - row.actual).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.actual && row.actual <= row.target ? (
                      <CheckCircle size={16} className="text-primary" />
                    ) : (
                      <AlertCircle size={16} className="text-destructive" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
