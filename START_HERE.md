# Quick Start Guide - Tax Analyzer

## Your AI-Powered Tax Planning Tool is Ready!

### What You Built
A comprehensive tax return analysis system that:
- ✅ Extracts income data from PDF tax returns using AI/OCR
- ✅ Manages multiple entities (Individuals, Groups, Trusts) 
- ✅ Provides consolidated income analysis and visualizations
- ✅ Validates and corrects extracted data
- ✅ Stores everything locally (no external uploads)

### Current Status
- ✅ Backend server: **RUNNING** on http://localhost:5000
- ✅ Database: **READY** (SQLite)
- ✅ AI Service: **CONFIGURED** (using mock data - add OpenAI key for real AI)
- ⏳ Frontend: **NEEDS DEPENDENCIES** (run `npm install` in frontend folder)

## How to Get Started

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Frontend
```bash
npm run dev
```
The app will open at http://localhost:3000

### 3. Test the System

#### Create Your First Entity:
1. Go to "Manage Entities" tab
2. Click "Add Entity"
3. Enter name: "John Smith" 
4. Select type: "Individual"
5. Click "Create"

#### Upload a Tax Return:
1. Go to "Upload Tax Returns" tab
2. Select "John Smith" from dropdown
3. Set tax year: "2023-24"
4. Drag & drop a PDF tax return (or any PDF for testing)
5. Click "Upload & Process"

#### View Your Analysis:
1. Go to "Dashboard" tab
2. See consolidated income analysis
3. Review charts and breakdowns

### 4. Add Real AI Processing (Optional)
To use real AI instead of mock data:
1. Get OpenAI API key from https://platform.openai.com/
2. Edit `backend/.env`
3. Set: `OPENAI_API_KEY=your_key_here`
4. Restart backend: `Ctrl+C` then `node src/server.js`

## Features Overview

### 📊 Dashboard
- Total income across all entities
- Income breakdown by source (employment, business, investment, etc.)
- Tax calculations and franking credits
- Visual charts and analytics

### 📁 Entity Management  
- Create/edit entities (Individual/Group/Trust)
- Track tax returns per entity
- View entity-specific summaries

### 📄 Tax Return Upload
- Drag & drop PDF uploads
- AI/OCR text extraction
- Automatic income data extraction
- Processing progress indicators

### ✅ Data Validation
- Review AI-extracted data
- Manual corrections and edits  
- Built-in validation rules
- Confidence scoring

## System Architecture

```
Frontend (React/TypeScript)  ←→  Backend (Node.js/Express)
     ↓                                    ↓
Material-UI Dashboard              SQLite Database
     ↓                                    ↓
Charts & Visualizations          AI/OCR Processing
```

## File Locations
- **Database**: `/workspace/tax-analyzer/tax_analyzer.db`
- **Uploads**: `/workspace/tax-analyzer/backend/uploads/`
- **Logs**: Backend console output
- **Config**: `/workspace/tax-analyzer/backend/.env`

## API Status
- ✅ Health Check: http://localhost:5000/api/health
- ✅ Entities: Working
- ✅ File Upload: Working  
- ✅ AI Processing: Working (mock data)
- ✅ Analytics: Working

## Troubleshooting

**Backend not starting?**
- Check if port 5000 is free: `lsof -i :5000`
- Look for error messages in console

**Frontend not loading?**
- Run `npm install` in frontend directory
- Check if port 3000 is available

**PDF processing failing?**
- Ensure PDFs are not password protected
- Check file size (10MB limit)
- OCR fallback will try if text extraction fails

**AI extraction not working?**
- System uses mock data without OpenAI key
- Add real API key to `.env` for actual AI processing

## Next Steps
1. Test with your actual tax returns
2. Add more entities (trusts, businesses)
3. Configure OpenAI API for real AI processing
4. Customize dashboard for your specific needs

## Support
- Check browser console for frontend errors
- Backend logs show in terminal
- All data stored locally - completely private

**Congratulations! Your tax planning tool is ready to use.** 🎉