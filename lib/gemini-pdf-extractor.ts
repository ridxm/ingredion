import { spawn } from "child_process"
import { join } from "path"

interface ExtractionResult {
  success: boolean
  file_path?: string
  num_pages?: number
  num_chunks?: number
  metrics?: any[]
  total_metrics_extracted?: number
  error?: string
}

/**
 * Call Python extractor service to extract metrics from PDF
 * @param filePath - Path to the PDF file
 * @param apiKey - Google Gemini API key
 * @returns Promise with extraction results
 */
export async function extractMetricsWithGemini(filePath: string, apiKey: string): Promise<ExtractionResult> {
  return new Promise((resolve, reject) => {
    const pythonPath = join(process.cwd(), "python_extractor", "extractor_service.py")

    const pythonProcess = spawn("python3", [pythonPath, filePath, apiKey], {
      cwd: join(process.cwd(), "python_extractor"),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        GOOGLE_API_KEY: apiKey,
      },
    })

    let stdout = ""
    let stderr = ""

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString()
      console.error("[Python]", data.toString())
    })

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python process exited with code:", code)
        console.error("Stderr:", stderr)
        reject(new Error(`Python extractor failed with code ${code}: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout) as ExtractionResult
        resolve(result)
      } catch (error) {
        console.error("Failed to parse Python output:", stdout)
        reject(new Error(`Failed to parse extraction results: ${error}`))
      }
    })

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`))
    })
  })
}

/**
 * Transform extracted metrics to ESGReport format
 */
export function transformMetricsToReport(extractedMetrics: any[]) {
  const report = {
    metrics: {} as Record<string, any>,
    rawMetrics: extractedMetrics,
  }

  // Map Gemini output to standard metric names
  for (const metric of extractedMetrics) {
    if (metric.metric_name && metric.value) {
      const key = metric.metric_name.toLowerCase().replace(/\s+/g, "_")
      report.metrics[key] = {
        value: parseFloat(metric.value),
        unit: metric.unit || "",
        year: metric.year,
        category: metric.category,
      }
    }
  }

  return report
}
