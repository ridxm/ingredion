from google import genai
import os, json
from typing import List, Dict
import re

class MetricsExtractor:
    def __init__(self, api_key: str = None):
        if api_key is None:
            api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Google API key not found. Please set GOOGLE_API_KEY.")
        self.client = genai.Client(api_key=api_key)

    def extract_company_info(self, text_chunks: List[str]) -> Dict:
        """Extract company name and year from the document."""
        # Use the first chunk which usually has header/title info
        first_chunk = text_chunks[0] if text_chunks else ""
        
        prompt = """
        From this sustainability report text, extract ONLY:
        1. The exact company name (as written in the report)
        2. The report year (the year the data is for, not publication date)

        Return ONLY valid JSON in this exact format:
        {"company": "Company Name Here", "year": 2024}

        If you cannot find the company name, use "Unknown".
        If you cannot find the year, use the current year.
        
        Do NOT include any explanations or markdown. Return ONLY the JSON.

        Text:
        {text}
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt.format(text=first_chunk[:8000])
            )
            raw_text = response.text.strip()
            
            # Try to parse JSON
            try:
                parsed = json.loads(raw_text)
                return parsed
            except json.JSONDecodeError:
                match = re.search(r'\{[^}]+\}', raw_text, re.DOTALL)
                if match:
                    return json.loads(match.group())
                return {"company": "Unknown", "year": 2024}
        except Exception as e:
            print(f"Error extracting company info: {e}")
            return {"company": "Unknown", "year": 2024}

    def extract_metrics(self, text_chunks: List[str]) -> Dict:
        """Extract ESG metrics from all text chunks."""
        
        # Comprehensive prompt for ESG metric extraction
        base_prompt = """
You are an expert ESG data extraction assistant. Extract ALL sustainability metrics from the following text.

CRITICAL RULES:
1. Extract ONLY metrics that are EXPLICITLY stated with numbers in the text
2. DO NOT make up, estimate, or infer any values
3. Include the EXACT unit as written in the report
4. If a metric is mentioned but no value is given, DO NOT include it

For each metric found, extract:
- metric_name: The standard name (use these exact names when applicable):
  * "Scope 1 Emissions" - direct GHG emissions
  * "Scope 2 Emissions" - indirect from purchased energy
  * "Scope 3 Emissions" - value chain emissions
  * "Total GHG Emissions" - total greenhouse gas
  * "Renewable Energy Percentage" - % of renewable energy
  * "Total Energy Consumption" - total energy used
  * "Water Withdrawal" - total water intake
  * "Water Intensity" - water per unit production
  * "Waste to Landfill" - waste sent to landfill
  * "Waste Recycled Percentage" - % waste recycled
  * "Employee Turnover Rate" - staff turnover %
  * "Women in Leadership" - % women in management
  * "Safety Incident Rate" or "TRIR" - safety incidents
  * "Board Independence" - % independent directors
  
- value: The numeric value (as a number, not string)
- unit: The exact unit from the report (e.g., "kt CO2e", "metric tons CO2e", "%", "m³", "GWh")
- year: The year the data is for (if specified)
- category: One of "Environmental", "Social", "Governance"
- confidence: Your confidence in the extraction (0.0 to 1.0)
- source_text: The exact phrase/sentence where you found this value (for verification)

Return ONLY a valid JSON array. No explanations, no markdown code fences.
Example format:
[
  {{"metric_name": "Scope 1 Emissions", "value": 450, "unit": "kt CO2e", "year": 2024, "category": "Environmental", "confidence": 0.95, "source_text": "Scope 1 emissions were 450 kt CO2e"}},
  {{"metric_name": "Renewable Energy Percentage", "value": 62, "unit": "%", "year": 2024, "category": "Environmental", "confidence": 0.9, "source_text": "62% of our energy came from renewable sources"}}
]

If NO metrics are found in the text, return an empty array: []

Text to analyze:
{text}

Remember: Return ONLY the JSON array, nothing else.
"""

        all_metrics = []
        seen_metrics = set()  # Track unique metrics to avoid duplicates
        
        for i, chunk in enumerate(text_chunks):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=base_prompt.format(text=chunk)
                )

                raw_text = response.text.strip()
                print(f"Chunk {i+1}/{len(text_chunks)} - Raw response length: {len(raw_text)}")
                
                try:
                    parsed = json.loads(raw_text)
                    if isinstance(parsed, list):
                        for metric in parsed:
                            # Create a unique key to avoid duplicates
                            key = f"{metric.get('metric_name', '')}_{metric.get('year', '')}"
                            if key not in seen_metrics:
                                seen_metrics.add(key)
                                all_metrics.append(metric)
                            else:
                                # If duplicate, keep the one with higher confidence
                                existing_idx = next((i for i, m in enumerate(all_metrics) 
                                    if f"{m.get('metric_name', '')}_{m.get('year', '')}" == key), None)
                                if existing_idx is not None:
                                    existing_conf = all_metrics[existing_idx].get('confidence', 0)
                                    new_conf = metric.get('confidence', 0)
                                    if new_conf > existing_conf:
                                        all_metrics[existing_idx] = metric
                    elif isinstance(parsed, dict):
                        key = f"{parsed.get('metric_name', '')}_{parsed.get('year', '')}"
                        if key not in seen_metrics:
                            seen_metrics.add(key)
                            all_metrics.append(parsed)
                            
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    match = re.search(r'\[[\s\S]*\]', raw_text)
                    if match:
                        try:
                            parsed = json.loads(match.group())
                            if isinstance(parsed, list):
                                for metric in parsed:
                                    key = f"{metric.get('metric_name', '')}_{metric.get('year', '')}"
                                    if key not in seen_metrics:
                                        seen_metrics.add(key)
                                        all_metrics.append(metric)
                        except:
                            print(f"Could not parse extracted JSON from chunk {i+1}")
                    else:
                        print(f"No valid JSON found in chunk {i+1}")
                        
            except Exception as e:
                print(f"Error processing chunk {i+1}: {e}")
                continue
                
        return all_metrics
