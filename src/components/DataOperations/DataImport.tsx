import React, { useState, useRef } from 'react';
import { 
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useDataOperations } from '../../contexts/DataOperationsContext';

interface DataImportProps {
  category: string;
  onImportComplete?: (result: any) => void;
  className?: string;
}

interface ColumnMapping {
  csvColumn: string;
  systemField: string;
  required: boolean;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}

export default function DataImport({ category, onImportComplete, className = '' }: DataImportProps) {
  const { importData } = useDataOperations();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define field mappings for different categories
  const getSystemFields = (): ColumnMapping[] => {
    switch (category) {
      case 'assets':
        return [
          { csvColumn: '', systemField: 'name', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'asset_type', required: true, dataType: 'select', options: ['Boiler', 'Pump', 'Vessel', 'Tank', 'Valve'] },
          { csvColumn: '', systemField: 'location', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'manufacturer', required: false, dataType: 'text' },
          { csvColumn: '', systemField: 'model', required: false, dataType: 'text' },
          { csvColumn: '', systemField: 'serial_number', required: false, dataType: 'text' },
          { csvColumn: '', systemField: 'install_date', required: false, dataType: 'date' },
          { csvColumn: '', systemField: 'status', required: false, dataType: 'select', options: ['Operational', 'Maintenance', 'Offline'] }
        ];
      case 'team':
        return [
          { csvColumn: '', systemField: 'name', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'email', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'position', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'department', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'phone', required: false, dataType: 'text' },
          { csvColumn: '', systemField: 'hire_date', required: false, dataType: 'date' },
          { csvColumn: '', systemField: 'status', required: false, dataType: 'select', options: ['Active', 'On Leave', 'Training'] }
        ];
      case 'tasks':
        return [
          { csvColumn: '', systemField: 'title', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'description', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'asset_id', required: false, dataType: 'text' },
          { csvColumn: '', systemField: 'task_type', required: true, dataType: 'select', options: ['Maintenance', 'Inspection', 'Repair', 'Service'] },
          { csvColumn: '', systemField: 'priority', required: false, dataType: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
          { csvColumn: '', systemField: 'due_date', required: false, dataType: 'date' },
          { csvColumn: '', systemField: 'assigned_to', required: false, dataType: 'text' }
        ];
      case 'properties':
        return [
          { csvColumn: '', systemField: 'name', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'location', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'facility_type', required: true, dataType: 'select', options: ['Fresh Water', 'Gas Heat Generating', 'Community Halls'] },
          { csvColumn: '', systemField: 'classification', required: true, dataType: 'select', options: ['Domestic', 'Non-Domestic'] },
          { csvColumn: '', systemField: 'description', required: false, dataType: 'text' }
        ];
      default:
        return [
          { csvColumn: '', systemField: 'name', required: true, dataType: 'text' },
          { csvColumn: '', systemField: 'description', required: false, dataType: 'text' }
        ];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Parse CSV headers
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split('\n')[0];
      const headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (systemField: string, csvColumn: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [systemField]: csvColumn
    }));
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setStep('preview');
    
    try {
      const result = await importData(category, selectedFile, columnMappings);
      setImportResult(result);
      setStep('result');
      
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        processed: 0,
        imported: 0,
        failed: 0,
        errors: [{ row: 0, error: 'Import failed' }],
        warnings: []
      });
      setStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setStep('upload');
    setSelectedFile(null);
    setCsvHeaders([]);
    setColumnMappings({});
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const systemFields = getSystemFields();
    const headers = systemFields.map(field => field.systemField);
    const sampleRow = systemFields.map(field => {
      switch (field.systemField) {
        case 'name': return 'Sample Name';
        case 'email': return 'user@company.com';
        case 'asset_type': return field.options?.[0] || 'Boiler';
        case 'status': return field.options?.[0] || 'Active';
        case 'install_date': return '2024-01-15';
        case 'due_date': return '2024-04-15';
        default: return 'Sample Value';
      }
    });

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}-import-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)} className={className}>
        <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
        Import Data
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-medium text-gray-900">
              Import {category.charAt(0).toUpperCase() + category.slice(1)} Data
            </h3>
            <p className="text-sm text-gray-600">Upload CSV or Excel files to bulk import data</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <nav className="flex items-center justify-center">
            {['upload', 'mapping', 'preview', 'result'].map((stepName, index) => (
              <React.Fragment key={stepName}>
                <div className={`flex items-center ${
                  stepName === step ? 'text-blue-600' : 
                  ['upload', 'mapping', 'preview'].indexOf(step) > index ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    stepName === step ? 'border-blue-600 bg-blue-50' :
                    ['upload', 'mapping', 'preview'].indexOf(step) > index ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    {['upload', 'mapping', 'preview'].indexOf(step) > index ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium capitalize">{stepName}</span>
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    ['upload', 'mapping', 'preview'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {step === 'upload' && (
            <Card className="p-6">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <ArrowUpTrayIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Data File</h4>
                <p className="text-gray-600 mb-6">
                  Select a CSV or Excel file containing your {category} data
                </p>

                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <p className="text-gray-600">
                      Drop files here or <span className="text-blue-600 underline">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Supports CSV and Excel files</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">Import Guidelines</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Use the provided template for best results</li>
                          <li>• Ensure required fields are populated</li>
                          <li>• Date format should be YYYY-MM-DD</li>
                          <li>• Remove any existing header rows except the first one</li>
                          <li>• Maximum file size: 10MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 'mapping' && (
            <Card className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Map Columns</h4>
              <p className="text-gray-600 mb-6">
                Map the columns from your CSV file to the system fields
              </p>

              <div className="space-y-4">
                {getSystemFields().map(field => (
                  <div key={field.systemField} className="flex items-center space-x-4">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.systemField.replace('_', ' ').toUpperCase()}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <p className="text-xs text-gray-500">{field.dataType}</p>
                    </div>
                    <div className="flex-1">
                      <select
                        value={columnMappings[field.systemField] || ''}
                        onChange={(e) => handleMappingChange(field.systemField, e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select CSV column...</option>
                        {csvHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back to Upload
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={!getSystemFields().filter(f => f.required).every(f => columnMappings[f.systemField])}
                >
                  Import Data
                </Button>
              </div>
            </Card>
          )}

          {step === 'preview' && (
            <Card className="p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Processing Import</h4>
                <p className="text-gray-600">
                  Validating and importing your data...
                </p>
              </div>
            </Card>
          )}

          {step === 'result' && importResult && (
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  importResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {importResult.success ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Import {importResult.success ? 'Completed' : 'Failed'}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.processed}</div>
                  <div className="text-sm text-blue-600">Processed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                  <div className="text-sm text-green-600">Imported</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.warnings.length}</div>
                  <div className="text-sm text-yellow-600">Warnings</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <Card className="p-4 bg-red-50 border-red-200 mb-4">
                  <h5 className="font-medium text-red-900 mb-2">Errors ({importResult.errors.length})</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <Card className="p-4 bg-yellow-50 border-yellow-200 mb-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Warnings ({importResult.warnings.length})</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        Row {warning.row}: {warning.warning}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetImport}>
                  Import Another File
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Done
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}