import React, { useState } from 'react';
import { 
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useDataOperations } from '../../contexts/DataOperationsContext';

interface BulkOperationsProps {
  category: string;
  items: any[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}

interface BulkActionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  requiresConfirmation: boolean;
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'textarea';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  }>;
}

export default function BulkOperations({ 
  category, 
  items, 
  onSelectionChange,
  className = '' 
}: BulkOperationsProps) {
  const { 
    selectedItems, 
    selectItem, 
    deselectItem, 
    selectAllItems, 
    clearSelection,
    performBulkOperation,
    exportData
  } = useDataOperations();

  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionData, setActionData] = useState<Record<string, any>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'excel' as const,
    includeImages: false,
    title: ''
  });

  const selectedIds = selectedItems[category] || [];
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  // Configure bulk actions based on category
  const getBulkActions = (): BulkActionConfig[] => {
    const baseActions: BulkActionConfig[] = [
      {
        id: 'export',
        label: 'Export Selected',
        icon: DocumentArrowDownIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        requiresConfirmation: false
      },
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: TrashIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        requiresConfirmation: true
      }
    ];

    switch (category) {
      case 'assets':
        return [
          ...baseActions,
          {
            id: 'update_status',
            label: 'Update Status',
            icon: PencilIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            requiresConfirmation: false,
            fields: [
              {
                name: 'status',
                label: 'New Status',
                type: 'select',
                options: [
                  { value: 'operational', label: 'Operational' },
                  { value: 'maintenance', label: 'Under Maintenance' },
                  { value: 'offline', label: 'Offline' },
                  { value: 'retired', label: 'Retired' }
                ],
                required: true
              },
              {
                name: 'notes',
                label: 'Update Notes',
                type: 'textarea'
              }
            ]
          },
          {
            id: 'schedule_maintenance',
            label: 'Schedule Maintenance',
            icon: ClipboardDocumentListIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            requiresConfirmation: false,
            fields: [
              {
                name: 'maintenance_type',
                label: 'Maintenance Type',
                type: 'select',
                options: [
                  { value: 'ppm', label: 'PPM Service' },
                  { value: 'inspection', label: 'Inspection' },
                  { value: 'repair', label: 'Repair' },
                  { value: 'service', label: 'Service' }
                ],
                required: true
              },
              {
                name: 'scheduled_date',
                label: 'Scheduled Date',
                type: 'date',
                required: true
              },
              {
                name: 'assigned_to',
                label: 'Assigned To',
                type: 'select',
                options: [
                  { value: 'james-wilson', label: 'James Wilson' },
                  { value: 'sarah-mitchell', label: 'Sarah Mitchell' },
                  { value: 'michael-chen', label: 'Michael Chen' }
                ]
              }
            ]
          }
        ];

      case 'tasks':
        return [
          ...baseActions,
          {
            id: 'assign_tasks',
            label: 'Assign Tasks',
            icon: UserPlusIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            requiresConfirmation: false,
            fields: [
              {
                name: 'assigned_to',
                label: 'Assign To',
                type: 'select',
                options: [
                  { value: 'james-wilson', label: 'James Wilson' },
                  { value: 'sarah-mitchell', label: 'Sarah Mitchell' },
                  { value: 'michael-chen', label: 'Michael Chen' },
                  { value: 'emma-thompson', label: 'Emma Thompson' }
                ],
                required: true
              },
              {
                name: 'due_date',
                label: 'Due Date',
                type: 'date',
                required: true
              },
              {
                name: 'priority',
                label: 'Priority',
                type: 'select',
                options: [
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]
              }
            ]
          },
          {
            id: 'update_priority',
            label: 'Update Priority',
            icon: ExclamationTriangleIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            requiresConfirmation: false,
            fields: [
              {
                name: 'priority',
                label: 'New Priority',
                type: 'select',
                options: [
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ],
                required: true
              }
            ]
          }
        ];

      case 'team':
        return [
          ...baseActions,
          {
            id: 'update_status',
            label: 'Update Availability',
            icon: PencilIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            requiresConfirmation: false,
            fields: [
              {
                name: 'status',
                label: 'New Status',
                type: 'select',
                options: [
                  { value: 'available', label: 'Available' },
                  { value: 'on-duty', label: 'On Duty' },
                  { value: 'on-leave', label: 'On Leave' },
                  { value: 'training', label: 'In Training' }
                ],
                required: true
              }
            ]
          }
        ];

      default:
        return baseActions;
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection(category);
    } else {
      selectAllItems(category, items.map(item => item.id));
    }
    
    if (onSelectionChange) {
      onSelectionChange(allSelected ? [] : items.map(item => item.id));
    }
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      selectItem(category, itemId);
    } else {
      deselectItem(category, itemId);
    }
    
    if (onSelectionChange) {
      const newSelection = checked 
        ? [...selectedIds, itemId]
        : selectedIds.filter(id => id !== itemId);
      onSelectionChange(newSelection);
    }
  };

  const handleBulkAction = (actionId: string) => {
    if (actionId === 'export') {
      setShowExportModal(true);
      return;
    }

    const action = getBulkActions().find(a => a.id === actionId);
    if (!action) return;

    if (action.requiresConfirmation) {
      if (confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.length} selected items?`)) {
        performBulkOperation(category, actionId, actionData);
      }
    } else if (action.fields && action.fields.length > 0) {
      setShowActionModal(actionId);
    } else {
      performBulkOperation(category, actionId, actionData);
    }
  };

  const handleActionSubmit = () => {
    if (showActionModal) {
      performBulkOperation(category, showActionModal, actionData);
      setShowActionModal(null);
      setActionData({});
    }
  };

  const handleExport = async () => {
    await exportData(category, selectedIds, exportOptions);
    setShowExportModal(false);
  };

  const bulkActions = getBulkActions();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Controls */}
      {items.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                </label>
              </div>
              
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedIds.length} of {items.length} selected
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2">
                {bulkActions.map(action => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction(action.id)}
                    className={`${action.color} ${action.bgColor} hover:opacity-80`}
                  >
                    <action.icon className="h-4 w-4 mr-1" />
                    {action.label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearSelection(category)}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Individual Item Selection (render this in your item lists) */}
      <div className="hidden">
        {items.map(item => (
          <div key={item.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={(e) => handleItemSelect(item.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {getBulkActions().find(a => a.id === showActionModal)?.label}
              </h3>
              <button
                onClick={() => setShowActionModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                This action will be applied to {selectedIds.length} selected items.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {getBulkActions().find(a => a.id === showActionModal)?.fields?.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={actionData[field.name] || ''}
                      onChange={(e) => setActionData(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={actionData[field.name] || ''}
                      onChange={(e) => setActionData(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={actionData[field.name] || ''}
                      onChange={(e) => setActionData(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowActionModal(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleActionSubmit} className="flex-1">
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Exporting {selectedIds.length} selected {category} records.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Format
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    format: e.target.value as any
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF Report (.pdf)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  value={exportOptions.title}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={`${category.charAt(0).toUpperCase() + category.slice(1)} Export Report`}
                />
              </div>

              <div className="flex items-center">
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
                  Include images (where applicable)
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowExportModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleExport} className="flex-1">
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for easy integration into existing components
export function useBulkSelection(category: string) {
  const { selectedItems, selectItem, deselectItem, clearSelection } = useDataOperations();
  
  const selectedIds = selectedItems[category] || [];
  
  const isSelected = (itemId: string) => selectedIds.includes(itemId);
  
  const toggleSelection = (itemId: string) => {
    if (isSelected(itemId)) {
      deselectItem(category, itemId);
    } else {
      selectItem(category, itemId);
    }
  };
  
  return {
    selectedIds,
    isSelected,
    toggleSelection,
    clearSelection: () => clearSelection(category),
    selectionCount: selectedIds.length
  };
}