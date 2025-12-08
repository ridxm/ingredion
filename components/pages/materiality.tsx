"use client"

import { useState } from "react"

const priorities = [
  {
    name: "Renewable Energy",
    materiality: 92,
    urgency: 85,
    impact: 95,
    feasibility: 75,
    score: 94,
    pillar: "Planet Life",
  },
  {
    name: "Water Management",
    materiality: 88,
    urgency: 78,
    impact: 85,
    feasibility: 70,
    score: 88,
    pillar: "Planet Life",
  },
  {
    name: "Supply Chain Emissions",
    materiality: 85,
    urgency: 80,
    impact: 90,
    feasibility: 60,
    score: 82,
    pillar: "Planet Life",
  },
  {
    name: "Waste Reduction",
    materiality: 82,
    urgency: 72,
    impact: 80,
    feasibility: 85,
    score: 79,
    pillar: "Planet Life",
  },
  { name: "Biodiversity", materiality: 75, urgency: 65, impact: 80, feasibility: 55, score: 71, pillar: "Planet Life" },
]

const pillars = ["All", "Planet Life", "Everyday Life", "Connected Life"]

export default function Materiality({ company }) {
  const [activePillar, setActivePillar] = useState("All")
  const [sortBy, setSortBy] = useState("score")

  const filtered = activePillar === "All" ? priorities : priorities.filter((p) => p.pillar === activePillar)
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="p-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Materiality & Priority Engine</h1>
        <p className="text-muted-foreground">ESG Priorities Powered by AI Scoring</p>
      </div>

      {/* Top Priorities Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Top 5 Priorities</h2>
        <div className="space-y-2">
          {sorted.slice(0, 5).map((p, i) => (
            <div
              key={i}
              className="glass p-4 rounded-lg border border-border/20 flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{i + 1}</span>
                  <p className="font-medium text-foreground">{p.name}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.pillar}</p>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-primary">{p.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Matrix */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Priority Matrix</h2>
        <div className="bg-secondary/30 rounded-lg p-6 aspect-square relative border border-border/30">
          {/* Grid lines */}
          <div className="absolute inset-6 border border-dashed border-border/30 rounded"></div>
          <div className="absolute inset-6 flex">
            <div className="flex-1 border-r border-dashed border-border/30"></div>
            <div className="flex-1"></div>
          </div>

          {/* Axis labels */}
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Urgency →</span>
          <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground rotate-180 origin-center">
            Impact →
          </span>

          {/* Quadrant labels */}
          <span className="absolute top-8 right-8 text-xs text-muted-foreground font-medium">Quick Wins</span>
          <span className="absolute bottom-8 right-8 text-xs text-muted-foreground font-medium">Transformative</span>
          <span className="absolute top-8 left-8 text-xs text-muted-foreground font-medium">Monitor</span>
          <span className="absolute bottom-8 left-8 text-xs text-muted-foreground font-medium">Low Priority</span>

          {/* Priority dots */}
          {sorted.map((p, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center cursor-pointer hover:bg-primary/40 transition-colors glow-green"
              style={{
                left: `${(p.urgency / 100) * 80 + 10}%`,
                bottom: `${(p.impact / 100) * 80 + 10}%`,
              }}
              title={p.name}
            >
              <span className="text-xs font-bold text-primary">{i + 1}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
          {sorted.slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">
                {i + 1}: {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="glass p-4 rounded-lg border border-border/20 flex gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">All Life Pillar</label>
          <select
            value={activePillar}
            onChange={(e) => setActivePillar(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {pillars.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="score">Overall Score</option>
            <option value="materiality">Materiality</option>
            <option value="urgency">Urgency</option>
            <option value="impact">Impact</option>
          </select>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">All Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Metric</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Materiality</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Urgency</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Impact</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Feasibility</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Score</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Pillar</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-foreground font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-center text-foreground">{p.materiality}</td>
                  <td className="px-4 py-3 text-center text-foreground">{p.urgency}</td>
                  <td className="px-4 py-3 text-center text-foreground">{p.impact}</td>
                  <td className="px-4 py-3 text-center text-foreground">{p.feasibility}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded font-bold">{p.score}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground text-xs">{p.pillar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
