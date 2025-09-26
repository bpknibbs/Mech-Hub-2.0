import React, { useState } from 'react';
import { 
  ClockIcon, 
  EnvelopeIcon, 
  CalendarDaysIcon,
  XMarkIcon,
  PlusIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useCompliance } from '../../contexts/ComplianceContext';

interface ReportSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportScheduler({ isOpen, onClose }: ReportSchedulerProps) {
  const { scheduledReports, scheduleReport, updateScheduledReport, deleteScheduledReport } = useCompliance();
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'compliance' as const,
    frequency: 'weekly' as const,
    recipients: [''],
    components: [] as string[],
    active: true
  });

  if (!isOpen) return null;

  const handleAddRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateRecipient = (index: number, email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? email : r)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRecipients = formData.recipients.filter(r => r.trim() && r.includes('@'));
    
    if (validRecipients.length === 0) {
      alert('Please add at least one valid email recipient');
      return;
    }

    scheduleReport({
      ...formData,
      recipients: validRecipients
    });

    setFormData({
      name: '',
      type: 'compliance',
      frequency: 'weekly',
      recipients: [''],
      components: [],
      active: true
    });
    setShowNewSchedule(false);
  };

  const toggleReportStatus = (id: string) => {
    const report = scheduledReports.find(r => r.id === id);
    if (report) {
      updateScheduledReport(id, { active: !report.active });
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '📈';
      case 'quarterly': return '📋';
      default: return '⏰';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'compliance':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'performance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'custom':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const mockComponentOptions = [
    'Executive Summary',
    'Compliance Status',
    'Asset Performance',
    'Task Summary',
    'Cost Analysis',
    'Team Performance',
    'Maintenance Trends',
    'Certificate Status',
    'Benchmark Comparison'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white min-h-[85vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-medium text-gray-900">Report Scheduler</h3>
              <p className="text-sm text-gray-600">Automate report delivery via email</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowNewSchedule(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* New Schedule Form */}
        {showNewSchedule && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Schedule New Report</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. Weekly Compliance Report"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="compliance">Compliance Report</option>
                    <option value="maintenance">Maintenance Report</option>
                    <option value="performance">Performance Report</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients</label>
                <div className="space-y-2">
                  {formData.recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => handleUpdateRecipient(index, e.target.value)}
                        placeholder="email@company.com"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {formData.recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddRecipient}>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Recipient
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Components</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {mockComponentOptions.map((component) => (
                    <label key={component} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.components.includes(component)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              components: [...prev.components, component]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              components: prev.components.filter(c => c !== component)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{component}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowNewSchedule(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule Report
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Scheduled Reports List */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Scheduled Reports</h4>
          
          {scheduledReports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getFrequencyIcon(report.frequency)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getReportTypeColor(report.type)}`}>
                          {report.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">Every {report.frequency}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recipients:</p>
                      <div className="flex flex-wrap gap-1">
                        {report.recipients.map((recipient, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {recipient}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Schedule:</p>
                      <div className="text-sm text-gray-900">
                        <p>Next run: {new Date(report.next_run).toLocaleString()}</p>
                        {report.last_run && (
                          <p>Last run: {new Date(report.last_run).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Components ({report.components.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {report.components.map((component, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <button
                    onClick={() => toggleReportStatus(report.id)}
                    className={`p-2 rounded transition-colors ${
                      report.active 
                        ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                    }`}
                    title={report.active ? 'Pause' : 'Resume'}
                  >
                    {report.active ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  </button>
                  
                  <Button size="sm" variant="outline">
                    Run Now
                  </Button>
                  
                  <button
                    onClick={() => deleteScheduledReport(report.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded transition-colors"
                    title="Delete Schedule"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {scheduledReports.length === 0 && (
            <Card className="p-12 text-center">
              <PaperAirplaneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
              <p className="text-gray-600 mb-4">
                Create automated report schedules to receive regular compliance and performance updates
              </p>
              <Button onClick={() => setShowNewSchedule(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Schedule Your First Report
              </Button>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}