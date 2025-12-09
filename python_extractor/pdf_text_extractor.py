"""
Simple PDF text extractor - outputs just the text for use by other systems
"""
import sys
import json
from PyPDF2 import PdfReader

def extract_text(file_path: str) -> dict:
    """Extract text from PDF and return as JSON."""
    try:
        with open(file_path, 'rb') as file:
            pdf = PdfReader(file)
            text = ''
            for page in pdf.pages:
                page_text = page.extract_text() or ''
                text += page_text + '\n'
            
            return {
                "success": True,
                "text": text,
                "num_pages": len(pdf.pages),
                "text_length": len(text)
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "num_pages": 0,
            "text_length": 0
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing file path argument"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = extract_text(file_path)
    print(json.dumps(result))

