import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  PieChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
} from 'recharts';
import { TaxEntity, ConsolidatedSummary } from '../types';

interface DashboardProps {
  entities: TaxEntity[];
  consolidatedSummary: ConsolidatedSummary | null;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  entities,
  consolidatedSummary,
  loading,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!consolidatedSummary) {
    return (
      <Alert severity="info">
        No data available. Please upload some tax returns to see the analysis.
      </Alert>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const incomeByTypeData = [
    { name: 'Employment', value: consolidatedSummary.incomeByType.employment, color: '#8884d8' },
    { name: 'Business', value: consolidatedSummary.incomeByType.business, color: '#82ca9d' },
    { name: 'Investment', value: consolidatedSummary.incomeByType.investment, color: '#ffc658' },
    { name: 'Rental', value: consolidatedSummary.incomeByType.rental, color: '#ff7300' },
    { name: 'Trust', value: consolidatedSummary.incomeByType.trust, color: '#00ff00' },
    { name: 'Other', value: consolidatedSummary.incomeByType.other, color: '#0088fe' },
  ].filter(item => item.value > 0);

  const incomeByEntityData = [
    { name: 'Individual', income: consolidatedSummary.incomeByEntity.individual },
    { name: 'Group', income: consolidatedSummary.incomeByEntity.group },
    { name: 'Trust', income: consolidatedSummary.incomeByEntity.trust },
  ].filter(item => item.income > 0);

  const taxSummaryData = [
    { name: 'Tax Payable', amount: consolidatedSummary.totalTaxPayable, color: '#ff4444' },
    { name: 'Franking Credits', amount: consolidatedSummary.totalFrankingCredits, color: '#44ff44' },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value < consolidatedSummary!.totalIncome * 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {formatCurrency(value)}
      </text>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tax Planning Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Entities
              </Typography>
              <Typography variant="h3" component="div">
                {consolidatedSummary.totalEntities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {formatCurrency(consolidatedSummary.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tax Payable
              </Typography>
              <Typography variant="h3" component="div" color="error">
                {formatCurrency(consolidatedSummary.totalTaxPayable)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Net Tax Payable
              </Typography>
              <Typography variant="h3" component="div" color="warning.main">
                {formatCurrency(consolidatedSummary.netTaxPayable)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                After franking credits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {incomeByTypeData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Income by Source
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={incomeByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {incomeByEntityData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Income by Entity Type
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={incomeByEntityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Income']} />
                    <Bar dataKey="income" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Income Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Employment Income
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(consolidatedSummary.incomeByType.employment)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Business Income
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(consolidatedSummary.incomeByType.business)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Investment Income
                    </Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(consolidatedSummary.incomeByType.investment)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rental Income
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(consolidatedSummary.incomeByType.rental)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trust Distributions
                    </Typography>
                    <Typography variant="h5" color="secondary.main">
                      {formatCurrency(consolidatedSummary.incomeByType.trust)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Franking Credits
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(consolidatedSummary.totalFrankingCredits)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;