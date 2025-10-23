import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { TaxReturn, IncomeData } from '../types';
import { taxAPI } from '../services/api';

interface DataValidationProps {
  taxReturn: TaxReturn;
  onDataUpdated: () => void;
}

const DataValidation: React.FC<DataValidationProps> = ({
  taxReturn,
  onDataUpdated,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<IncomeData>(taxReturn.incomeData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setFormData(taxReturn.incomeData);
    validateData(taxReturn.incomeData);
  }, [taxReturn]);

  const validateData = (data: IncomeData) => {
    const newErrors: string[] = [];
    
    const calculatedTotal = 
      data.employmentIncome + 
      data.businessIncome + 
      data.investmentIncome.totalInvestment + 
      data.rentalIncome + 
      data.trustDistributions + 
      data.otherIncome;

    if (Math.abs(calculatedTotal - data.totalIncome) > 100) {
      newErrors.push(`Total income mismatch: Calculated ${formatCurrency(calculatedTotal)} vs Reported ${formatCurrency(data.totalIncome)}`);
    }

    const investmentTotal = 
      data.investmentIncome.dividends + 
      data.investmentIncome.interest + 
      data.investmentIncome.capitalGains;
    
    if (Math.abs(investmentTotal - data.investmentIncome.totalInvestment) > 10) {
      newErrors.push(`Investment income breakdown doesn't match total`);
    }

    if (data.taxPayable < 0) {
      newErrors.push('Tax payable cannot be negative');
    }

    if (data.frankingCredits > data.investmentIncome.dividends * 0.5) {
      newErrors.push('Franking credits seem unusually high compared to dividend income');
    }

    const netTax = data.taxPayable - data.frankingCredits;
    if (Math.abs(netTax - data.netTaxPayable) > 10) {
      newErrors.push(`Net tax calculation mismatch: Expected ${formatCurrency(netTax)} vs Reported ${formatCurrency(data.netTaxPayable)}`);
    }

    setErrors(newErrors);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFieldChange = (field: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    if (field.startsWith('investmentIncome.')) {
      const subField = field.split('.')[1];
      const updatedInvestment = {
        ...formData.investmentIncome,
        [subField]: numValue,
      };
      updatedInvestment.totalInvestment = 
        updatedInvestment.dividends + updatedInvestment.interest + updatedInvestment.capitalGains;
      
      const updatedData = {
        ...formData,
        investmentIncome: updatedInvestment,
      };
      
      updatedData.totalIncome = 
        updatedData.employmentIncome + 
        updatedData.businessIncome + 
        updatedInvestment.totalInvestment + 
        updatedData.rentalIncome + 
        updatedData.trustDistributions + 
        updatedData.otherIncome;
      
      updatedData.netTaxPayable = updatedData.taxPayable - updatedData.frankingCredits;
      
      setFormData(updatedData);
      validateData(updatedData);
    } else {
      const updatedData = { ...formData, [field]: numValue };
      
      if (['employmentIncome', 'businessIncome', 'rentalIncome', 'trustDistributions', 'otherIncome'].includes(field)) {
        updatedData.totalIncome = 
          updatedData.employmentIncome + 
          updatedData.businessIncome + 
          updatedData.investmentIncome.totalInvestment + 
          updatedData.rentalIncome + 
          updatedData.trustDistributions + 
          updatedData.otherIncome;
      }
      
      if (['taxPayable', 'frankingCredits'].includes(field)) {
        updatedData.netTaxPayable = updatedData.taxPayable - updatedData.frankingCredits;
      }
      
      setFormData(updatedData);
      validateData(updatedData);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await taxAPI.updateIncomeData(taxReturn.id, formData);
      setEditMode(false);
      onDataUpdated();
    } catch (error) {
      console.error('Error updating income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(taxReturn.incomeData);
    setEditMode(false);
    validateData(taxReturn.incomeData);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Data Validation - {taxReturn.fileName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`AI Confidence: ${getConfidenceText(0.8)}`}
                color={getConfidenceColor(0.8) as any}
                size="small"
              />
              {editMode ? (
                <>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || errors.length > 0}
                    variant="contained"
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="small"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <IconButton onClick={() => setEditMode(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Data Validation Issues:
              </Typography>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  • {error}
                </Typography>
              ))}
            </Alert>
          )}

          {errors.length === 0 && !editMode && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckIcon />}>
              All data validations passed successfully!
            </Alert>
          )}
        </CardContent>
      </Card>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Income Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employment Income"
                type="number"
                value={formData.employmentIncome}
                onChange={(e) => handleFieldChange('employmentIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Income"
                type="number"
                value={formData.businessIncome}
                onChange={(e) => handleFieldChange('businessIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dividend Income"
                type="number"
                value={formData.investmentIncome.dividends}
                onChange={(e) => handleFieldChange('investmentIncome.dividends', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Interest Income"
                type="number"
                value={formData.investmentIncome.interest}
                onChange={(e) => handleFieldChange('investmentIncome.interest', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Capital Gains"
                type="number"
                value={formData.investmentIncome.capitalGains}
                onChange={(e) => handleFieldChange('investmentIncome.capitalGains', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rental Income"
                type="number"
                value={formData.rentalIncome}
                onChange={(e) => handleFieldChange('rentalIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trust Distributions"
                type="number"
                value={formData.trustDistributions}
                onChange={(e) => handleFieldChange('trustDistributions', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Other Income"
                type="number"
                value={formData.otherIncome}
                onChange={(e) => handleFieldChange('otherIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Income"
                type="number"
                value={formData.totalIncome}
                onChange={(e) => handleFieldChange('totalIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Tax Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Taxable Income"
                type="number"
                value={formData.taxableIncome}
                onChange={(e) => handleFieldChange('taxableIncome', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tax Payable"
                type="number"
                value={formData.taxPayable}
                onChange={(e) => handleFieldChange('taxPayable', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Franking Credits"
                type="number"
                value={formData.frankingCredits}
                onChange={(e) => handleFieldChange('frankingCredits', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Net Tax Payable"
                type="number"
                value={formData.netTaxPayable}
                onChange={(e) => handleFieldChange('netTaxPayable', e.target.value)}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f0f8ff',
                  },
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default DataValidation;