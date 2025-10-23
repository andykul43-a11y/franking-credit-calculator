import express from 'express';
import { DatabaseService } from '../services/database.js';

const router = express.Router();

router.get('/consolidated-summary', async (req, res) => {
  try {
    const db = DatabaseService.instance;

    const totalEntities = await db.get('SELECT COUNT(*) as count FROM entities');
    
    const incomeAggregates = await db.get(`
      SELECT 
        SUM(employment_income) as total_employment,
        SUM(business_income) as total_business,
        SUM(dividend_income + interest_income + capital_gains) as total_investment,
        SUM(rental_income) as total_rental,
        SUM(trust_distributions) as total_trust,
        SUM(other_income) as total_other,
        SUM(total_income) as total_income,
        SUM(tax_payable) as total_tax_payable,
        SUM(franking_credits) as total_franking_credits,
        SUM(net_tax_payable) as total_net_tax_payable
      FROM income_data
    `);

    const incomeByEntity = await db.all(`
      SELECT 
        e.type,
        SUM(id.total_income) as total_income
      FROM entities e
      LEFT JOIN tax_returns tr ON e.id = tr.entity_id
      LEFT JOIN income_data id ON tr.id = id.tax_return_id
      WHERE id.total_income IS NOT NULL
      GROUP BY e.type
    `);

    const entityIncome = {
      individual: 0,
      group: 0,
      trust: 0
    };

    incomeByEntity.forEach(row => {
      if (row.type === 'Individual') entityIncome.individual = row.total_income || 0;
      if (row.type === 'Group') entityIncome.group = row.total_income || 0;
      if (row.type === 'Trust') entityIncome.trust = row.total_income || 0;
    });

    const summary = {
      totalEntities: totalEntities.count || 0,
      totalIncome: incomeAggregates?.total_income || 0,
      totalTaxPayable: incomeAggregates?.total_tax_payable || 0,
      totalFrankingCredits: incomeAggregates?.total_franking_credits || 0,
      netTaxPayable: incomeAggregates?.total_net_tax_payable || 0,
      incomeByType: {
        employment: incomeAggregates?.total_employment || 0,
        business: incomeAggregates?.total_business || 0,
        investment: incomeAggregates?.total_investment || 0,
        rental: incomeAggregates?.total_rental || 0,
        trust: incomeAggregates?.total_trust || 0,
        other: incomeAggregates?.total_other || 0
      },
      incomeByEntity: entityIncome
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating consolidated summary:', error);
    res.status(500).json({ error: 'Failed to generate consolidated summary' });
  }
});

router.get('/entities/:entityId/summary', async (req, res) => {
  try {
    const { entityId } = req.params;
    const db = DatabaseService.instance;

    const entity = await db.get('SELECT * FROM entities WHERE id = ?', [entityId]);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const summary = await db.get(`
      SELECT 
        COUNT(tr.id) as total_returns,
        SUM(id.employment_income) as total_employment,
        SUM(id.business_income) as total_business,
        SUM(id.dividend_income + id.interest_income + id.capital_gains) as total_investment,
        SUM(id.rental_income) as total_rental,
        SUM(id.trust_distributions) as total_trust,
        SUM(id.other_income) as total_other,
        SUM(id.total_income) as total_income,
        SUM(id.tax_payable) as total_tax_payable,
        SUM(id.franking_credits) as total_franking_credits,
        SUM(id.net_tax_payable) as total_net_tax_payable,
        AVG(id.ai_confidence) as avg_confidence
      FROM tax_returns tr
      LEFT JOIN income_data id ON tr.id = id.tax_return_id
      WHERE tr.entity_id = ?
    `, [entityId]);

    const result = {
      entity: {
        id: entity.id,
        name: entity.name,
        type: entity.type
      },
      totalReturns: summary?.total_returns || 0,
      totalIncome: summary?.total_income || 0,
      totalTaxPayable: summary?.total_tax_payable || 0,
      totalFrankingCredits: summary?.total_franking_credits || 0,
      netTaxPayable: summary?.total_net_tax_payable || 0,
      averageConfidence: summary?.avg_confidence || 0,
      incomeBreakdown: {
        employment: summary?.total_employment || 0,
        business: summary?.total_business || 0,
        investment: summary?.total_investment || 0,
        rental: summary?.total_rental || 0,
        trust: summary?.total_trust || 0,
        other: summary?.total_other || 0
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error generating entity summary:', error);
    res.status(500).json({ error: 'Failed to generate entity summary' });
  }
});

export default router;