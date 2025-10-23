import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';
import { PDFService } from '../services/pdfService.js';
import { AIService } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const pdfService = new PDFService();
const aiService = new AIService();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { entityId, taxYear } = req.body;
    
    if (!entityId || !taxYear) {
      return res.status(400).json({ error: 'Entity ID and tax year are required' });
    }

    const db = DatabaseService.instance;
    
    const entity = await db.get('SELECT * FROM entities WHERE id = ?', [entityId]);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const taxReturnId = uuidv4();
    const filePath = req.file.path;

    await db.run(
      `INSERT INTO tax_returns (id, entity_id, file_name, file_path, tax_year) 
       VALUES (?, ?, ?, ?, ?)`,
      [taxReturnId, entityId, req.file.originalname, filePath, taxYear]
    );

    console.log(`Processing PDF: ${req.file.originalname}`);
    const extractionResult = await pdfService.extractTextFromPDF(filePath);
    
    const validation = pdfService.validateTaxDocument(extractionResult.text);
    if (!validation.isValid) {
      console.warn(`Low confidence tax document: ${validation.confidence}`);
    }

    console.log('Extracting tax data with AI...');
    const taxData = await aiService.extractTaxData(extractionResult.text, entity.type);

    const incomeDataId = uuidv4();
    await db.run(
      `INSERT INTO income_data (
        id, tax_return_id, employment_income, business_income, dividend_income, 
        interest_income, capital_gains, rental_income, trust_distributions, 
        other_income, total_income, taxable_income, tax_payable, franking_credits, 
        net_tax_payable, extracted_text, ai_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incomeDataId, taxReturnId, taxData.employmentIncome || 0, 
        taxData.businessIncome || 0, taxData.dividendIncome || 0,
        taxData.interestIncome || 0, taxData.capitalGains || 0, 
        taxData.rentalIncome || 0, taxData.trustDistributions || 0,
        taxData.otherIncome || 0, taxData.totalIncome || 0, 
        taxData.taxableIncome || 0, taxData.taxPayable || 0, 
        taxData.frankingCredits || 0, taxData.netTaxPayable || 0,
        extractionResult.text, taxData.aiConfidence || 0
      ]
    );

    await db.run(
      'UPDATE tax_returns SET processed = TRUE WHERE id = ?',
      [taxReturnId]
    );

    const result = {
      id: taxReturnId,
      entityId,
      fileName: req.file.originalname,
      taxYear,
      uploadDate: new Date(),
      processed: true,
      incomeData: {
        employmentIncome: taxData.employmentIncome || 0,
        businessIncome: taxData.businessIncome || 0,
        investmentIncome: {
          dividends: taxData.dividendIncome || 0,
          interest: taxData.interestIncome || 0,
          capitalGains: taxData.capitalGains || 0,
          totalInvestment: (taxData.dividendIncome || 0) + (taxData.interestIncome || 0) + (taxData.capitalGains || 0)
        },
        rentalIncome: taxData.rentalIncome || 0,
        trustDistributions: taxData.trustDistributions || 0,
        otherIncome: taxData.otherIncome || 0,
        totalIncome: taxData.totalIncome || 0,
        taxableIncome: taxData.taxableIncome || 0,
        taxPayable: taxData.taxPayable || 0,
        frankingCredits: taxData.frankingCredits || 0,
        netTaxPayable: taxData.netTaxPayable || 0
      },
      aiConfidence: taxData.aiConfidence || 0,
      extractionMethod: extractionResult.method
    };

    res.status(201).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process tax return' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = DatabaseService.instance;

    const taxReturn = await db.get(`
      SELECT tr.*, id.* FROM tax_returns tr
      LEFT JOIN income_data id ON tr.id = id.tax_return_id
      WHERE tr.id = ?
    `, [id]);

    if (!taxReturn) {
      return res.status(404).json({ error: 'Tax return not found' });
    }

    const result = {
      id: taxReturn.id,
      entityId: taxReturn.entity_id,
      fileName: taxReturn.file_name,
      taxYear: taxReturn.tax_year,
      uploadDate: taxReturn.upload_date,
      processed: taxReturn.processed,
      incomeData: {
        employmentIncome: taxReturn.employment_income || 0,
        businessIncome: taxReturn.business_income || 0,
        investmentIncome: {
          dividends: taxReturn.dividend_income || 0,
          interest: taxReturn.interest_income || 0,
          capitalGains: taxReturn.capital_gains || 0,
          totalInvestment: (taxReturn.dividend_income || 0) + (taxReturn.interest_income || 0) + (taxReturn.capital_gains || 0)
        },
        rentalIncome: taxReturn.rental_income || 0,
        trustDistributions: taxReturn.trust_distributions || 0,
        otherIncome: taxReturn.other_income || 0,
        totalIncome: taxReturn.total_income || 0,
        taxableIncome: taxReturn.taxable_income || 0,
        taxPayable: taxReturn.tax_payable || 0,
        frankingCredits: taxReturn.franking_credits || 0,
        netTaxPayable: taxReturn.net_tax_payable || 0
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching tax return:', error);
    res.status(500).json({ error: 'Failed to fetch tax return' });
  }
});

router.put('/:id/income', async (req, res) => {
  try {
    const { id } = req.params;
    const incomeData = req.body;
    const db = DatabaseService.instance;

    await db.run(`
      UPDATE income_data SET
        employment_income = ?, business_income = ?, dividend_income = ?,
        interest_income = ?, capital_gains = ?, rental_income = ?,
        trust_distributions = ?, other_income = ?, total_income = ?,
        taxable_income = ?, tax_payable = ?, franking_credits = ?,
        net_tax_payable = ?
      WHERE tax_return_id = ?
    `, [
      incomeData.employmentIncome, incomeData.businessIncome, incomeData.investmentIncome?.dividends,
      incomeData.investmentIncome?.interest, incomeData.investmentIncome?.capitalGains,
      incomeData.rentalIncome, incomeData.trustDistributions, incomeData.otherIncome,
      incomeData.totalIncome, incomeData.taxableIncome, incomeData.taxPayable,
      incomeData.frankingCredits, incomeData.netTaxPayable, id
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating income data:', error);
    res.status(500).json({ error: 'Failed to update income data' });
  }
});

export default router;