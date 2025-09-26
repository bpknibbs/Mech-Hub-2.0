import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import { supabase } from '../lib/supabase';

interface BulkOperation {
  id: string;
  type: 'update' | 'delete' | 'export' | 'assign';
  itemIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  columns?: string[];
  filters?: Record<string, any>;
  title?: string;
  includeImages?: boolean;
  dateRange?: { from: string; to: string };
}

interface ImportResult {
  success: boolean;
  processed: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  warnings: Array<{ row: number; warning: string }>;
}

interface APIConnection {
  id: string;
  name: string;
  type: 'cmms' | 'erp' | 'iot' | 'reporting' | 'other';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config: Record<string, any>;
  enabled: boolean;
}

interface DataOperationsContextType {
  selectedItems: Record<string, string[]>;
  bulkOperations: BulkOperation[];
  apiConnections: APIConnection[];
  selectItem: (category: string, itemId: string) => void;
  deselectItem: (category: string, itemId: string) => void;
  selectAllItems: (category: string, itemIds: string[]) => void;
  clearSelection: (category: string) => void;
  performBulkOperation: (category: string, operation: string, data?: any) => Promise<void>;
  exportData: (category: string, itemIds: string[], options: ExportOptions) => Promise<void>;
  importData: (category: string, file: File, mapping?: Record<string, string>) => Promise<ImportResult>;
  syncWithAPI: (connectionId: string) => Promise<void>;
  addAPIConnection: (connection: Omit<APIConnection, 'id' | 'status' | 'lastSync'>) => void;
  updateAPIConnection: (id: string, updates: Partial<APIConnection>) => void;
  deleteAPIConnection: (id: string) => void;
  testAPIConnection: (connection: Partial<APIConnection>) => Promise<boolean>;
}

const DataOperationsContext = createContext<DataOperationsContextType | undefined>(undefined);

export function DataOperationsProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [apiConnections, setApiConnections] = useState<APIConnection[]>([]);
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    loadAPIConnections();
  }, []);

  const loadAPIConnections = () => {
    // Mock API connections
    const mockConnections: APIConnection[] = [
      {
        id: '1',
        name: 'MaintenanceManager Pro',
        type: 'cmms',
        endpoint: 'https://api.maintenancemanager.com/v1',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        config: {
          apiKey: '****-****-****-5678',
          syncFrequency: 'hourly',
          syncDirection: 'bidirectional'
        },
        enabled: true
      },
      {
        id: '2',
        name: 'Building IoT Platform',
        type: 'iot',
        endpoint: 'https://iot.buildingplatform.com/api',
        status: 'connected',
        lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        config: {
          deviceToken: '****-****-****-9012',
          dataPoints: ['temperature', 'pressure', 'flow'],
          interval: 'real-time'
        },
        enabled: true
      },
      {
        id: '3',
        name: 'ERP System Integration',
        type: 'erp',
        endpoint: 'https://erp.company.com/api/maintenance',
        status: 'error',
        config: {
          username: 'maintenance_user',
          password: '****',
          syncTables: ['assets', 'work_orders', 'inventory']
        },
        enabled: false
      }
    ];
    
    setApiConnections(mockConnections);
  };

  const selectItem = useCallback((category: string, itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), itemId]
    }));
  }, []);

  const deselectItem = useCallback((category: string, itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(id => id !== itemId)
    }));
  }, []);

  const selectAllItems = useCallback((category: string, itemIds: string[]) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: itemIds
    }));
  }, []);

  const clearSelection = useCallback((category: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: []
    }));
  }, []);

  const performBulkOperation = async (category: string, operation: string, data?: any) => {
    const selectedIds = selectedItems[category] || [];
    if (selectedIds.length === 0) return;

    const bulkOp: BulkOperation = {
      id: Date.now().toString(),
      type: operation as any,
      itemIds: selectedIds,
      status: 'processing',
      progress: 0,
      startedAt: new Date().toISOString()
    };

    setBulkOperations(prev => [...prev, bulkOp]);
    
    let table = '';
    let statusField = '';

    switch (category) {
      case 'assets':
        table = 'assets';
        statusField = 'status';
        break;
      case 'tasks':
        table = 'work_orders';
        statusField = 'status';
        break;
      case 'team':
        table = 'teams';
        statusField = 'status';
        break;
      default:
        return;
    }

    try {
      // Simulate bulk operation with progress
      for (let i = 0; i <= 100; i += 10) {
        setBulkOperations(prev => prev.map(op => 
          op.id === bulkOp.id ? { ...op, progress: i } : op
        ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (operation === 'delete') {
        const { error } = await supabase.from(table).delete().in('id', selectedIds);
        if (error) throw error;
      } else if (operation === 'update_status') {
        const { error } = await supabase.from(table).update({ [statusField]: data.status }).in('id', selectedIds);
        if (error) throw error;
      } else if (operation === 'assign_tasks') {
        const { error } = await supabase.from(table).update({ assigned_to: data.assigned_to, due_date: data.due_date, priority: data.priority }).in('id', selectedIds);
        if (error) throw error;
      }

      setBulkOperations(prev => prev.map(op => 
        op.id === bulkOp.id ? { 
          ...op, 
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: { processed: selectedIds.length }
        } : op
      ));

      addNotification({
        title: 'Bulk Operation Completed',
        message: `Successfully ${operation}d ${selectedIds.length} items in ${category}`,
        type: 'success'
      });

      clearSelection(category);

    } catch (error) {
      setBulkOperations(prev => prev.map(op => 
        op.id === bulkOp.id ? { 
          ...op, 
          status: 'failed',
          error: error.message
        } : op
      ));
    }
  };

  const exportData = async (category: string, itemIds: string[], options: ExportOptions) => {
    try {
      // Mock export process
      const exportOp: BulkOperation = {
        id: Date.now().toString(),
        type: 'export',
        itemIds,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString()
      };

      setBulkOperations(prev => [...prev, exportOp]);

      // Simulate export progress
      for (let i = 0; i <= 100; i += 20) {
        setBulkOperations(prev => prev.map(op => 
          op.id === exportOp.id ? { ...op, progress: i } : op
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Fetch actual data from Supabase
      const { data, error } = await supabase
        .from(category)
        .select('*')
        .in('id', itemIds);
      
      if (error) throw error;
      
      // Generate mock file based on format
      let fileContent = '';
      let fileName = '';
      let mimeType = '';

      switch (options.format) {
        case 'excel':
          fileName = `${category}-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileContent = generateMockExcelData(data);
          break;
        case 'pdf':
          fileName = `${category}-report-${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          fileContent = generateMockPDFData(category, data, options);
          break;
        case 'csv':
          fileName = `${category}-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          fileContent = generateMockCSVData(data);
          break;
      }

      // Create download link
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBulkOperations(prev => prev.map(op => 
        op.id === exportOp.id ? { 
          ...op, 
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: { fileName, recordCount: itemIds.length }
        } : op
      ));

      addNotification({
        title: 'Export Completed',
        message: `${options.format.toUpperCase()} export completed: ${fileName}`,
        type: 'success'
      });

    } catch (error) {
      addNotification({
        title: 'Export Failed',
        message: 'Failed to export data. Please try again.',
        type: 'error'
      });
    }
  };

  const importData = async (category: string, file: File, mapping?: Record<string, string>): Promise<ImportResult> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const records = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          if (mapping?.[header]) {
            obj[mapping[header]] = values[index];
          }
        });
        return obj;
      });

      const { data, error } = await supabase
        .from(category)
        .insert(records);

      if (error) throw error;
      
      const importedCount = data?.length || 0;
      const failedCount = records.length - importedCount;
      
      const result: ImportResult = {
        success: failedCount === 0,
        processed: records.length,
        imported: importedCount,
        failed: failedCount,
        errors: failedCount > 0 ? [{ row: 0, error: 'Import failed for some records.' }] : [],
        warnings: []
      };

      addNotification({
        title: 'Import Completed',
        message: `Imported ${result.imported}/${result.processed} records successfully`,
        type: result.failed === 0 ? 'success' : 'warning'
      });

      return result;
    } catch (error) {
      return {
        success: false,
        processed: 0,
        imported: 0,
        failed: 0,
        errors: [{ row: 0, error: 'Failed to parse file or import to database' }],
        warnings: []
      };
    }
  };

  const syncWithAPI = async (connectionId: string) => {
    const connection = apiConnections.find(c => c.id === connectionId);
    if (!connection) return;

    try {
      setApiConnections(prev => prev.map(c => 
        c.id === connectionId ? { ...c, status: 'connected' } : c
      ));

      // Mock API sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      setApiConnections(prev => prev.map(c => 
        c.id === connectionId ? { 
          ...c, 
          status: 'connected',
          lastSync: new Date().toISOString()
        } : c
      ));

      addNotification({
        title: 'API Sync Completed',
        message: `Successfully synced with ${connection.name}`,
        type: 'success'
      });

    } catch (error) {
      setApiConnections(prev => prev.map(c => 
        c.id === connectionId ? { ...c, status: 'error' } : c
      ));

      addNotification({
        title: 'API Sync Failed',
        message: `Failed to sync with ${connection.name}`,
        type: 'error'
      });
    }
  };

  const addAPIConnection = (connection: Omit<APIConnection, 'id' | 'status' | 'lastSync'>) => {
    const newConnection: APIConnection = {
      ...connection,
      id: Date.now().toString(),
      status: 'disconnected'
    };
    setApiConnections(prev => [...prev, newConnection]);
  };

  const updateAPIConnection = (id: string, updates: Partial<APIConnection>) => {
    setApiConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ));
  };

  const deleteAPIConnection = (id: string) => {
    setApiConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const testAPIConnection = async (connection: Partial<APIConnection>): Promise<boolean> => {
    try {
      // Mock API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.3; // 70% success rate
    } catch (error) {
      return false;
    }
  };

  const value = {
    selectedItems,
    bulkOperations,
    apiConnections,
    selectItem,
    deselectItem,
    selectAllItems,
    clearSelection,
    performBulkOperation,
    exportData,
    importData,
    syncWithAPI,
    addAPIConnection,
    updateAPIConnection,
    deleteAPIConnection,
    testAPIConnection,
  };

  return (
    <DataOperationsContext.Provider value={value}>
      {children}
    </DataOperationsContext.Provider>
  );
}

export function useDataOperations() {
  const context = useContext(DataOperationsContext);
  if (context === undefined) {
    throw new Error('useDataOperations must be used within a DataOperationsProvider');
  }
  return context;
}

function generateMockExcelData(data: any[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}

function generateMockPDFData(category: string, data: any[], options: ExportOptions): string {
  // Mock PDF content (would use a proper PDF library in production)
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 750 Td
(${options.title || category.toUpperCase()} Report - ${data.length} items) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
230
%%EOF`;
}

function generateMockCSVData(data: any[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}