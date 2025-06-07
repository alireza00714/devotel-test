import React from 'react';
import { FormStructure } from '../types';
import { FileText, Home, Car, Heart } from 'lucide-react';

interface FormSelectorProps {
  forms: FormStructure[];
  onSelectForm: (form: FormStructure) => void;
}

const formIcons = {
  health_insurance_application: Heart,
  home_insurance_application: Home,
  car_insurance_application: Car,
};

export const FormSelector: React.FC<FormSelectorProps> = ({ forms, onSelectForm }) => {
  const getFormIcon = (formId: string) => {
    const Icon = formIcons[formId as keyof typeof formIcons] || FileText;
    return Icon;
  };

  const getFormDescription = (formId: string) => {
    const descriptions = {
      health_insurance_application: 'Comprehensive health coverage application with medical history and personal information.',
      home_insurance_application: 'Property protection application including home value, security systems, and safety measures.',
      car_insurance_application: 'Vehicle insurance application covering driving history, vehicle details, and coverage options.',
    };
    return descriptions[formId as keyof typeof descriptions] || 'Insurance application form.';
  };

  const getFormColor = (formId: string) => {
    const colors = {
      health_insurance_application: 'from-emerald-500 to-teal-600',
      home_insurance_application: 'from-blue-500 to-indigo-600',
      car_insurance_application: 'from-purple-500 to-pink-600',
    };
    return colors[formId as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Insurance Application</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the type of insurance you'd like to apply for. Each form is tailored to gather the specific information needed for your coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map((form) => {
          const Icon = getFormIcon(form.formId);
          const colorClass = getFormColor(form.formId);

          return (
            <div
              key={form.formId}
              onClick={() => onSelectForm(form)}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className={`h-32 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                  <Icon className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {form.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {getFormDescription(form.formId)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {form.fields.length} sections
                    </span>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      Start Application
                      <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};