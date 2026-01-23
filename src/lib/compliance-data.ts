
import type { ComplianceFields } from "./types";

export type ComplianceRequirement = {
  id: keyof ComplianceFields;
  label: string;
  description?: string;
  type: 'checkbox' | 'text';
  required: boolean;
  condition?: keyof ComplianceFields;
};

export type StateCompliance = {
  name: string;
  requirements: ComplianceRequirement[];
};

export const complianceRequirementsByState: Record<string, StateCompliance> = {
  // Australia
  'NSW': {
    name: 'New South Wales',
    requirements: [
      { id: 'foodBusinessRegistered', label: 'My food business is registered with my local council.', type: 'checkbox', required: true },
      { id: 'councilName', label: 'Council Name', type: 'text', required: true, condition: 'foodBusinessRegistered' },
      { id: 'foodSafetySupervisor', label: 'I have a nominated Food Safety Supervisor (for businesses handling high-risk foods).', type: 'checkbox', required: false },
    ],
  },
  'VIC': {
    name: 'Victoria',
    requirements: [
       { id: 'foodActClassification', label: 'I understand my classification under the Food Act 1984.', type: 'checkbox', required: true },
       { id: 'foodTraderRegistered', label: 'I am registered or have a notification with FoodTrader.', type: 'checkbox', required: true },
    ],
  },
   'QLD': {
    name: 'Queensland',
    requirements: [
       { id: 'foodBusinessLicense', label: 'I hold a food business licence from my local council.', type: 'checkbox', required: true },
       { id: 'foodSafetySupervisor', label: 'I have a nominated Food Safety Supervisor.', type: 'checkbox', required: false },
    ],
  },
  'SA': {
    name: 'South Australia',
    requirements: [
      { id: 'foodBusinessNotification', label: 'I have notified my local council of my food business.', type: 'checkbox', required: true },
    ],
  },
  'WA': {
    name: 'Western Australia',
    requirements: [
      { id: 'foodBusinessRegistered', label: 'My food business is registered with my local council.', type: 'checkbox', required: true },
    ],
  },
  'TAS': {
    name: 'Tasmania',
    requirements: [
      { id: 'foodBusinessRegistered', label: 'My food business is registered with my local council.', type: 'checkbox', required: true },
    ],
  },
  'ACT': {
    name: 'Australian Capital Territory',
    requirements: [
      { id: 'foodBusinessRegistered', label: 'I have registered my food business.', type: 'checkbox', required: true },
    ],
  },
  'NT': {
    name: 'Northern Territory',
    requirements: [
      { id: 'foodBusinessRegistered', label: 'I have registered my food business.', type: 'checkbox', required: true },
    ],
  },
};

export const countryComplianceRequirements: Record<string, StateCompliance> = {
    'NZ': {
        name: 'New Zealand',
        requirements: [
             { id: 'foodBusinessRegistered', label: 'I am registered under a National Programme or have a Food Control Plan.', type: 'checkbox', required: true, description: 'Most home-based businesses fall under a National Programme.' },
             { id: 'councilName', label: 'Territorial Authority (Council) Name', type: 'text', required: true, condition: 'foodBusinessRegistered' },
        ]
    }
}
