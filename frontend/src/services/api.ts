import axios from 'axios';
import { TaxEntity, TaxReturn, ConsolidatedSummary } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taxAPI = {
  uploadTaxReturn: async (file: File, entityId: string, taxYear: string): Promise<TaxReturn> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('taxYear', taxYear);
    
    const response = await api.post('/upload-tax-return', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEntities: async (): Promise<TaxEntity[]> => {
    const response = await api.get('/entities');
    return response.data;
  },

  createEntity: async (entity: Omit<TaxEntity, 'id' | 'taxReturns'>): Promise<TaxEntity> => {
    const response = await api.post('/entities', entity);
    return response.data;
  },

  updateEntity: async (id: string, entity: Partial<TaxEntity>): Promise<TaxEntity> => {
    const response = await api.put(`/entities/${id}`, entity);
    return response.data;
  },

  deleteEntity: async (id: string): Promise<void> => {
    await api.delete(`/entities/${id}`);
  },

  getTaxReturn: async (id: string): Promise<TaxReturn> => {
    const response = await api.get(`/tax-returns/${id}`);
    return response.data;
  },

  updateIncomeData: async (returnId: string, incomeData: any): Promise<TaxReturn> => {
    const response = await api.put(`/tax-returns/${returnId}/income`, incomeData);
    return response.data;
  },

  getConsolidatedSummary: async (): Promise<ConsolidatedSummary> => {
    const response = await api.get('/consolidated-summary');
    return response.data;
  },

  processAIExtraction: async (returnId: string): Promise<TaxReturn> => {
    const response = await api.post(`/tax-returns/${returnId}/process-ai`);
    return response.data;
  },
};

export default api;