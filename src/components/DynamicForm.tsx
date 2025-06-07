import React, { useState, useEffect, useCallback } from 'react';
import { FormField, FormStructure } from '../types';
import { useStates } from '../hooks/useApi';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface DynamicFormProps {
  form: FormStructure;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ form, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDraft, setIsDraft] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // React Query hook for fetching states
  const { data: states = [], isLoading: statesLoading } = useStates(selectedCountry);

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = `draft_${form.formId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
        setIsDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [form.formId]);

  const saveDraft = useCallback(() => {
    const draftKey = `draft_${form.formId}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    setIsDraft(true);
  }, [form.formId, formData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, saveDraft]);

  const validateField = (field: FormField, value: any): string => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation;
      
      if (field.type === 'number') {
        const num = Number(value);
        if (min !== undefined && num < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && num > max) {
          return `${field.label} must be at most ${max}`;
        }
      }

      if (pattern && value) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return `${field.label} format is invalid`;
        }
      }
    }

    return '';
  };

  const validateForm = (fields: FormField[]): FormErrors => {
    const newErrors: FormErrors = {};

    const validateFieldsRecursively = (fieldList: FormField[]) => {
      fieldList.forEach(field => {
        if (field.type === 'group' && field.fields) {
          validateFieldsRecursively(field.fields);
        } else {
          if (isFieldVisible(field)) {
            const error = validateField(field, formData[field.id]);
            if (error) {
              newErrors[field.id] = error;
            }
          }
        }
      });
    };

    validateFieldsRecursively(fields);
    return newErrors;
  };

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.visibility) return true;
    
    const { dependsOn, condition, value } = field.visibility;
    const dependentValue = formData[dependsOn];
    
    if (condition === 'equals') {
      return dependentValue === value;
    } else if (condition === 'not_equals') {
      return dependentValue !== value;
    }
    
    return true;
  };

  const handleInputChange = (fieldId: string, value: any, field?: FormField) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    // Handle dynamic options for country selection
    if (fieldId === 'country') {
      setSelectedCountry(value);
      // Clear state field when country changes
      if (formData.state) {
        setFormData(prev => ({ ...prev, state: '' }));
      }
    }

    setIsDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm(form.fields);
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        await onSubmit(formData);
        // Clear draft after successful submission
        localStorage.removeItem(`draft_${form.formId}`);
        setIsDraft(false);
      } catch (error) {
        console.error('Submission error:', error);
      }
    }
  };

  const renderField = (field: FormField): React.ReactNode => {
    if (!isFieldVisible(field)) return null;

    const value = formData[field.id] || '';
    const error = errors[field.id];
    const fieldId = `field_${field.id}`;

    const baseInputClasses = `w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
    }`;

    const labelClasses = `block text-sm font-semibold text-gray-700 mb-2 ${field.required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}`;

    if (field.type === 'group') {
      return (
        <div key={field.id} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {field.label}
          </h3>
          <div className="pl-4 space-y-4">
            {field.fields?.map(renderField)}
          </div>
        </div>
      );
    }

    const fieldContainer = (
      <div key={field.id} className="space-y-2">
        <label htmlFor={fieldId} className={labelClasses}>
          {field.label}
        </label>
        
        {field.type === 'text' && (
          <input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value, field)}
            className={baseInputClasses}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )}

        {field.type === 'number' && (
          <input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value, field)}
            className={baseInputClasses}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )}

        {field.type === 'date' && (
          <input
            id={fieldId}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value, field)}
            className={baseInputClasses}
          />
        )}

        {field.type === 'select' && (
          <select
            id={fieldId}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value, field)}
            className={baseInputClasses}
            disabled={field.dynamicOptions && statesLoading}
          >
            <option value="">
              {field.dynamicOptions && statesLoading 
                ? 'Loading...' 
                : `Select ${field.label.toLowerCase()}`}
            </option>
            {(field.dynamicOptions ? states : field.options || []).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}

        {field.type === 'radio' && (
          <div className="space-y-3">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value, field)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-3">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(field.id, newValues, field);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );

    return fieldContainer;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">{form.title}</h2>
          {isDraft && (
            <p className="text-blue-100 text-sm mt-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Draft saved automatically
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {form.fields.map(renderField)}
          </div>

          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};