"use client"
import { BarChart3, TrendingUp, Activity, Lightbulb, Settings } from "lucide-react"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "compare", label: "Compare", icon: TrendingUp },
  { id: "data-quality", label: "Data Quality", icon: Activity },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "admin", label: "Admin", icon: Settings },
]

export default function Sidebar({ currentPage, onPageChange }) {
  return (
    <div className="w-56 flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#050506]">
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#141518] rounded-sm flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
            <span className="text-[#F5F5F6] font-semibold text-xs">I</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-[#F5F5F6] truncate">Ingredion</h1>
            <p className="text-xs text-[#A0A3AA]">ESG Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 font-medium group ${
                isActive
                  ? "bg-[#141518] text-[#F5F5F6] border border-[rgba(255,255,255,0.1)]"
                  : "text-[#A0A3AA] hover:text-[#F5F5F6] hover:bg-[#0F1012]"
              }`}
            >
              <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-2 border-t border-[rgba(255,255,255,0.06)]">
        <button className="w-full px-3 py-2 bg-[#141518] text-xs text-[#F5F5F6] font-medium rounded-md border border-[rgba(255,255,255,0.1)] hover:bg-[#1A1D22] transition-colors duration-150">
          Export
        </button>
      </div>
    </div>
  )
}
