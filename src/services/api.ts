import axios from 'axios';
import { FormStructure, FormSubmission, ApplicationData } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://assignment.devotel.io'
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SubmissionsResponse {
  columns: string[];
  data: ApplicationData[];
}

export interface SubmitFormResponse {
  success: boolean;
  id: string;
  message?: string;
}

export const apiService = {
  // Fetch all available insurance forms
  async getForms(): Promise<FormStructure[]> {
    const response = await api.get<ApiResponse<FormStructure[]>>('/api/insurance/forms');
    return response.data.data;
  },

  // Fetch states based on country for dynamic options
  async getStates(country: string): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`/api/getStates`, {
      params: { country }
    });
    return response.data.data;
  },

  // Submit a completed insurance form
  async submitForm(formId: string, data: Record<string, any>): Promise<SubmitFormResponse> {
    const response = await api.post<ApiResponse<SubmitFormResponse>>('/api/insurance/forms/submit', {
      formId,
      data,
      submittedAt: new Date().toISOString()
    });
    return response.data.data;
  },

  // Fetch all submitted applications with pagination support
  async getSubmissions(page?: number, limit?: number): Promise<SubmissionsResponse> {
    const response = await api.get<ApiResponse<SubmissionsResponse>>('/api/insurance/forms/submissions', {
      params: { page, limit }
    });
    return response.data.data;
  },

  // Fetch a specific form by ID
  async getFormById(formId: string): Promise<FormStructure> {
    const response = await api.get<ApiResponse<FormStructure>>(`/api/insurance/forms/${formId}`);
    return response.data.data;
  },

  // Update application status (for admin functionality)
  async updateApplicationStatus(applicationId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    await api.patch(`/api/insurance/forms/submissions/${applicationId}/status`, { status });
  },

  // Delete an application
  async deleteApplication(applicationId: string): Promise<void> {
    await api.delete(`/api/insurance/forms/submissions/${applicationId}`);
  }
};

export default api;