import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { FormStructure } from '../types';

// Query keys for consistent cache management
export const queryKeys = {
  forms: ['forms'] as const,
  form: (id: string) => ['forms', id] as const,
  submissions: ['submissions'] as const,
  states: (country: string) => ['states', country] as const,
};

// Hook for fetching all insurance forms
export const useForms = () => {
  return useQuery({
    queryKey: queryKeys.forms,
    queryFn: apiService.getForms,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for fetching a specific form by ID
export const useForm = (formId: string) => {
  return useQuery({
    queryKey: queryKeys.form(formId),
    queryFn: () => apiService.getFormById(formId),
    enabled: !!formId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for fetching submitted applications
export const useSubmissions = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: [...queryKeys.submissions, page, limit],
    queryFn: () => apiService.getSubmissions(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // For smooth pagination
  });
};

// Hook for fetching states based on country
export const useStates = (country: string) => {
  return useQuery({
    queryKey: queryKeys.states(country),
    queryFn: () => apiService.getStates(country),
    enabled: !!country,
    staleTime: 10 * 60 * 1000, // 10 minutes (states don't change often)
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for submitting forms
export const useSubmitForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: Record<string, any> }) =>
      apiService.submitForm(formId, data),
    onSuccess: () => {
      // Invalidate submissions cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions });
    },
    onError: (error) => {
      console.error('Form submission failed:', error);
    },
  });
};

// Hook for updating application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: 'pending' | 'approved' | 'rejected' }) =>
      apiService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions });
    },
  });
};

// Hook for deleting applications
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => apiService.deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions });
    },
  });
};