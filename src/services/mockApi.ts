import { FormStructure, FormSubmission, ApplicationData } from '../types';

// Mock form structures
const mockForms: FormStructure[] = [
  {
    "formId": "health_insurance_application",
    "title": "Health Insurance Application",
    "fields": [
      {
        "id": "personal_info",
        "label": "Personal Information",
        "type": "group",
        "fields": [
          {
            "id": "first_name",
            "label": "First Name",
            "type": "text",
            "required": true
          },
          {
            "id": "last_name",
            "label": "Last Name",
            "type": "text",
            "required": true
          },
          {
            "id": "dob",
            "label": "Date of Birth",
            "type": "date",
            "required": true
          },
          {
            "id": "gender",
            "label": "Gender",
            "type": "select",
            "options": ["Male", "Female", "Other"],
            "required": true
          }
        ]
      },
      {
        "id": "address",
        "label": "Address",
        "type": "group",
        "fields": [
          {
            "id": "country",
            "label": "Country",
            "type": "select",
            "options": ["USA", "Canada", "Germany", "France"],
            "required": true
          },
          {
            "id": "state",
            "label": "State",
            "type": "select",
            "required": true,
            "dynamicOptions": {
              "dependsOn": "country",
              "endpoint": "/api/getStates",
              "method": "GET"
            }
          },
          {
            "id": "city",
            "label": "City",
            "type": "text",
            "required": true
          }
        ]
      },
      {
        "id": "health_info",
        "label": "Health Information",
        "type": "group",
        "fields": [
          {
            "id": "smoker",
            "label": "Do you smoke?",
            "type": "radio",
            "options": ["Yes", "No"],
            "required": true
          },
          {
            "id": "smoking_frequency",
            "label": "How often do you smoke?",
            "type": "select",
            "options": ["Occasionally", "Daily", "Heavy"],
            "required": true,
            "visibility": {
              "dependsOn": "smoker",
              "condition": "equals",
              "value": "Yes"
            }
          },
          {
            "id": "pregnancy_status",
            "label": "Are you pregnant?",
            "type": "radio",
            "options": ["Yes", "No"],
            "required": true,
            "visibility": {
              "dependsOn": "gender",
              "condition": "equals",
              "value": "Female"
            }
          }
        ]
      }
    ]
  },
  {
    "formId": "home_insurance_application",
    "title": "Home Insurance Application",
    "fields": [
      {
        "id": "home_owner",
        "label": "Are you the homeowner?",
        "type": "radio",
        "options": ["Yes", "No"],
        "required": true
      },
      {
        "id": "property_type",
        "label": "Property Type",
        "type": "select",
        "options": ["House", "Apartment", "Condo"],
        "required": true
      },
      {
        "id": "home_value",
        "label": "Estimated Home Value (USD)",
        "type": "number",
        "required": true,
        "validation": {
          "min": 50000,
          "max": 5000000
        }
      },
      {
        "id": "has_security_system",
        "label": "Do you have a home security system?",
        "type": "radio",
        "options": ["Yes", "No"],
        "required": true
      },
      {
        "id": "security_system_type",
        "label": "Security System Type",
        "type": "select",
        "options": ["Monitored", "Unmonitored", "Smart Home System"],
        "required": true,
        "visibility": {
          "dependsOn": "has_security_system",
          "condition": "equals",
          "value": "Yes"
        }
      },
      {
        "id": "fire_safety",
        "label": "Fire safety measures",
        "type": "checkbox",
        "options": ["Smoke Detectors", "Fire Extinguishers", "Sprinkler System"],
        "required": true
      }
    ]
  },
  {
    "formId": "car_insurance_application",
    "title": "Car Insurance Application",
    "fields": [
      {
        "id": "car_owner",
        "label": "Are you the primary car owner?",
        "type": "radio",
        "options": ["Yes", "No"],
        "required": true
      },
      {
        "id": "vehicle_info",
        "label": "Vehicle Information",
        "type": "group",
        "fields": [
          {
            "id": "car_make",
            "label": "Car Make",
            "type": "text",
            "required": true
          },
          {
            "id": "car_model",
            "label": "Car Model",
            "type": "text",
            "required": true
          },
          {
            "id": "car_year",
            "label": "Year of Manufacture",
            "type": "number",
            "required": true,
            "validation": {
              "min": 1990,
              "max": 2025
            }
          }
        ]
      },
      {
        "id": "accidents_last_5_years",
        "label": "Have you had any accidents in the last 5 years?",
        "type": "radio",
        "options": ["Yes", "No"],
        "required": true
      },
      {
        "id": "accident_count",
        "label": "How many accidents?",
        "type": "number",
        "required": true,
        "visibility": {
          "dependsOn": "accidents_last_5_years",
          "condition": "equals",
          "value": "Yes"
        }
      }
    ]
  }
];

// Mock states data
const statesByCountry: Record<string, string[]> = {
  USA: ['California', 'New York', 'Texas', 'Florida', 'Illinois'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  Germany: ['Bavaria', 'North Rhine-Westphalia', 'Berlin', 'Hamburg'],
  France: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes']
};

// Mock submissions data
let mockSubmissions: FormSubmission[] = [
  {
    id: '1',
    formId: 'health_insurance_application',
    data: {
      first_name: 'John',
      last_name: 'Doe',
      dob: '1995-06-15',
      gender: 'Male',
      country: 'USA',
      state: 'California',
      city: 'Los Angeles',
      smoker: 'No'
    },
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    formId: 'home_insurance_application',
    data: {
      home_owner: 'Yes',
      property_type: 'House',
      home_value: 450000,
      has_security_system: 'Yes',
      security_system_type: 'Monitored'
    },
    submittedAt: '2024-01-14T14:20:00Z',
    status: 'approved'
  },
  {
    id: '3',
    formId: 'car_insurance_application',
    data: {
      car_owner: 'Yes',
      car_make: 'Toyota',
      car_model: 'Camry',
      car_year: 2020,
      accidents_last_5_years: 'No'
    },
    submittedAt: '2024-01-13T09:15:00Z',
    status: 'rejected'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  async getForms(): Promise<FormStructure[]> {
    await delay(500);
    return mockForms;
  },

  async getStates(country: string): Promise<string[]> {
    await delay(300);
    return statesByCountry[country] || [];
  },

  async submitForm(formId: string, data: Record<string, any>): Promise<{ success: boolean; id: string }> {
    await delay(800);
    const newSubmission: FormSubmission = {
      id: String(Date.now()),
      formId,
      data,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    mockSubmissions.push(newSubmission);
    return { success: true, id: newSubmission.id };
  },

  async getSubmissions(): Promise<{ columns: string[]; data: ApplicationData[] }> {
    await delay(400);
    
    const data = mockSubmissions.map(submission => {
      const form = mockForms.find(f => f.formId === submission.formId);
      const insuranceTypeMap: Record<string, string> = {
        'health_insurance_application': 'Health',
        'home_insurance_application': 'Home',
        'car_insurance_application': 'Car'
      };

      return {
        id: submission.id,
        'Full Name': `${submission.data.first_name || 'N/A'} ${submission.data.last_name || ''}`.trim() || 'N/A',
        'Insurance Type': insuranceTypeMap[submission.formId] || 'Unknown',
        'City': submission.data.city || 'N/A',
        'Status': submission.status,
        'Submitted Date': new Date(submission.submittedAt).toLocaleDateString(),
        'Property Value': submission.data.home_value ? `$${submission.data.home_value.toLocaleString()}` : 'N/A',
        'Vehicle': submission.data.car_make && submission.data.car_model ? 
          `${submission.data.car_make} ${submission.data.car_model}` : 'N/A',
        'Country': submission.data.country || 'N/A'
      };
    });

    return {
      columns: ['Full Name', 'Insurance Type', 'City', 'Status', 'Submitted Date', 'Property Value', 'Vehicle', 'Country'],
      data
    };
  }
};