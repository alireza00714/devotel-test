import React, { useState } from 'react';
import { FormStructure } from './types';
import { DynamicForm } from './components/DynamicForm';
import { ApplicationsList } from './components/ApplicationsList';
import { FormSelector } from './components/FormSelector';
import { useForms, useSubmitForm } from './hooks/useApi';
import { FileText, List, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

type ViewType = 'home' | 'forms' | 'applications';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedForm, setSelectedForm] = useState<FormStructure | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // React Query hooks
  const { data: forms = [], isLoading, error } = useForms();
  const submitFormMutation = useSubmitForm();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      await submitFormMutation.mutateAsync({
        formId: selectedForm!.formId,
        data
      });
      showNotification('success', 'Application submitted successfully!');
      setCurrentView('applications');
      setSelectedForm(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('error', 'Failed to submit application. Please try again.');
    }
  };

  const handleFormSelect = (form: FormStructure) => {
    setSelectedForm(form);
    setCurrentView('forms');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedForm(null);
  };

  // Handle API errors
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Connection Error</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">Smart Insurance Portal</h1>
              </div>
              
              {currentView !== 'home' && (
                <button
                  onClick={handleBackToHome}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                New Application
              </button>
              <button
                onClick={() => setCurrentView('applications')}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  currentView === 'applications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
                <span>My Applications</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <FormSelector forms={forms} onSelectForm={handleFormSelect} />
            )}

            {currentView === 'forms' && selectedForm && (
              <DynamicForm 
                form={selectedForm} 
                onSubmit={handleFormSubmit}
                isSubmitting={submitFormMutation.isPending}
              />
            )}

            {currentView === 'applications' && <ApplicationsList />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Smart Insurance Portal. All rights reserved.</p>
            <p className="text-sm mt-2">Secure, efficient, and user-friendly insurance applications.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;