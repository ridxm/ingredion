#!/bin/bash

# Gemini ESG Extractor - Setup Script
# This script sets up the Python environment for the Gemini extractor

set -e

echo "🔧 Setting up Gemini ESG Extractor..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Navigate to python_extractor directory
cd "$(dirname "$0")/python_extractor"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set GOOGLE_API_KEY in your .env.local file"
echo "2. Run 'npm run dev' to start the Next.js development server"
echo "3. Upload PDFs through the website to test extraction"
echo ""
echo "For more information, see GEMINI_EXTRACTOR_SETUP.md"
