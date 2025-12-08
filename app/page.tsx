"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import TopNav from "@/components/top-nav"
import Dashboard from "@/components/pages/dashboard"
import TargetAnalyzer from "@/components/pages/target-analyzer"
import CompetitiveIntelligence from "@/components/pages/competitive-intelligence"
import Materiality from "@/components/pages/materiality"
import FrameworkReadiness from "@/components/pages/framework-readiness"
import DataQuality from "@/components/pages/data-quality"
import Scenarios from "@/components/pages/scenarios"
import Insights from "@/components/pages/insights"
import Admin from "@/components/pages/admin"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [company, setCompany] = useState("Ingredion")

  const handleUploadSuccess = (companyName: string) => {
    // Switch to the newly uploaded company and go to dashboard
    setCompany(companyName)
    setCurrentPage("dashboard")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard company={company} />
      case "targets":
        return <TargetAnalyzer company={company} />
      case "compare":
        return <CompetitiveIntelligence company={company} />
      case "materiality":
        return <Materiality company={company} />
      case "frameworks":
        return <FrameworkReadiness company={company} />
      case "data-quality":
        return <DataQuality company={company} />
      case "scenarios":
        return <Scenarios company={company} />
      case "insights":
        return <Insights company={company} />
      case "admin":
        return <Admin onUploadSuccess={handleUploadSuccess} />
      default:
        return <Dashboard company={company} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex flex-col flex-1">
        <TopNav company={company} onCompanyChange={setCompany} />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
