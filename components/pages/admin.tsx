"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UploadReport from "@/components/upload-report"
import { FileText, Settings } from "lucide-react"

interface AdminProps {
  onUploadSuccess?: (companyName: string) => void
}

export default function Admin({ onUploadSuccess }: AdminProps) {
  return (
    <div className="p-6 space-y-6 bg-[#050506] min-h-screen">
      <div>
        <h1 className="text-3xl font-semibold text-[#F5F5F6] tracking-tight">Admin Panel</h1>
        <p className="text-sm text-[#A0A3AA] mt-1">Upload reports and manage system settings</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)]">
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#141518]">
            <FileText className="w-4 h-4 mr-2" />
            Upload Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#141518]">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <UploadReport onUploadSuccess={onUploadSuccess} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] rounded-md p-6">
            <h3 className="text-sm font-semibold text-[#F5F5F6] mb-4">System Configuration</h3>
            <p className="text-sm text-[#A0A3AA]">Settings panel coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
