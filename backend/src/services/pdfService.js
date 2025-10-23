import pdf from 'pdf-parse/lib/pdf-parse.js';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

class PDFService {
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      
      let extractedText = data.text;
      
      if (!extractedText || extractedText.trim().length < 100) {
        console.log('PDF text extraction yielded minimal text, attempting OCR...');
        extractedText = await this.performOCR(filePath);
      }
      
      return {
        text: extractedText,
        pages: data.numpages,
        method: extractedText.includes('OCR') ? 'ocr' : 'direct'
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      try {
        const ocrText = await this.performOCR(filePath);
        return {
          text: ocrText,
          pages: 1,
          method: 'ocr-fallback'
        };
      } catch (ocrError) {
        console.error('OCR fallback failed:', ocrError);
        throw new Error('Failed to extract text from PDF');
      }
    }
  }

  async performOCR(filePath) {
    try {
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      return result.data.text + ' [Extracted via OCR]';
    } catch (error) {
      console.error('OCR error:', error);
      return 'OCR extraction failed. Please ensure the PDF is readable and try again.';
    }
  }

  validateTaxDocument(text) {
    const taxKeywords = [
      'tax',
      'ato',
      'australian taxation office',
      'income',
      'tfn',
      'tax file number',
      'taxable income',
      'tax payable'
    ];
    
    const lowerText = text.toLowerCase();
    const foundKeywords = taxKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    return {
      isValid: foundKeywords.length >= 2,
      confidence: foundKeywords.length / taxKeywords.length,
      foundKeywords: foundKeywords
    };
  }
}

export { PDFService };