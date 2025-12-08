"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"

const frameworks = {
  GRI: {
    coverage: 92,
    metrics: [
      { name: "Energy Management", coverage: 100, status: "complete" },
      { name: "Emissions", coverage: 95, status: "complete" },
      { name: "Water", coverage: 85, status: "in-progress" },
      { name: "Waste", coverage: 90, status: "complete" },
    ],
  },
  TCFD: {
    coverage: 78,
    metrics: [
      { name: "Governance", coverage: 95, status: "complete" },
      { name: "Strategy", coverage: 75, status: "in-progress" },
      { name: "Risk Management", coverage: 70, status: "in-progress" },
      { name: "Metrics", coverage: 65, status: "planned" },
    ],
  },
  SBTi: {
    coverage: 85,
    metrics: [
      { name: "Science-based targets", coverage: 85, status: "complete" },
      { name: "Scope 1&2", coverage: 92, status: "complete" },
      { name: "Scope 3", coverage: 72, status: "in-progress" },
      { name: "Verification", coverage: 85, status: "complete" },
    ],
  },
  SDGs: {
    coverage: 72,
    metrics: [
      { name: "SDG 6 - Water", coverage: 80, status: "complete" },
      { name: "SDG 7 - Energy", coverage: 90, status: "complete" },
      { name: "SDG 12 - Waste", coverage: 75, status: "in-progress" },
      { name: "SDG 15 - Biodiversity", coverage: 55, status: "planned" },
    ],
  },
}

export default function FrameworkReadiness({ company }) {
  const [activeFramework, setActiveFramework] = useState("GRI")
  const current = frameworks[activeFramework]

  const statusIcons = {
    complete: <CheckCircle2 size={16} className="text-primary" />,
    "in-progress": <Clock size={16} className="text-yellow-500" />,
    planned: <AlertCircle size={16} className="text-destructive" />,
  }

  return (
    <div className="p-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Framework Readiness</h1>
        <p className="text-muted-foreground">ESG Reporting Framework Coverage</p>
      </div>

      {/* Framework Tabs */}
      <div className="flex gap-2 border-b border-border/20">
        {Object.keys(frameworks).map((fw) => (
          <button
            key={fw}
            onClick={() => setActiveFramework(fw)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeFramework === fw
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {fw}
          </button>
        ))}
      </div>

      {/* Coverage Overview */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass p-6 rounded-lg border border-border/20 col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">{activeFramework} Coverage</h2>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full transition-all"
                  style={{ width: `${current.coverage}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{current.coverage}% complete</p>
            </div>
            <p className="text-4xl font-bold text-primary">{current.coverage}%</p>
          </div>
        </div>

        <div className="glass p-6 rounded-lg border border-border/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span className="text-sm text-foreground">Complete: 4</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-500" />
              <span className="text-sm text-foreground">In Progress: 2</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              <span className="text-sm text-foreground">Planned: 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Metrics Breakdown</h2>
        <div className="space-y-3">
          {current.metrics.map((metric, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
              {statusIcons[metric.status]}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{metric.name}</p>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${metric.coverage}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground">{metric.coverage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Over Time */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Coverage Trend</h2>
        <div className="space-y-2">
          {[
            { year: "2023", coverage: 68 },
            { year: "2024", coverage: 78 },
            { year: "2025", coverage: 92 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-16 text-sm font-medium text-foreground">{item.year}</span>
              <div className="flex-1 bg-secondary rounded-full h-3">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${item.coverage}%` }}></div>
              </div>
              <span className="w-12 text-sm font-bold text-foreground">{item.coverage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Frameworks Overview */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">All Frameworks</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(frameworks).map(([fw, data]) => (
            <div key={fw} className="p-4 bg-secondary/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">{fw}</p>
              <p className="text-3xl font-bold text-primary">{data.coverage}%</p>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${data.coverage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
