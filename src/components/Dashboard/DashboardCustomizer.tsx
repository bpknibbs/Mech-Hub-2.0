import React, { useState } from 'react';
import { CogIcon, XMarkIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useDashboard, Widget } from '../../contexts/DashboardContext';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableWidgetTypes = [
  { 
    type: 'kpi', 
    title: 'KPI Widget', 
    description: 'Key performance indicators with trends',
    sizes: ['small']
  },
  { 
    type: 'chart', 
    title: 'Chart Widget', 
    description: 'Interactive charts and graphs',
    sizes: ['medium', 'large']
  },
  { 
    type: 'alerts', 
    title: 'Alerts Widget', 
    description: 'Critical system alerts and notifications',
    sizes: ['medium', 'large']
  },
  { 
    type: 'recent-activity', 
    title: 'Recent Activity', 
    description: 'Latest system activities and updates',
    sizes: ['medium']
  },
  { 
    type: 'team-status', 
    title: 'Team Status', 
    description: 'Current team availability and assignments',
    sizes: ['medium', 'large']
  },
  { 
    type: 'asset-health', 
    title: 'Asset Health', 
    description: 'Overall asset condition monitoring',
    sizes: ['medium', 'large']
  }
];

export default function DashboardCustomizer({ isOpen, onClose }: DashboardCustomizerProps) {
  const { widgets, toggleWidget, addWidget, removeWidget } = useDashboard();
  const [selectedWidgetType, setSelectedWidgetType] = useState('');
  const [selectedSize, setSelectedSize] = useState<Widget['size']>('medium');

  if (!isOpen) return null;

  const handleAddWidget = () => {
    if (!selectedWidgetType) return;
    
    const widgetType = availableWidgetTypes.find(w => w.type === selectedWidgetType);
    if (!widgetType) return;

    const newWidget: Omit<Widget, 'id'> = {
      type: selectedWidgetType as Widget['type'],
      title: widgetType.title,
      size: selectedSize,
      position: { x: 0, y: widgets.length },
      enabled: true
    };

    addWidget(newWidget);
    setSelectedWidgetType('');
    setSelectedSize('medium');
  };

  const getWidgetTypeInfo = (type: string) => {
    return availableWidgetTypes.find(w => w.type === type);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CogIcon className="h-6 w-6 text-teal-600" />
            <h3 className="text-lg font-medium text-teal-800">Customize Dashboard</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Widgets */}
          <div>
            <h4 className="text-md font-medium text-teal-800 mb-4">Current Widgets</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {widgets.map((widget) => {
                const widgetInfo = getWidgetTypeInfo(widget.type);
                return (
                  <Card key={widget.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleWidget(widget.id)}
                            className={`p-1 rounded ${
                              widget.enabled
                                ? 'text-teal-600 hover:text-teal-800'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {widget.enabled ? (
                              <EyeIcon className="h-5 w-5" />
                            ) : (
                              <EyeSlashIcon className="h-5 w-5" />
                            )}
                          </button>
                          <div>
                            <p className={`font-medium ${
                              widget.enabled ? 'text-teal-800' : 'text-gray-500'
                            }`}>
                              {widget.title}
                            </p>
                            {widgetInfo && (
                              <p className="text-sm text-teal-600">
                                {widgetInfo.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                widget.size === 'small' ? 'bg-blue-100 text-blue-800' :
                                widget.size === 'medium' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {widget.size}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                widget.enabled ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {widget.enabled ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        disabled={widgets.length <= 1}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Add New Widget */}
          <div>
            <h4 className="text-md font-medium text-teal-800 mb-4">Add New Widget</h4>
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Widget Type
                  </label>
                  <select
                    value={selectedWidgetType}
                    onChange={(e) => setSelectedWidgetType(e.target.value)}
                    className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
                  >
                    <option value="">Select widget type...</option>
                    {availableWidgetTypes.map((widget) => (
                      <option key={widget.type} value={widget.type}>
                        {widget.title}
                      </option>
                    ))}
                  </select>
                  {selectedWidgetType && (
                    <p className="text-sm text-teal-600 mt-1">
                      {availableWidgetTypes.find(w => w.type === selectedWidgetType)?.description}
                    </p>
                  )}
                </div>

                {selectedWidgetType && (
                  <div>
                    <label className="block text-sm font-medium text-teal-700 mb-2">
                      Size
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value as Widget['size'])}
                      className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
                    >
                      {availableWidgetTypes
                        .find(w => w.type === selectedWidgetType)
                        ?.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <Button
                  onClick={handleAddWidget}
                  disabled={!selectedWidgetType}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </Card>

            {/* Available Widget Types Preview */}
            <div className="mt-6">
              <h5 className="text-sm font-medium text-teal-700 mb-3">Available Widget Types</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableWidgetTypes.map((widget) => (
                  <div
                    key={widget.type}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      selectedWidgetType === widget.type
                        ? 'border-teal-300 bg-teal-50'
                        : 'border-teal-200 bg-white hover:bg-teal-50'
                    }`}
                    onClick={() => setSelectedWidgetType(widget.type)}
                  >
                    <p className="font-medium text-teal-800">{widget.title}</p>
                    <p className="text-sm text-teal-600">{widget.description}</p>
                    <div className="flex space-x-1 mt-2">
                      {widget.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-teal-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}