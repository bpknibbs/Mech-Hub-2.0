import React, { useState } from 'react';
import { 
  PlusIcon, 
  XMarkIcon, 
  ArrowsUpDownIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  TableCellsIcon,
  ClipboardIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { supabase } from '../../lib/supabase';

interface ReportComponent {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'image';
  title: string;
  config: Record<string, any>;
  position: number;
}

interface CustomReportBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: any) => void;
}

const availableComponents = [
  {
    type: 'kpi',
    title: 'KPI Metric',
    description: 'Key performance indicators with trends',
    icon: ChartBarIcon,
    defaultConfig: {
      metric: 'Total Assets',
      value: 247,
      trend: 'up',
      trendValue: 5.1,
      color: 'blue'
    }
  },
  {
    type: 'chart',
    title: 'Chart Widget',
    description: 'Bar, line, or pie charts',
    icon: ChartBarIcon,
    defaultConfig: {
      chartType: 'bar',
      dataSource: 'assets_by_type',
      title: 'Asset Distribution'
    }
  },
  {
    type: 'table',
    title: 'Data Table',
    description: 'Tabular data display',
    icon: TableCellsIcon,
    defaultConfig: {
      dataSource: 'recent_tasks',
      columns: ['task', 'assignee', 'status', 'due_date'],
      maxRows: 10
    }
  },
  {
    type: 'text',
    title: 'Text Block',
    description: 'Custom text content',
    icon: DocumentTextIcon,
    defaultConfig: {
      content: 'Enter your custom text here...',
      style: 'paragraph'
    }
  }
];

const chartTypes = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' }
];

const dataSources = [
  { value: 'assets_by_type', label: 'Assets by Type' },
  { value: 'tasks_by_status', label: 'Tasks by Status' },
  { value: 'maintenance_trends', label: 'Maintenance Trends' },
  { value: 'compliance_status', label: 'Compliance Status' },
  { value: 'team_utilization', label: 'Team Utilization' },
  { value: 'cost_analysis', label: 'Cost Analysis' }
];

const kpiMetrics = [
  { value: 'total_assets', label: 'Total Assets' },
  { value: 'pending_tasks', label: 'Pending Tasks' },
  { value: 'team_utilization', label: 'Team Utilization' },
  { value: 'compliance_rate', label: 'Compliance Rate' },
  { value: 'mttr', label: 'Mean Time to Repair' },
  { value: 'cost_per_asset', label: 'Cost per Asset' }
];

export default function CustomReportBuilder({ isOpen, onClose, onSave }: CustomReportBuilderProps) {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ReportComponent | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const addComponent = (componentType: any) => {
    const newComponent: ReportComponent = {
      id: Date.now().toString(),
      type: componentType.type,
      title: componentType.title,
      config: { ...componentType.defaultConfig },
      position: components.length
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const updateComponent = (id: string, updates: Partial<ReportComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === components.length - 1)
    ) {
      return;
    }

    const newComponents = [...components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
    newComponents.forEach((comp, idx) => comp.position = idx);
    
    setComponents(newComponents);
  };

  const handleSave = async () => {
    const report = {
      name: reportName,
      description: reportDescription,
      components: components.map(comp => ({ ...comp })),
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('custom_reports')
      .insert([report])
      .select();
      
    if (error) {
      console.error('Error saving custom report:', error);
      // You might want to show a notification here
    } else {
      onSave(data[0]);
    }

    onClose();
  };

  const renderComponentConfig = (component: ReportComponent) => {
    switch (component.type) {
      case 'kpi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select
                value={component.config.metric || ''}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, metric: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {kpiMetrics.map(metric => (
                  <option key={metric.value} value={metric.value}>{metric.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
              <select
                value={component.config.color || 'blue'}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, color: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
              <select
                value={component.config.chartType || 'bar'}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, chartType: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
              <select
                value={component.config.dataSource || ''}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, dataSource: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {dataSources.map(source => (
                  <option key={source.value} value={source.value}>{source.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
              <select
                value={component.config.dataSource || ''}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, dataSource: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="recent_tasks">Recent Tasks</option>
                <option value="assets">Asset List</option>
                <option value="team_members">Team Members</option>
                <option value="compliance">Compliance Items</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Rows</label>
              <input
                type="number"
                value={component.config.maxRows || 10}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, maxRows: parseInt(e.target.value) }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="5"
                max="50"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={component.config.content || ''}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, content: e.target.value }
                })}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your custom text content..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={component.config.style || 'paragraph'}
                onChange={(e) => updateComponent(component.id, {
                  config: { ...component.config, style: e.target.value }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="heading">Heading</option>
                <option value="paragraph">Paragraph</option>
                <option value="note">Note/Callout</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white min-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-medium text-gray-900">Custom Report Builder</h3>
            <p className="text-sm text-gray-600">Drag and drop components to create custom reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <EyeIcon className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Report Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Brief report description..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Component Library */}
          <div className="lg:col-span-1">
            <h4 className="text-md font-medium text-gray-900 mb-4">Available Components</h4>
            <div className="space-y-3">
              {availableComponents.map((comp) => (
                <Card key={comp.type} className="p-3 cursor-pointer hover:shadow-lg transition-all duration-200" hover>
                  <div
                    onClick={() => addComponent(comp)}
                    className="flex items-center space-x-3"
                  >
                    <comp.icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{comp.title}</p>
                      <p className="text-xs text-gray-600">{comp.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Report Builder Area */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Report Components</h4>
              <span className="text-sm text-gray-500">{components.length} components</span>
            </div>
            
            {showPreview ? (
              <Card className="p-6 min-h-96">
                <div className="space-y-6">
                  <div className="text-center border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {reportName || 'Custom Report'}
                    </h2>
                    {reportDescription && (
                      <p className="text-gray-600 mt-2">{reportDescription}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Generated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  
                  {components.map((component) => (
                    <div key={component.id} className="border border-gray-200 rounded-lg p-4">
                      {component.type === 'kpi' && (
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{component.title}</h3>
                          <div className="text-3xl font-bold text-blue-600">247</div>
                          <div className="text-sm text-gray-600">Sample KPI Value</div>
                        </div>
                      )}
                      
                      {component.type === 'chart' && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">{component.title}</h3>
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-12 w-12 text-gray-400" />
                            <span className="ml-2 text-gray-500">
                              {component.config.chartType || 'Chart'} Preview
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {component.type === 'table' && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">{component.title}</h3>
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TableCellsIcon className="h-12 w-12 text-gray-400" />
                            <span className="ml-2 text-gray-500">Table Preview</span>
                          </div>
                        </div>
                      )}
                      
                      {component.type === 'text' && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900">{component.title}</h3>
                          <p className="text-gray-700">{component.config.content || 'Sample text content'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {components.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Add components to see report preview
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-3 min-h-96">
                {components.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ClipboardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No components added yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click on components from the left panel to add them to your report
                    </p>
                  </Card>
                ) : (
                  components.map((component, index) => (
                    <Card key={component.id} className={`p-4 ${
                      selectedComponent?.id === component.id ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      <div 
                        className="cursor-pointer"
                        onClick={() => setSelectedComponent(component)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveComponent(component.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsUpDownIcon className="h-3 w-3 transform rotate-180" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveComponent(component.id, 'down');
                              }}
                              disabled={index === components.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsUpDownIcon className="h-3 w-3" />
                            </button>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{component.title}</p>
                            <p className="text-sm text-gray-600 capitalize">{component.type} component</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(component.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Component Configuration */}
          <div className="lg:col-span-1">
            {selectedComponent ? (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Component Settings</h4>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={selectedComponent.title}
                        onChange={(e) => updateComponent(selectedComponent.id, { title: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    {renderComponentConfig(selectedComponent)}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Select a component to configure its settings</p>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {components.length} components • Ready to save
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!reportName.trim() || components.length === 0}
            >
              Save Report Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}