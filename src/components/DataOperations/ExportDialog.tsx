import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  PhotoIcon,
  CalendarDaysIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  category: string;
  itemCount: number;
}

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  columns?: string[];
  filters?: Record<string, any>;
  title?: string;
  includeImages?: boolean;
  dateRange?: { from: string; to: string };
}

const availableColumns: Record<string, Array<{ key: string; label: string }>> = {
  assets: [
    { key: 'id', label: 'Asset ID' },
    { key: 'name', label: 'Asset Name' },
    { key: 'type', label: 'Asset Type' },
    { key: 'location', label: 'Location' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'model', label: 'Model' },
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'status', label: 'Status' },
    { key: 'install_date', label: 'Install Date' },
    { key: 'last_service', label: 'Last Service' },
    { key: 'next_service', label: 'Next Service' }
  ],
  tasks: [
    { key: 'id', label: 'Task ID' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'assigned_to', label: 'Assigned To' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'created_at', label: 'Created' },
    { key: 'completed_at', label: 'Completed' }
  ],
  team: [
    { key: 'id', label: 'Employee ID' },
    { key: 'name', label: 'Full Name' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'hire_date', label: 'Hire Date' },
    { key: 'status', label: 'Status' },
    { key: 'skills', label: 'Skills & Certifications' }
  ],
  properties: [
    { key: 'id', label: 'Property ID' },
    { key: 'name', label: 'Property Name' },
    { key: 'location', label: 'Location' },
    { key: 'facility_type', label: 'Facility Type' },
    { key: 'classification', label: 'Classification' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created Date' }
  ]
};

export default function ExportDialog({
  isOpen,
  onClose,
  onExport,
  category,
  itemCount
}: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    columns: availableColumns[category]?.map(col => col.key) || [],
    includeImages: false,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Export Report`
  });

  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(availableColumns[category]?.map(col => col.key) || [])
  );

  if (!isOpen) return null;

  const handleColumnToggle = (columnKey: string) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (newSelectedColumns.has(columnKey)) {
      newSelectedColumns.delete(columnKey);
    } else {
      newSelectedColumns.add(columnKey);
    }
    setSelectedColumns(newSelectedColumns);
    setExportOptions(prev => ({
      ...prev,
      columns: Array.from(newSelectedColumns)
    }));
  };

  const handleSelectAllColumns = () => {
    const allColumns = availableColumns[category]?.map(col => col.key) || [];
    if (selectedColumns.size === allColumns.length) {
      setSelectedColumns(new Set());
      setExportOptions(prev => ({ ...prev, columns: [] }));
    } else {
      setSelectedColumns(new Set(allColumns));
      setExportOptions(prev => ({ ...prev, columns: allColumns }));
    }
  };

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  const categoryColumns = availableColumns[category] || [];
  const allSelected = selectedColumns.size === categoryColumns.length;
  const someSelected = selectedColumns.size > 0 && selectedColumns.size < categoryColumns.length;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-medium text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-600">
              Configure export settings for {itemCount} {category} records
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Export Format</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { 
                  format: 'excel', 
                  label: 'Excel', 
                  description: 'Spreadsheet with formatting',
                  icon: TableCellsIcon,
                  color: 'text-green-600',
                  bgColor: 'bg-green-50'
                },
                { 
                  format: 'csv', 
                  label: 'CSV', 
                  description: 'Comma-separated values',
                  icon: DocumentTextIcon,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50'
                },
                { 
                  format: 'pdf', 
                  label: 'PDF', 
                  description: 'Formatted report',
                  icon: DocumentArrowDownIcon,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50'
                }
              ].map(({ format, label, description, icon: Icon, color, bgColor }) => (
                <button
                  key={format}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format as any }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    exportOptions.format === format
                      ? `${bgColor} border-current ${color}`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs">{description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Report Settings */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Report Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={exportOptions.title}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {exportOptions.format === 'pdf' && (
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeImages}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeImages: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Include images in PDF
                  </label>
                </div>
              )}
            </div>
          </Card>

          {/* Column Selection */}
          {exportOptions.format !== 'pdf' && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Select Columns</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={handleSelectAllColumns}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {categoryColumns.map(column => (
                  <label key={column.key} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{column.label}</span>
                  </label>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                {selectedColumns.size} of {categoryColumns.length} columns selected
              </p>
            </Card>
          )}

          {/* Date Range Filter */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Date Range (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={exportOptions.dateRange?.from || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      from: e.target.value,
                      to: prev.dateRange?.to || ''
                    }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={exportOptions.dateRange?.to || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: {
                      from: prev.dateRange?.from || '',
                      to: e.target.value
                    }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Exporting {itemCount} {category} records in {exportOptions.format.toUpperCase()} format
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={exportOptions.format !== 'pdf' && selectedColumns.size === 0}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}