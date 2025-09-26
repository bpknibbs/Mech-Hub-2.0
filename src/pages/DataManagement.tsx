import React, { useState, useEffect } from 'react';
import { 
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  Squares2X2Icon,
  CloudArrowUpIcon,
  CogIcon,
  ChartBarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import BulkOperations from '../components/DataOperations/BulkOperations';
import DataImport from '../components/DataOperations/DataImport';
import APIIntegrations from '../components/DataOperations/APIIntegrations';
import ExportDialog from '../components/DataOperations/ExportDialog';
import { useDataOperations } from '../contexts/DataOperationsContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function DataManagement() {
  const { 
    selectedItems, 
    bulkOperations, 
    apiConnections,
    exportData,
    clearSelection 
  } = useDataOperations();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk' | 'import' | 'export' | 'api'>('overview');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportCategory, setExportCategory] = useState('assets');
  const [dataStats, setDataStats] = useState({
    assets: { count: 0, lastUpdated: '' },
    tasks: { count: 0, lastUpdated: '' },
    team: { count: 0, lastUpdated: '' },
    properties: { count: 0, lastUpdated: '' },
    forms: { count: 0, lastUpdated: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataStats = async () => {
      try {
        const [
          { count: assetsCount },
          { count: tasksCount },
          { count: teamCount },
          { count: propertiesCount },
          { count: formsCount },
        ] = await Promise.all([
          supabase.from('assets').select('*', { count: 'exact', head: true }),
          supabase.from('work_orders').select('*', { count: 'exact', head: true }),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('form_submissions').select('*', { count: 'exact', head: true }),
        ]);

        setDataStats({
          assets: { count: assetsCount || 0, lastUpdated: new Date().toISOString() },
          tasks: { count: tasksCount || 0, lastUpdated: new Date().toISOString() },
          team: { count: teamCount || 0, lastUpdated: new Date().toISOString() },
          properties: { count: propertiesCount || 0, lastUpdated: new Date().toISOString() },
          forms: { count: formsCount || 0, lastUpdated: new Date().toISOString() },
        });
      } catch (error) {
        console.error('Error fetching data stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataStats();
  }, []);

  const totalSelected = Object.values(selectedItems).reduce((sum, items) => sum + items.length, 0);
  const activeOperations = bulkOperations.filter(op => op.status === 'processing').length;
  const connectedAPIs = apiConnections.filter(api => api.status === 'connected').length;

  const handleQuickExport = (category: string) => {
    setExportCategory(category);
    setShowExportDialog(true);
  };

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      description: 'Data management dashboard'
    },
    {
      key: 'bulk',
      label: 'Bulk Operations',
      icon: Squares2X2Icon,
      count: totalSelected,
      description: 'Mass update and manage records'
    },
    {
      key: 'import',
      label: 'Data Import',
      icon: ArrowUpTrayIcon,
      description: 'Upload CSV and Excel files'
    },
    {
      key: 'export',
      label: 'Data Export',
      icon: DocumentArrowDownIcon,
      description: 'Export to Excel, PDF, CSV'
    },
    {
      key: 'api',
      label: 'API Integration',
      icon: LinkIcon,
      count: connectedAPIs,
      description: 'Connect external systems'
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Management & Integration</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive data operations, imports, exports, and API integrations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeOperations > 0 && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-sm font-medium">{activeOperations} operations running</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    (tab.key === 'bulk' && tab.count > 0) || (tab.key === 'api' && tab.count < apiConnections.length)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <>
            {/* Data Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(dataStats).map(([category, stats]) => (
                <Card key={category} className="p-6 hover:shadow-lg transition-all duration-200" hover>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                      <p className="text-sm text-gray-600">{stats.count} records</p>
                    </div>
                    <div className="text-2xl">
                      {category === 'assets' ? '⚙️' :
                       category === 'tasks' ? '📋' :
                       category === 'team' ? '👥' :
                       category === 'properties' ? '🏢' : '📝'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-900">
                        {new Date(stats.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected:</span>
                      <span className="text-gray-900">
                        {selectedItems[category]?.length || 0} items
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleQuickExport(category)}
                      className="flex-1"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <DataImport category={category} className="flex-1" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Quick Import</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Rapidly upload data using our standardized templates
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <DataImport category="assets" />
                  <DataImport category="team" />
                  <DataImport category="tasks" />
                  <DataImport category="properties" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <LinkIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">API Status</h3>
                </div>
                <div className="space-y-3">
                  {apiConnections.slice(0, 3).map(connection => (
                    <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getConnectionTypeIcon(connection.type)}</span>
                        <span className="text-sm font-medium text-gray-900">{connection.name}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        connection.status === 'connected' ? 'bg-green-100 text-green-800' :
                        connection.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {connection.status}
                      </span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('api')} className="w-full">
                    Manage All Connections
                  </Button>
                </div>
              </Card>
            </div>

            {/* Recent Operations */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Operations</h3>
              <div className="space-y-3">
                {bulkOperations.slice(-5).map(operation => (
                  <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        operation.status === 'completed' ? 'bg-green-500' :
                        operation.status === 'failed' ? 'bg-red-500' :
                        operation.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)} operation
                        </p>
                        <p className="text-xs text-gray-600">
                          {operation.itemIds.length} items • {new Date(operation.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {operation.status === 'processing' && (
                        <span className="text-sm text-blue-600">{operation.progress}%</span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                        operation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {operation.status}
                      </span>
                    </div>
                  </div>
                ))}
                {bulkOperations.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <TableCellsIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No recent operations</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'bulk' && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Squares2X2Icon className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-medium text-gray-900">Bulk Operations</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">ℹ️</div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Bulk Operations Guide</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>1. Navigate to any data page (Assets, Tasks, Team, etc.)</p>
                      <p>2. Use checkboxes to select multiple items</p>
                      <p>3. Choose from available bulk actions in the toolbar</p>
                      <p>4. Monitor progress and results here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Selections */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Current Selections</h4>
                {totalSelected === 0 ? (
                  <p className="text-gray-600 text-center py-4">
                    No items selected. Visit data pages to select items for bulk operations.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedItems).map(([category, items]) => (
                      items.length > 0 && (
                        <div key={category} className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{items.length}</div>
                          <div className="text-sm text-blue-600 capitalize">{category}</div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => clearSelection(category)}
                            className="mt-2 w-full"
                          >
                            Clear
                          </Button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </Card>

              {/* Active Operations */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Operation History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bulkOperations.map(operation => (
                    <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          operation.status === 'completed' ? 'bg-green-500' :
                          operation.status === 'failed' ? 'bg-red-500' :
                          operation.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {operation.type.toUpperCase()} - {operation.itemIds.length} items
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(operation.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {operation.status === 'processing' && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${operation.progress}%` }}
                            />
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                          operation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {operation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bulkOperations.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Squares2X2Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No bulk operations yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Card>
        )}

        {activeTab === 'import' && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ArrowUpTrayIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-medium text-gray-900">Data Import Tools</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Import Assets</h4>
                <p className="text-gray-600 mb-4">Upload asset inventory data from spreadsheets</p>
                <DataImport category="assets" />
              </Card>
              
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Import Team Data</h4>
                <p className="text-gray-600 mb-4">Bulk upload team member information and skills</p>
                <DataImport category="team" />
              </Card>
              
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Import Tasks</h4>
                <p className="text-gray-600 mb-4">Upload maintenance tasks and work orders</p>
                <DataImport category="tasks" />
              </Card>
              
              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Import Properties</h4>
                <p className="text-gray-600 mb-4">Upload plant rooms and facility data</p>
                <DataImport category="properties" />
              </Card>
            </div>
          </Card>
        )}

        {activeTab === 'export' && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-medium text-gray-900">Data Export</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(dataStats).map(([category, stats]) => (
                <Card key={category} className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">
                      {category === 'assets' ? '⚙️' :
                       category === 'tasks' ? '📋' :
                       category === 'team' ? '👥' :
                       category === 'properties' ? '🏢' : '📝'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                      <p className="text-sm text-gray-600">{stats.count} records</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleQuickExport(category)}
                      className="w-full"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      Export {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Excel • PDF • CSV formats
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'api' && <APIIntegrations />}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={(options) => {
          // Get all items for the category - in real app, this would be filtered data
          const allItemIds = Array.from({ length: dataStats[exportCategory as keyof typeof dataStats].count }, (_, i) => `${exportCategory}-${i + 1}`);
          exportData(exportCategory, allItemIds, options);
        }}
        category={exportCategory}
        itemCount={dataStats[exportCategory as keyof typeof dataStats]?.count || 0}
      />
    </div>
  );
}

function getConnectionTypeIcon(type: string) {
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
}