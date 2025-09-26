import React, { useEffect, useState } from 'react';
import { PlusIcon, DocumentTextIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'LGSR' | 'PPM' | 'Inspection' | 'Safety';
  asset_types: string[];
  questions: FormQuestion[];
  created_at: string;
}

interface FormQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'signature' | 'photo' | 'select';
  required: boolean;
  options?: string[];
}

interface FormSubmission {
  id: string;
  template_id: string;
  template?: FormTemplate;
  asset_id: string;
  asset?: { name: string; asset_type: string };
  submitted_by: string;
  submitter?: { name: string };
  answers: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved';
  created_at: string;
}

export default function Forms() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'submissions'>('templates');
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check if we're using dummy Supabase URL
    if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
      // Set mock data for demonstration
      const mockTemplates: FormTemplate[] = [
        {
          id: '1',
          name: 'Boiler Safety Inspection',
          description: 'Complete safety inspection checklist for boiler systems',
          category: 'Safety',
          asset_types: ['Boiler', 'Gas Boiler'],
          questions: [
            { id: '1', question: 'Is the boiler pressure within normal range?', type: 'boolean', required: true },
            { id: '2', question: 'Temperature reading', type: 'number', required: true },
            { id: '3', question: 'Visual inspection notes', type: 'text', required: false },
            { id: '4', question: 'Inspector signature', type: 'signature', required: true }
          ],
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Pump LGSR Form',
          description: 'Landlord Gas Safety Record for pump systems',
          category: 'LGSR',
          asset_types: ['Fresh Water Booster Pump', 'Circulator Pump', 'Shunt Pump'],
          questions: [
            { id: '1', question: 'Gas supply pressure', type: 'number', required: true },
            { id: '2', question: 'Appliance type', type: 'select', required: true, options: ['Boiler', 'Pump', 'Heater'] },
            { id: '3', question: 'Safety devices operational?', type: 'boolean', required: true },
            { id: '4', question: 'Additional comments', type: 'text', required: false },
            { id: '5', question: 'Site photo', type: 'photo', required: false }
          ],
          created_at: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          name: 'PPM Maintenance Check',
          description: 'Planned Preventive Maintenance inspection form',
          category: 'PPM',
          asset_types: ['Water Tank', 'Pressure Unit', 'Degasser'],
          questions: [
            { id: '1', question: 'Equipment condition', type: 'select', required: true, options: ['Good', 'Fair', 'Poor', 'Requires Repair'] },
            { id: '2', question: 'Maintenance performed', type: 'text', required: true },
            { id: '3', question: 'Next maintenance due date', type: 'text', required: true }
          ],
          created_at: '2024-01-20T09:15:00Z'
        }
      ];

      const mockSubmissions: FormSubmission[] = [
        {
          id: '1',
          template_id: '1',
          template: mockTemplates[0],
          asset_id: 'asset-1',
          asset: { name: 'Main Boiler Unit A', asset_type: 'Boiler' },
          submitted_by: 'user-1',
          submitter: { name: 'John Smith' },
          answers: { '1': true, '2': 85, '3': 'All systems functioning normally', '4': 'J.Smith' },
          status: 'submitted',
          created_at: '2024-01-25T11:30:00Z'
        },
        {
          id: '2',
          template_id: '2',
          template: mockTemplates[1],
          asset_id: 'asset-2',
          asset: { name: 'Pump System B', asset_type: 'Fresh Water Booster Pump' },
          submitted_by: 'user-2',
          submitter: { name: 'Sarah Johnson' },
          answers: { '1': 1.2, '2': 'Pump', '3': true, '4': 'No issues detected' },
          status: 'approved',
          created_at: '2024-01-24T16:45:00Z'
        },
        {
          id: '3',
          template_id: '3',
          template: mockTemplates[2],
          asset_id: 'asset-3',
          asset: { name: 'Water Tank C', asset_type: 'Water Tank' },
          submitted_by: 'user-3',
          submitter: { name: 'Mike Wilson' },
          answers: { '1': 'Good', '2': 'Cleaned filters, checked levels', '3': '2024-04-15' },
          status: 'draft',
          created_at: '2024-01-23T13:20:00Z'
        }
      ];

      setTemplates(mockTemplates);
      setSubmissions(mockSubmissions);
      setLoading(false);
      return;
    }

    try {
      const [templatesResponse, submissionsResponse] = await Promise.all([
        supabase
          .from('form_templates')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('form_submissions')
          .select(`
            *,
            template:form_templates(name, category),
            asset:assets(name, asset_type),
            submitter:team(name)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (!templatesResponse.error && templatesResponse.data) {
        setTemplates(templatesResponse.data);
      }
      
      if (!submissionsResponse.error && submissionsResponse.data) {
        setSubmissions(submissionsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LGSR':
        return 'bg-red-100 text-red-800';
      case 'PPM':
        return 'bg-blue-100 text-blue-800';
      case 'Inspection':
        return 'bg-yellow-100 text-yellow-800';
      case 'Safety':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms Management</h1>
          <p className="mt-2 text-gray-600">
            Create form templates and manage digital maintenance forms
          </p>
        </div>
        <Button onClick={() => setShowTemplateForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Form Templates
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {templates.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submissions
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {submissions.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions:</span>
                  <span className="text-gray-900">{template.questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Asset Types:</span>
                  <span className="text-gray-900">{template.asset_types.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.asset_types.slice(0, 3).map((type) => (
                  <span key={type} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {type}
                  </span>
                ))}
                {template.asset_types.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    +{template.asset_types.length - 3} more
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <Button size="sm" variant="outline">
                  Edit Template
                </Button>
                <Button size="sm">
                  Use Template
                </Button>
              </div>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No form templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first form template for maintenance tasks.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowTemplateForm(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Template
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ClipboardIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{submission.template?.name}</h3>
                    <p className="text-sm text-gray-600">{submission.asset?.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(submission.template?.category || '')}`}>
                    {submission.template?.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Asset Type:</span>
                  <span className="text-gray-900">{submission.asset?.asset_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Submitted by:</span>
                  <span className="text-gray-900">{submission.submitter?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Answers:</span>
                  <span className="text-gray-900">{Object.keys(submission.answers).length}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                {submission.status === 'submitted' && (
                  <Button size="sm">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {submissions.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No form submissions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Form submissions will appear here once engineers start completing maintenance forms.
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-50">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.status === 'submitted').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-50">
              <ClipboardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">LGSR Forms</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.template?.category === 'LGSR').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-50">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => 
                  new Date(s.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}