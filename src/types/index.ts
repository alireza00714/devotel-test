export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'group';
  required?: boolean;
  options?: string[];
  fields?: FormField[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  visibility?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals';
    value: string;
  };
  dynamicOptions?: {
    dependsOn: string;
    endpoint: string;
    method: string;
  };
}

export interface FormStructure {
  formId: string;
  title: string;
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ApplicationData {
  [key: string]: any;
}

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}