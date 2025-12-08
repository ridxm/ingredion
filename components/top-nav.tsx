"use client"

import { Search, ChevronDown, Command, User, Bell } from "lucide-react"
import { useState, useEffect } from "react"

export default function TopNav({ company, onCompanyChange }) {
  const [isCompanyOpen, setIsCompanyOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [companies, setCompanies] = useState<string[]>(["Ingredion"])

  // Load available companies from API
  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/data?endpoint=companies")
        if (response.ok) {
          const data = await response.json()
          if (data.companies && data.companies.length > 0) {
            setCompanies(data.companies)
          }
        }
      } catch (error) {
        console.error("Error loading companies:", error)
      }
    }
    loadCompanies()
  }, [])

  return (
    <>
      <div className="border-b border-[rgba(255,255,255,0.06)] h-14 flex items-center justify-between px-6 gap-6 bg-[#050506] sticky top-0 z-40">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6E76]" />
            <input
              type="text"
              placeholder="Search metrics, targets, companies…"
              className="w-full pl-9 pr-3 py-2 bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md text-sm text-[#F5F5F6] placeholder-[#6B6E76] focus:outline-none focus:border-[rgba(255,255,255,0.12)] focus:ring-1 focus:ring-[rgba(255,255,255,0.08)] transition-all duration-150"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md text-sm font-medium text-[#F5F5F6] hover:bg-[#141518] hover:border-[rgba(255,255,255,0.1)] transition-all duration-150"
            >
              {company}
              <ChevronDown size={14} className="flex-shrink-0" />
            </button>

            {isCompanyOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md py-1 z-50 animate-in fade-in slide-in-from-top-1">
                {companies.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onCompanyChange(c)
                      setIsCompanyOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors duration-100 ${
                      c === company
                        ? "bg-[#141518] text-[#F5F5F6] font-medium"
                        : "text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#141518]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCommandOpen(!isCommandOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0F1012] border border-[rgba(255,255,255,0.06)] text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#141518] rounded-md text-sm transition-all duration-150"
          >
            <Command size={14} />
            <span className="text-xs text-[#6B6E76]">⌘K</span>
          </button>

          <button className="p-2 text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#0F1012] rounded-md transition-all duration-150">
            <Bell size={16} />
          </button>

          <button className="p-2 text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#0F1012] rounded-md transition-all duration-150">
            <User size={16} />
          </button>
        </div>
      </div>

      {isCommandOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0F1012] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl animate-in fade-in slide-in-from-top-8 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
              <input
                type="text"
                placeholder="Go to…"
                autoFocus
                className="w-full bg-transparent text-sm text-[#F5F5F6] placeholder-[#6B6E76] focus:outline-none"
              />
            </div>
            <div className="p-1">
              {["Dashboard", "Targets", "Compare", "Insights"].map((item) => (
                <button
                  key={item}
                  onClick={() => setIsCommandOpen(false)}
                  className="w-full text-left px-3 py-2 text-sm text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#141518] rounded transition-colors duration-100"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
