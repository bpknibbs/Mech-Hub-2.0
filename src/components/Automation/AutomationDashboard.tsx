import React, { useState } from 'react';
import { 
  CogIcon, 
  BoltIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useAutomation } from '../../contexts/AutomationContext';

interface AutomationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AutomationDashboard({ isOpen, onClose }: AutomationDashboardProps) {
  const {
    rules,
    predictiveAlerts,
    autoWorkOrders,
    stockAlerts,
    escalationAlerts,
    toggleRule,
    runAutomationCycle,
    dismissAlert
  } = useAutomation();

  const [activeTab, setActiveTab] = useState<'rules' | 'alerts' | 'predictions' | 'workorders'>('alerts');

  if (!isOpen) return null;

  const totalAlerts = predictiveAlerts.length + stockAlerts.length + escalationAlerts.length;
  const activeRules = rules.filter(r => r.enabled).length;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white min-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BoltIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-medium text-gray-900">Automation Center</h3>
              <p className="text-sm text-gray-600">Smart notifications and automated maintenance management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={runAutomationCycle} variant="outline" size="sm">
              <BoltIcon className="h-4 w-4 mr-2" />
              Run Cycle
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <CogIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{activeRules}</div>
                <div className="text-sm text-blue-600">Active Rules</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700">{totalAlerts}</div>
                <div className="text-sm text-red-600">Active Alerts</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">{autoWorkOrders.length}</div>
                <div className="text-sm text-green-600">Auto Work Orders</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BoltIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700">{predictiveAlerts.length}</div>
                <div className="text-sm text-purple-600">Predictions</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'alerts', label: 'Active Alerts', count: totalAlerts },
              { key: 'predictions', label: 'Predictions', count: predictiveAlerts.length },
              { key: 'workorders', label: 'Auto Work Orders', count: autoWorkOrders.length },
              { key: 'rules', label: 'Automation Rules', count: rules.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'alerts' && (
            <AlertsTab 
              stockAlerts={stockAlerts}
              escalationAlerts={escalationAlerts}
              onDismiss={dismissAlert}
            />
          )}
          
          {activeTab === 'predictions' && (
            <PredictionsTab 
              predictiveAlerts={predictiveAlerts}
              onDismiss={dismissAlert}
            />
          )}
          
          {activeTab === 'workorders' && (
            <WorkOrdersTab 
              autoWorkOrders={autoWorkOrders}
              onDismiss={dismissAlert}
            />
          )}
          
          {activeTab === 'rules' && (
            <RulesTab 
              rules={rules}
              onToggle={toggleRule}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ stockAlerts, escalationAlerts, onDismiss }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Active System Alerts</h3>
      
      {/* Stock Alerts */}
      {stockAlerts.map((alert: any) => (
        <Card key={alert.id} className="p-4 border-l-4 border-l-orange-500 bg-orange-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-orange-900">Low Stock Alert</h4>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  alert.urgency === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {alert.urgency.toUpperCase()}
                </span>
              </div>
              <p className="text-orange-800 mb-2">
                <strong>{alert.itemName}</strong>: {alert.currentStock} remaining (minimum: {alert.minimumLevel})
              </p>
              <div className="text-sm text-orange-700">
                <p>Supplier: {alert.supplier}</p>
                <p>Suggested reorder: {alert.suggestedQuantity} units</p>
                {alert.autoReorderEnabled && (
                  <p className="text-green-700 font-medium">✓ Auto-reorder enabled</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss('stock', alert.id)}
              className="text-orange-400 hover:text-orange-600 ml-4"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </Card>
      ))}

      {/* Escalation Alerts */}
      {escalationAlerts.map((alert: any) => (
        <Card key={alert.id} className="p-4 border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Task Escalation</h4>
                <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  LEVEL {alert.escalationLevel}
                </span>
              </div>
              <p className="text-red-800 mb-2">
                <strong>{alert.taskTitle}</strong> is {alert.daysOverdue} days overdue
              </p>
              <div className="text-sm text-red-700">
                <p>Assignee: {alert.assignee}</p>
                <p>Supervisor notified: {alert.supervisor}</p>
                <p>Escalated: {new Date(alert.lastEscalated).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => onDismiss('escalation', alert.id)}
              className="text-red-400 hover:text-red-600 ml-4"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </Card>
      ))}

      {stockAlerts.length === 0 && escalationAlerts.length === 0 && (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No active alerts - all systems operating normally</p>
        </div>
      )}
    </div>
  );
}

function PredictionsTab({ predictiveAlerts, onDismiss }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Predictive Maintenance Alerts</h3>
      
      {predictiveAlerts.map((alert: any) => (
        <Card key={alert.id} className="p-4 border-l-4 border-l-purple-500 bg-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <BoltIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">{alert.assetName}</h4>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-purple-800 mb-2">
                <strong>{alert.alertType.replace('_', ' ').toUpperCase()}</strong> predicted for {' '}
                {new Date(alert.predictedDate).toLocaleDateString()}
              </p>
              <div className="text-sm text-purple-700 mb-3">
                <p>Confidence: {Math.round(alert.confidence * 100)}%</p>
                <p>Triggers: {alert.triggers.join(', ')}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-purple-900 mb-1">Recommendations:</p>
                <ul className="list-disc list-inside text-purple-700">
                  {alert.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => onDismiss('predictive', alert.id)}
              className="text-purple-400 hover:text-purple-600 ml-4"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </Card>
      ))}

      {predictiveAlerts.length === 0 && (
        <div className="text-center py-8">
          <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No predictive alerts - system is analyzing asset patterns</p>
        </div>
      )}
    </div>
  );
}

function WorkOrdersTab({ autoWorkOrders, onDismiss }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Automatically Generated Work Orders</h3>
      
      {autoWorkOrders.map((order: any) => (
        <Card key={order.id} className="p-4 border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">{order.title}</h4>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  order.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.priority.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>Type: {order.type.toUpperCase()}</p>
                <p>Scheduled: {new Date(order.scheduledDate).toLocaleString()}</p>
                <p>Generated by: {order.generatedBy}</p>
                <p>Source rule: {order.sourceRule}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm">Assign</Button>
              <button
                onClick={() => onDismiss('workorder', order.id)}
                className="text-green-400 hover:text-green-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
      ))}

      {autoWorkOrders.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No auto-generated work orders currently</p>
        </div>
      )}
    </div>
  );
}

function RulesTab({ rules, onToggle }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
        <Button size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
      
      {rules.map((rule: any) => (
        <Card key={rule.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className={`p-1 rounded mr-3 ${
                  rule.enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {rule.enabled ? (
                    <EyeIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900">{rule.name}</h4>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  rule.type === 'predictive_maintenance' ? 'bg-purple-100 text-purple-800' :
                  rule.type === 'auto_work_order' ? 'bg-green-100 text-green-800' :
                  rule.type === 'stock_reorder' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {rule.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Triggered {rule.triggerCount} times</p>
                {rule.lastTriggered && (
                  <p>Last triggered: {new Date(rule.lastTriggered).toLocaleString()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggle(rule.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  rule.enabled
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}