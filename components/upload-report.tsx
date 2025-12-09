"use client"

import { useState } from "react"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"

interface UploadReportProps {
  onUploadSuccess?: (companyName: string) => void
}

export default function UploadReport({ onUploadSuccess }: UploadReportProps) {
  const [files, setFiles] = useState<File[]>([])
  const [companyName, setCompanyName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setStatus("idle")
      setMessage("")
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    if (!companyName.trim()) {
      setStatus("error")
      setMessage("Please enter a company name")
      return
    }

    setUploading(true)
    setStatus("processing")
    setProgress(10)
    setMessage("Uploading and processing PDF...")

    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    formData.append("companyName", companyName.trim())

    try {
      setProgress(30)
      setMessage("Extracting text from PDF...")

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })

      setProgress(60)
      setMessage("Analyzing ESG data with AI...")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const errorMessage = errorData.error || errorData.details || "Upload failed"
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      setProgress(100)
      setStatus("success")
      setMessage(`Successfully processed ${files.length} report(s) for ${companyName}`)
      setExtractedData(data)
      
      // Notify parent component if callback provided
      if (onUploadSuccess && data.results && data.results.length > 0) {
        setTimeout(() => {
          onUploadSuccess(companyName.trim())
        }, 2000)
      }
    } catch (error) {
      setStatus("error")
      const errorMessage = error instanceof Error ? error.message : "Failed to process report"
      setMessage(errorMessage)
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#F5F5F6] mb-2">Upload Sustainability Report</h2>
            <p className="text-sm text-[#A0A3AA]">
              Upload PDF reports to automatically extract ESG metrics and insights
            </p>
          </div>

          {/* Company Name Input */}
          <div>
            <label className="block text-sm font-medium text-[#F5F5F6] mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name (e.g., Ingredion, Cargill, ADM)"
              className="w-full px-4 py-3 bg-[#141518] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-[#F5F5F6] placeholder-[#6B6E76] focus:outline-none focus:border-[rgba(255,255,255,0.2)] focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]"
              disabled={uploading}
            />
            <p className="text-xs text-[#6B6E76] mt-1">
              This name will be used to identify the company in comparisons and dashboards
            </p>
          </div>

          <div className="border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-lg p-8 text-center hover:border-[rgba(255,255,255,0.2)] transition-colors">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-[#6B6E76] mx-auto mb-4" />
              <p className="text-sm font-medium text-[#F5F5F6] mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-[#A0A3AA]">PDF files only</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-[#141518] border border-[rgba(255,255,255,0.06)] rounded-md"
                >
                  <FileText className="w-5 h-5 text-[#A0A3AA]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F6] truncate">{file.name}</p>
                    <p className="text-xs text-[#6B6E76]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A0A3AA]">{message}</span>
                <span className="text-[#F5F5F6]">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-500">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-500">{message}</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || !companyName.trim() || uploading}
            className="w-full bg-[#F5F5F6] text-[#050506] hover:bg-[#E5E7EB] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload and Extract Data
              </>
            )}
          </Button>
        </div>
      </Card>

      {extractedData && extractedData.results && (
        <Card className="bg-[#0F1012] border border-[rgba(255,255,255,0.06)] p-6">
          <h3 className="text-sm font-semibold text-[#F5F5F6] mb-4">Extraction Summary</h3>
          
          {extractedData.results.map((result: any, idx: number) => (
            <div key={idx} className="space-y-3">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#141518] rounded-md">
                <div>
                  <p className="text-xs text-[#6B6E76] mb-1">Company</p>
                  <p className="text-sm font-medium text-[#F5F5F6]">{result.company}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6E76] mb-1">Year</p>
                  <p className="text-sm font-medium text-[#F5F5F6]">{result.year}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6E76] mb-1">Metrics Extracted</p>
                  <p className="text-sm font-medium text-green-500">
                    {result.metricsCount || Object.keys(result.metrics || {}).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6E76] mb-1">Data Quality Score</p>
                  <p className="text-sm font-medium text-[#F5F5F6]">
                    {result.dataQuality?.score || 0}%
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#A0A3AA] bg-[#141518] p-3 rounded-md">
                <p className="font-medium mb-2">Extracted Metrics:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.metrics || {}).slice(0, 10).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span className="font-medium text-[#F5F5F6]">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                  {Object.keys(result.metrics || {}).length > 10 && (
                    <div className="col-span-2 text-[#6B6E76]">
                      +{Object.keys(result.metrics || {}).length - 10} more metrics...
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#A0A3AA]">
                Navigate to Dashboard to view full analysis, or Compare to compare with other companies
              </p>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
