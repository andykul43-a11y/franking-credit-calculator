import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.warn('OpenAI API key not found. AI extraction will use mock data.');
      this.openai = null;
    }
  }

  async extractTaxData(extractedText, entityType = 'Individual') {
    if (!this.openai) {
      return this.getMockTaxData();
    }

    try {
      const prompt = this.buildExtractionPrompt(extractedText, entityType);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert Australian tax analyst. Extract income data from tax returns with high accuracy. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      const taxData = JSON.parse(response);
      
      return {
        ...taxData,
        aiConfidence: this.calculateConfidence(extractedText, taxData),
        extractedText: extractedText
      };

    } catch (error) {
      console.error('AI extraction error:', error);
      return this.getMockTaxData();
    }
  }

  buildExtractionPrompt(text, entityType) {
    return `
Analyze this Australian tax return text and extract income information. Return a JSON object with the following structure:

{
  "employmentIncome": number,
  "businessIncome": number,
  "dividendIncome": number,
  "interestIncome": number,
  "capitalGains": number,
  "rentalIncome": number,
  "trustDistributions": number,
  "otherIncome": number,
  "totalIncome": number,
  "taxableIncome": number,
  "taxPayable": number,
  "frankingCredits": number,
  "netTaxPayable": number,
  "taxYear": "string"
}

Entity Type: ${entityType}

Tax Return Text:
${text.substring(0, 4000)}

Instructions:
1. Look for specific Australian tax form labels (e.g., "Salary and wages", "Business income", "Dividends", etc.)
2. Extract numerical values, removing commas and currency symbols
3. Calculate totals where possible
4. For missing fields, use 0
5. Ensure all numbers are valid
6. Return only the JSON object, no additional text
`;
  }

  calculateConfidence(text, extractedData) {
    let confidence = 0.5;
    
    if (text.includes('Australian Taxation Office') || text.includes('ATO')) {
      confidence += 0.2;
    }
    
    if (text.includes('Tax file number') || text.includes('TFN')) {
      confidence += 0.1;
    }
    
    const incomeFields = Object.values(extractedData).filter(val => 
      typeof val === 'number' && val > 0
    );
    
    if (incomeFields.length > 3) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  getMockTaxData() {
    return {
      employmentIncome: 75000,
      businessIncome: 0,
      dividendIncome: 2500,
      interestIncome: 800,
      capitalGains: 1200,
      rentalIncome: 18000,
      trustDistributions: 0,
      otherIncome: 500,
      totalIncome: 97000,
      taxableIncome: 89500,
      taxPayable: 18975,
      frankingCredits: 750,
      netTaxPayable: 18225,
      taxYear: "2023-24",
      aiConfidence: 0.8,
      extractedText: "Mock data - Please configure OpenAI API key for real extraction"
    };
  }
}

export { AIService };