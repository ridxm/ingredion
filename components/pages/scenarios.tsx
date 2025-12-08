"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const scenarioData = [
  { year: 2024, baseline: 340, accelerated: 340, lowImprovement: 340, highAmbition: 340 },
  { year: 2025, baseline: 320, accelerated: 310, lowImprovement: 335, highAmbition: 305 },
  { year: 2026, baseline: 300, accelerated: 275, lowImprovement: 330, highAmbition: 265 },
  { year: 2027, baseline: 280, accelerated: 240, lowImprovement: 325, highAmbition: 220 },
  { year: 2028, baseline: 260, accelerated: 205, lowImprovement: 320, highAmbition: 175 },
  { year: 2029, baseline: 240, accelerated: 170, lowImprovement: 315, highAmbition: 130 },
  { year: 2030, baseline: 225, accelerated: 135, lowImprovement: 310, highAmbition: 85 },
]

export default function Scenarios({ company }) {
  const [assumptions, setAssumptions] = useState({
    reductionRate: 6,
    renewableIncrease: 8,
    waterImprovement: 5,
  })

  const presets = [
    { name: "Accelerated 2030", reduction: 12, renewable: 15, water: 10 },
    { name: "Low Improvement", reduction: 3, renewable: 5, water: 2 },
    { name: "High Ambition", reduction: 15, renewable: 20, water: 12 },
  ]

  return (
    <div className="p-8 space-y-8 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Scenario Modeling</h1>
        <p className="text-muted-foreground">What-if analysis for emission reduction paths</p>
      </div>

      {/* Assumptions Form */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Scenario Assumptions</h2>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Annual Emission Reduction</label>
            <input
              type="range"
              min="0"
              max="20"
              value={assumptions.reductionRate}
              onChange={(e) => setAssumptions({ ...assumptions, reductionRate: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-primary font-bold mt-2">{assumptions.reductionRate}%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Renewable Electricity Increase</label>
            <input
              type="range"
              min="0"
              max="25"
              value={assumptions.renewableIncrease}
              onChange={(e) => setAssumptions({ ...assumptions, renewableIncrease: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-primary font-bold mt-2">{assumptions.renewableIncrease}%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Water Intensity Improvement</label>
            <input
              type="range"
              min="0"
              max="15"
              value={assumptions.waterImprovement}
              onChange={(e) => setAssumptions({ ...assumptions, waterImprovement: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-primary font-bold mt-2">{assumptions.waterImprovement}%</p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                setAssumptions({
                  reductionRate: preset.reduction,
                  renewableIncrease: preset.renewable,
                  waterImprovement: preset.water,
                })
              }
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Projection Chart */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Projection: Baseline vs Scenario vs Target</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
            />
            <Legend />
            <Line type="monotone" dataKey="baseline" stroke="#60A5FA" strokeWidth={2} name="Baseline (No Action)" />
            <Line type="monotone" dataKey="accelerated" stroke="#4ADE80" strokeWidth={2} name="Accelerated Path" />
            <Line type="monotone" dataKey="lowImprovement" stroke="#FB923C" strokeWidth={2} name="Low Improvement" />
            <Line type="monotone" dataKey="highAmbition" stroke="#10B981" strokeWidth={2} name="High Ambition" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Results Table */}
      <div className="glass p-6 rounded-lg border border-border/20">
        <h2 className="text-lg font-semibold text-foreground mb-4">Scenario Projections</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Year</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Baseline</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Accelerated</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Low Improvement</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">High Ambition</th>
                <th className="px-4 py-3 text-center text-muted-foreground font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {scenarioData.map((row, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-secondary/20">
                  <td className="px-4 py-3 text-foreground font-medium">{row.year}</td>
                  <td className="px-4 py-3 text-center text-foreground">{row.baseline}</td>
                  <td className="px-4 py-3 text-center text-foreground">{row.accelerated}</td>
                  <td className="px-4 py-3 text-center text-foreground">{row.lowImprovement}</td>
                  <td className="px-4 py-3 text-center text-foreground">{row.highAmbition}</td>
                  <td className="px-4 py-3 text-center font-bold text-primary">
                    {i === 0 ? 450 : Math.max(225 - i * 20, 85)}
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
