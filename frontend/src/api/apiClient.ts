// File: src/api/apiClient.ts

import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast for the interceptor
import type { DashboardData, BudgetPageData, Category, Transaction, Tag, Account, AnalyticsData, User, Alert } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor (unchanged) - adds the token to every request
apiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// //! THIS IS THE FIX: A new response interceptor to handle expired tokens.
// This function will run for EVERY response from the backend.
apiClient.interceptors.response.use(
  (response) => response, // If the response is successful, just pass it through.
  (error) => {
    // If the server responds with an error
    if (error.response && error.response.status === 401) {
      // If the error is "401 Unauthorized"
      toast.error('Your session has expired. Please log in again.');
      // Remove the invalid token from storage
      sessionStorage.removeItem('accessToken');
      // Redirect the user to the login page
      window.location.href = '/login';
    }
    // For all other errors, just pass them along to the component to handle.
    return Promise.reject(error);
  }
);


// --- Authentication Functions ---
// (No changes needed in login, register, logout, etc.)
export const login = async (username: string, password: string): Promise<{ access_token: string }> => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  const response = await apiClient.post('/auth/login/password', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (response.data.access_token) {
    sessionStorage.setItem('accessToken', response.data.access_token);
  }
  return response.data;
};
export const register = (userData: any): Promise<any> => apiClient.post('/auth/register', userData).then(res => res.data);
export const logout = () => {
  sessionStorage.removeItem('accessToken');
  window.location.href = '/login'; // Redirect on manual logout too
};
export const getMyProfile = (): Promise<User> => apiClient.get<User>('/users/me').then(res => res.data);

// --- Your Existing API Functions (No changes needed below) ---

// 1. Dashboard
export const getDashboardData = (month: string): Promise<DashboardData> => {
  return apiClient.get<DashboardData>(`/dashboard?month=${month}`).then(res => res.data);
};

// 2. Budgets
export const getBudgetPlan = (month: string): Promise<BudgetPageData> => {
  return apiClient.get<BudgetPageData>(`/budgets/plan?month=${month}`).then(res => res.data);
};
export const saveBudgetPlan = (planData: { month: string; budgets: { category_id: number, limit_amount: number }[] }): Promise<any> => {
  return apiClient.post('/budgets/plan', planData).then(res => res.data);
};
export const deleteBudgetPlan = (month: string): Promise<any> => {
  return apiClient.delete(`/budgets/plan?month=${month}`).then(res => res.data);
};

// 3. Transactions
export const getTransactions = (filters: any): Promise<{ total_count: number; transactions: Transaction[] }> => {
    return apiClient.get('/transactions', { params: filters }).then(res => res.data);
};
export const createTransaction = (transactionData: Partial<Transaction>): Promise<Transaction> => {
    return apiClient.post('/transactions', transactionData).then(res => res.data);
};
export const updateTransaction = (id: number, transactionData: Partial<Transaction>): Promise<Transaction> => {
    return apiClient.put(`/transactions/${id}`, transactionData).then(res => res.data);
};
export const deleteTransaction = (id: number): Promise<void> => {
    return apiClient.delete(`/transactions/${id}`);
};

// 4. Settings
export const getCategories = (): Promise<Category[]> => apiClient.get<Category[]>('/categories').then(res => res.data);
export const createCategory = (data: { name: string; is_income: boolean; icon_name?: string | null }): Promise<Category> => apiClient.post<Category>('/categories', data).then(res => res.data);
export const updateCategory = (id: number, data: Partial<Category>): Promise<Category> => apiClient.put<Category>(`/categories/${id}`, data).then(res => res.data);
export const deleteCategory = (id: number): Promise<void> => apiClient.delete(`/categories/${id}`).then(res => res.data);
export const getTags = (): Promise<Tag[]> => apiClient.get<Tag[]>('/tags').then(res => res.data);
export const createTag = (data: { name: string }): Promise<Tag> => apiClient.post<Tag>('/tags', data).then(res => res.data);
export const updateTag = (id: number, data: { name: string }): Promise<Tag> => apiClient.put<Tag>(`/tags/${id}`, data).then(res => res.data);
export const deleteTag = (id: number): Promise<void> => apiClient.delete(`/tags/${id}`).then(res => res.data);
export const getAccounts = (): Promise<Account[]> => apiClient.get<Account[]>('/accounts').then(res => res.data);
export const createAccount = (accountData: { name: string; type: string; provider: string; }): Promise<Account> => {
    return apiClient.post<Account>('/accounts', accountData).then(res => res.data);
};
export const updateAccount = (id: number, data: Partial<Account>): Promise<Account> => apiClient.put<Account>(`/accounts/${id}`, data).then(res => res.data);
export const deleteAccount = (id: number): Promise<void> => apiClient.delete(`/accounts/${id}`).then(res => res.data);
export const deleteMyAccount = (data: { password: string }): Promise<any> => {
    return apiClient.delete('/users/me', { data }).then(res => res.data);
};

// 5. File Upload
export const uploadStatements = (files: File[]): Promise<any> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return apiClient.post('/settings/upload-statements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

// 6. Analytics
//! THIS IS THE FIX: The function now accepts the second argument and passes it as a parameter.
export const getAnalyticsData = (timePeriod: string, includeCapitalTransfers: boolean): Promise<AnalyticsData> => {
  return apiClient.get<AnalyticsData>('/analytics', { 
    params: {
      time_period: timePeriod,
      include_capital_transfers: includeCapitalTransfers
    }
  }).then(res => res.data);
  
};

// 7. Alerts (New Section)
export const getUnreadAlerts = (): Promise<Alert[]> => {
  return apiClient.get<Alert[]>('/alerts/unread').then(res => res.data);
};

export const acknowledgeAlert = (alertId: number): Promise<Alert> => {
  return apiClient.put<Alert>(`/alerts/${alertId}/acknowledge`).then(res => res.data);
};


export default apiClient;

