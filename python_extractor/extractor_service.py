import json
import sys
from pathlib import Path
from pdf_parser import PDFParser
from gemini_extractor import MetricsExtractor

def extract_pdf_metrics(file_path: str, api_key: str) -> dict:
    """
    Main service function to extract metrics from a PDF file.
    Returns a JSON-serializable dictionary with extracted metrics.
    """
    try:
        # Initialize PDF parser
        parser = PDFParser(chunk_size=4000, chunk_overlap=200)
        
        # Extract and chunk text from PDF
        print(f"Extracting text from {file_path}...", file=sys.stderr)
        chunks = parser.extract_text(file_path)
        print(f"Extracted {len(chunks)} text chunks", file=sys.stderr)
        
        # Get document info
        doc_info = parser.get_document_info(file_path)
        print(f"Document has {doc_info['num_pages']} pages", file=sys.stderr)
        
        # Initialize Gemini extractor
        extractor = MetricsExtractor(api_key=api_key)
        
        # Extract metrics from all chunks
        print("Extracting metrics from chunks...", file=sys.stderr)
        all_metrics = extractor.extract_metrics(chunks)
        
        # Return results
        result = {
            "success": True,
            "file_path": file_path,
            "num_pages": doc_info['num_pages'],
            "num_chunks": len(chunks),
            "metrics": all_metrics,
            "total_metrics_extracted": len(all_metrics)
        }
        
        return result
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "file_path": file_path
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments: file_path and api_key"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    api_key = sys.argv[2]
    
    result = extract_pdf_metrics(file_path, api_key)
    print(json.dumps(result))
