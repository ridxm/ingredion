# Quick Setup Guide

Follow these simple steps to get the Ingredion ESG Platform running:

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

## Step 2: Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key

## Step 3: Configure Environment

Create a file named `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Replace `sk-your-key-here` with your actual OpenAI API key.

## Step 4: Start the Application

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 5: Upload Your First Report

1. Open the application in your browser
2. Click **Admin** in the sidebar
3. Click the **Upload Reports** tab
4. Upload a sustainability report PDF
5. Wait for processing (this may take 30-60 seconds)
6. Go to **Dashboard** to see the extracted data

## What Happens During Upload?

1. **File Upload**: PDF is saved to `data/uploads/`
2. **Text Extraction**: PDF text is extracted using pdf-parse
3. **AI Processing**: OpenAI analyzes the text and extracts ESG metrics
4. **Insight Generation**: AI generates strategic insights
5. **Data Storage**: Everything is saved as JSON in `data/reports/`
6. **Dashboard Update**: Dashboard automatically loads the new data

## Sample Data

The project includes sample data for Ingredion:
- File: `data/reports/ingredion-2024.json`
- This demonstrates the expected data structure

## Troubleshooting

### "Failed to process PDF"
- Check your OpenAI API key is correct
- Ensure you have API credits available
- Try a smaller PDF file first

### "No data available" on Dashboard
- Upload at least one report first
- Check `data/reports/` folder contains JSON files

### Module not found errors
- Run `npm install --legacy-peer-deps` again
- Delete `node_modules` and reinstall

## Next Steps

Once you have data loaded:

1. **Dashboard**: View KPIs, charts, and insights
2. **Target Analyzer**: Track progress toward goals
3. **Competitive Intelligence**: Compare with peers
4. **Framework Readiness**: Check GRI, TCFD, SBTi alignment
5. **Insights**: Review AI-generated recommendations

## Support

For questions or issues, check:
- Full documentation: `README.md`
- JSON schema: `data/schema.json`
- API logs in your terminal

## Development Tips

- Data is stored in JSON files (no database needed)
- All uploaded PDFs are saved in `data/uploads/`
- Extracted data is in `data/reports/`
- You can manually edit JSON files for testing
- The dashboard automatically reloads when data changes

