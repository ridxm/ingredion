"use client"

import { useState } from "react"
import { Copy, Zap, Clock, Tag } from "lucide-react"

const insightCategories = [
  "Executive Summary",
  "Target Status Summary",
  "Peer Comparison Summary",
  "Risk & Gap Summary",
  "Priority Summary",
]

const insights = {
  "Executive Summary": {
    title: "ESG Performance Overview – {company}",
    content: `Ingredion is progressing well on its 2030 All Life Plan targets. Emissions are down 24.4% since 2020, renewable energy adoption stands at 62%, and the company ranks 3rd among peers. Key challenges include supply chain transparency and water intensity trending above target. Immediate actions recommended in renewable energy acceleration and supply chain audits.`,
    tags: ["Emissions", "Energy", "Performance"],
    time: "2 hours ago",
  },
  "Target Status Summary": {
    title: "Target Progress Analysis",
    content: `Current trajectory shows on-track progress for 2030 goals. Emissions reduction pace at 6.2% annually exceeds required 5.5%. However, water intensity increased 1.2% year-over-year, requiring focused interventions. Supply chain scope 3 emissions require accelerated decarbonization to meet science-based targets. Recommend quarterly review of trajectory.`,
    tags: ["Targets", "Water", "Alert"],
    time: "1 hour ago",
  },
  "Peer Comparison Summary": {
    title: "Competitive Position Analysis",
    content: `Ingredion maintains strong competitive position. 22% lower emissions intensity than peer median, leading renewable energy adoption at 62%, outpacing average by 12 percentage points. Rank improved from 4th to 3rd in overall ESG leadership. TCFD disclosure coverage at 78% vs peer average 71%. Maintain momentum on renewable transitions to expand leadership position.`,
    tags: ["Competitive", "Performance", "Energy"],
    time: "3 hours ago",
  },
  "Risk & Gap Summary": {
    title: "Risk Assessment & Mitigation",
    content: `Primary risks: (1) Water intensity trending 1.5% above 2030 target – recommend enhanced efficiency initiatives. (2) Scope 3 emissions represent 65% of total with limited supplier data – implement mandatory emissions reporting. (3) TCFD alignment at 78% – prioritize climate risk scenario analysis. Secondary risks in biodiversity tracking (SDG 15) at 55% coverage require expanded metrics. Mitigation roadmap prepared.`,
    tags: ["Risk", "Water", "Supply Chain"],
    time: "4 hours ago",
  },
}

export default function Insights({ company }) {
  const [activeCategory, setActiveCategory] = useState("Executive Summary")
  const [copied, setCopied] = useState(false)
  const insight = insights[activeCategory]

  const handleCopy = () => {
    navigator.clipboard.writeText(insight.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Insights</h1>
          <p className="text-muted-foreground">AI-Generated ESG Analysis</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
          <Zap size={16} />
          Generate New Insight
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border/20 overflow-x-auto">
        {insightCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeCategory === category
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Insight Card */}
      <div className="glass p-8 rounded-lg border border-border/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{insight.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={14} />
                Generated {insight.time}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-invert mb-6">
          <p className="text-foreground leading-relaxed text-base">{insight.content}</p>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {insight.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/15 text-primary rounded-full text-xs font-medium"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        {copied && (
          <div className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded-lg text-sm text-primary">
            Copied to clipboard!
          </div>
        )}
      </div>

      {/* Recent Insights */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">All Generated Insights</h2>
        <div className="space-y-3">
          {insightCategories.map((category, i) => (
            <div
              key={i}
              onClick={() => setActiveCategory(category)}
              className="glass p-4 rounded-lg border border-border/20 hover:bg-secondary/20 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{category}</p>
                  <p className="text-xs text-muted-foreground mt-1">{3 - i} hours ago</p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">View</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
