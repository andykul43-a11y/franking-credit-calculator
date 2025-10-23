# Tax Analyzer - AI-Powered Tax Planning Tool

A comprehensive tax return analysis tool that uses AI to extract income data from PDF tax returns and provides consolidated income analysis across individuals, groups, and trusts for tax planning purposes.

## Features

- **AI-Powered PDF Processing**: Upload PDF tax returns and automatically extract income data using OCR + AI
- **Entity Management**: Organize tax returns by Individual, Group, or Trust entities
- **Consolidated Analysis**: View total income across all entities with detailed breakdowns
- **Interactive Dashboard**: Visual charts and summaries of income sources and tax calculations
- **Data Validation**: Review and correct AI-extracted data with built-in validation rules
- **Local Storage**: All data stored locally using SQLite - no external uploads

## Technology Stack

### Frontend
- React 18 with TypeScript
- Material-UI for modern, responsive design
- Recharts for data visualizations
- React Dropzone for file uploads
- Vite for fast development and building

### Backend
- Node.js with Express
- SQLite for local data storage
- PDF-Parse + Tesseract.js for PDF text extraction
- OpenAI API for intelligent data extraction
- Multer for file upload handling

## Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager
- OpenAI API key (optional - system provides mock data without it)

## Installation & Setup

### 1. Clone and Navigate
```bash
cd tax-analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## Configuration

### Environment Variables (Backend)
Edit `backend/.env`:
```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here  # Optional - uses mock data if not provided
NODE_ENV=development
```

**Note**: The system works without an OpenAI API key by providing realistic mock data for testing.

## Running the Application

### Development Mode

1. **Start the Backend Server:**
```bash
cd backend
npm run dev
```
The backend server will start on http://localhost:5000

2. **Start the Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:3000

3. **Access the Application:**
Open your browser to http://localhost:3000

## Using the Tax Analyzer

### Step 1: Create Entities
1. Go to the "Manage Entities" tab
2. Click "Add Entity" 
3. Enter entity name and select type (Individual/Group/Trust)
4. Save the entity

### Step 2: Upload Tax Returns
1. Go to "Upload Tax Returns" tab
2. Select the entity from dropdown
3. Enter the tax year (e.g., "2023-24")
4. Drag & drop PDF tax returns or click to select
5. Click "Upload & Process"

The system will:
- Extract text from PDFs using OCR if needed
- Use AI to identify and extract income data
- Validate the extracted information
- Store results in the local database

### Step 3: Review & Validate Data
- AI extraction confidence is shown for each upload
- Review extracted data for accuracy
- Edit any incorrect values in the validation interface
- The system performs automatic validation checks

### Step 4: Analyze Income
- View the consolidated dashboard for overall income analysis
- See breakdowns by income source and entity type
- Review tax calculations and franking credits
- Use charts and visualizations for planning

## Features in Detail

### AI Data Extraction
The system intelligently extracts:
- Employment income (salary, wages)
- Business income
- Investment income (dividends, interest, capital gains)
- Rental income
- Trust distributions
- Tax payable and franking credits

### Dashboard Analytics
- Total income across all entities
- Income breakdown by source type
- Income distribution by entity type
- Tax payable vs franking credits analysis
- Visual charts (pie charts, bar charts)

### Data Validation
Automatic validation checks:
- Income totals consistency
- Investment income breakdown accuracy
- Tax calculation verification
- Franking credits reasonableness
- Negative value detection

### Entity Types
- **Individual**: Personal tax returns
- **Group**: Business or partnership entities
- **Trust**: Trust distribution tax returns

## File Structure
```
tax-analyzer/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── types/          # TypeScript definitions
│   │   └── main.tsx        # App entry point
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Server entry point
│   ├── uploads/            # PDF file storage
│   └── package.json
├── tax_analyzer.db         # SQLite database (created automatically)
└── README.md
```

## API Endpoints

### Entities
- `GET /api/entities` - Get all entities
- `POST /api/entities` - Create new entity
- `PUT /api/entities/:id` - Update entity
- `DELETE /api/entities/:id` - Delete entity

### Tax Returns
- `POST /api/tax-returns/upload` - Upload and process PDF
- `GET /api/tax-returns/:id` - Get tax return details
- `PUT /api/tax-returns/:id/income` - Update income data

### Analytics
- `GET /api/consolidated-summary` - Get consolidated summary
- `GET /api/entities/:id/summary` - Get entity-specific summary

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## Database

The system uses SQLite for local data storage with these tables:
- `entities` - Entity information
- `tax_returns` - Uploaded tax return metadata
- `income_data` - Extracted income information

Database file: `tax_analyzer.db` (created automatically)

## Security & Privacy

- All data stored locally on your computer
- No external data transmission (except OpenAI API calls if configured)
- PDF files stored in local `uploads/` directory
- SQLite database contains all extracted data

## Troubleshooting

### PDF Processing Issues
- Ensure PDFs are readable (not password protected)
- System automatically tries OCR if direct text extraction fails
- Check file size limits (10MB max per file)

### AI Extraction Issues
- System provides mock data if OpenAI API key is not configured
- Low confidence extractions can be manually corrected
- Validation rules help identify extraction errors

### Performance
- Large PDF files may take longer to process
- OCR processing is CPU intensive
- Database operations are optimized for local use

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend server is running on port 5000
3. Ensure PDF files are valid and readable
4. Check OpenAI API key configuration if using AI features

## License

This is a personal tax planning tool for internal use. All data remains on your local computer.