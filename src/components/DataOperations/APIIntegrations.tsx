import React, { useState } from 'react';
import { 
  LinkIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon,
  ArrowPathIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useDataOperations } from '../../contexts/DataOperationsContext';

interface APIIntegrationsProps {
  className?: string;
}

export default function APIIntegrations({ className = '' }: APIIntegrationsProps) {
  const { 
    apiConnections, 
    syncWithAPI, 
    addAPIConnection, 
    updateAPIConnection, 
    deleteAPIConnection,
    testAPIConnection 
  } = useDataOperations();

  const [showNewConnection, setShowNewConnection] = useState(false);
  const [showConnectionConfig, setShowConnectionConfig] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [newConnectionData, setNewConnectionData] = useState({
    name: '',
    type: 'cmms' as const,
    endpoint: '',
    enabled: true,
    config: {}
  });

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'cmms':
        return '⚙️';
      case 'erp':
        return '💼';
      case 'iot':
        return '📡';
      case 'reporting':
        return '📊';
      default:
        return '🔗';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    const connection = apiConnections.find(c => c.id === connectionId);
    
    if (connection) {
      const isValid = await testAPIConnection(connection);
      updateAPIConnection(connectionId, { 
        status: isValid ? 'connected' : 'error' 
      });
    }
    
    setTestingConnection(null);
  };

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await testAPIConnection(newConnectionData);
    
    addAPIConnection({
      ...newConnectionData,
      status: isValid ? 'connected' : 'error'
    });

    setShowNewConnection(false);
    setNewConnectionData({
      name: '',
      type: 'cmms',
      endpoint: '',
      enabled: true,
      config: {}
    });
  };

  const connectionTypes = [
    { value: 'cmms', label: 'CMMS (Computerized Maintenance Management)' },
    { value: 'erp', label: 'ERP (Enterprise Resource Planning)' },
    { value: 'iot', label: 'IoT Platform (Internet of Things)' },
    { value: 'reporting', label: 'Reporting System' },
    { value: 'other', label: 'Other System' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">API Integrations</h3>
          <p className="text-sm text-gray-600">Connect with external systems and automate data synchronization</p>
        </div>
        <Button onClick={() => setShowNewConnection(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{apiConnections.length}</div>
          <div className="text-sm text-gray-600">Total Connections</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {apiConnections.filter(c => c.status === 'connected').length}
          </div>
          <div className="text-sm text-gray-600">Connected</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {apiConnections.filter(c => c.status === 'error').length}
          </div>
          <div className="text-sm text-gray-600">Errors</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {apiConnections.filter(c => c.enabled).length}
          </div>
          <div className="text-sm text-gray-600">Enabled</div>
        </Card>
      </div>

      {/* Connections List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {apiConnections.map(connection => (
          <Card key={connection.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`text-2xl`}>{getConnectionTypeIcon(connection.type)}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{connection.type} Integration</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                  {connection.status === 'connected' ? (
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                  ) : connection.status === 'error' ? (
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  ) : null}
                  {connection.status.toUpperCase()}
                </span>
                <button
                  onClick={() => updateAPIConnection(connection.id, { enabled: !connection.enabled })}
                  className={`p-1 rounded ${connection.enabled ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {connection.enabled ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Endpoint:</span>
                <span className="text-gray-900 font-mono text-xs truncate max-w-48">
                  {connection.endpoint}
                </span>
              </div>
              {connection.lastSync && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="text-gray-900">
                    {formatDistanceToNow(new Date(connection.lastSync), { addSuffix: true })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`${
                  connection.enabled ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {connection.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleTestConnection(connection.id)}
                  disabled={testingConnection === connection.id}
                >
                  {testingConnection === connection.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  Test
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowConnectionConfig(connection.id)}
                >
                  <CogIcon className="h-4 w-4" />
                  Config
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm"
                  onClick={() => syncWithAPI(connection.id)}
                  disabled={connection.status !== 'connected'}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Sync
                </Button>
                <Button 
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('Delete this API connection?')) {
                      deleteAPIConnection(connection.id);
                    }
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {apiConnections.length === 0 && (
          <Card className="p-12 text-center col-span-full">
            <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API Connections</h3>
            <p className="text-gray-600 mb-4">
              Connect with external systems to automate data synchronization
            </p>
            <Button onClick={() => setShowNewConnection(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Connection
            </Button>
          </Card>
        )}
      </div>

      {/* New Connection Modal */}
      {showNewConnection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add API Connection</h3>
              <button
                onClick={() => setShowNewConnection(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddConnection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  value={newConnectionData.name}
                  onChange={(e) => setNewConnectionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. MaintenanceManager Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Type
                </label>
                <select
                  value={newConnectionData.type}
                  onChange={(e) => setNewConnectionData(prev => ({ 
                    ...prev, 
                    type: e.target.value as any 
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {connectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="url"
                  required
                  value={newConnectionData.endpoint}
                  onChange={(e) => setNewConnectionData(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newConnectionData.enabled}
                  onChange={(e) => setNewConnectionData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable connection after adding
                </label>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowNewConnection(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Connection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connection Configuration Modal */}
      {showConnectionConfig && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Connection Configuration</h3>
              <button
                onClick={() => setShowConnectionConfig(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {(() => {
              const connection = apiConnections.find(c => c.id === showConnectionConfig);
              if (!connection) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={connection.name}
                        onChange={(e) => updateAPIConnection(connection.id, { name: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={connection.type}
                        onChange={(e) => updateAPIConnection(connection.id, { type: e.target.value as any })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {connectionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                    <input
                      type="url"
                      value={connection.endpoint}
                      onChange={(e) => updateAPIConnection(connection.id, { endpoint: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Connection-specific configuration */}
                  <Card className="p-4 bg-gray-50">
                    <h5 className="font-medium text-gray-900 mb-3">Connection Settings</h5>
                    <div className="space-y-3">
                      {connection.type === 'cmms' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600">API Key</label>
                            <input
                              type="password"
                              placeholder="Enter API key"
                              className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">Sync Frequency</label>
                            <select className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <option>Real-time</option>
                              <option>Every 15 minutes</option>
                              <option>Hourly</option>
                              <option>Daily</option>
                            </select>
                          </div>
                        </>
                      )}
                      
                      {connection.type === 'iot' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600">Device Token</label>
                            <input
                              type="password"
                              placeholder="Enter device token"
                              className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">Data Points</label>
                            <input
                              type="text"
                              placeholder="temperature,pressure,flow"
                              className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}

                      {connection.type === 'erp' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600">Username</label>
                            <input
                              type="text"
                              placeholder="Enter username"
                              className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">Password</label>
                            <input
                              type="password"
                              placeholder="Enter password"
                              className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </Card>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={connection.enabled}
                      onChange={(e) => updateAPIConnection(connection.id, { enabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Enable automatic synchronization
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowConnectionConfig(null)} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        handleTestConnection(connection.id);
                        setShowConnectionConfig(null);
                      }}
                      className="flex-1"
                    >
                      Test & Save
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Integration Examples */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Integration Capabilities</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>CMMS Systems:</strong> Sync work orders, assets, and maintenance schedules</p>
              <p>• <strong>IoT Platforms:</strong> Real-time sensor data and equipment monitoring</p>
              <p>• <strong>ERP Systems:</strong> Financial data, inventory, and procurement integration</p>
              <p>• <strong>Reporting Tools:</strong> Automated report generation and distribution</p>
              <p>• <strong>Custom APIs:</strong> Connect with any REST or GraphQL API</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}