import React, { useState, useEffect } from 'react';
import { 
  CloudArrowUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface OfflineData {
  id: string;
  type: 'task-completion' | 'form-submission' | 'photo-upload';
  data: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private dbName = 'MechHubOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('status', 'status');
        }
      };
    });
  }

  async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'status'>): Promise<string> {
    if (!this.db) await this.init();

    const offlineData: OfflineData = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(offlineData.id);
    });
  }

  async getPendingData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateDataStatus(id: string, status: OfflineData['status']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.status = status;
          const updateRequest = store.put(data);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        } else {
          reject(new Error('Data not found'));
        }
      };
    });
  }

  async deleteData(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async syncPendingData(): Promise<void> {
    const pendingData = await this.getPendingData();
    
    for (const item of pendingData) {
      try {
        await this.updateDataStatus(item.id, 'syncing');
        
        // Simulate API call - replace with actual sync logic
        await this.syncDataItem(item);
        
        await this.updateDataStatus(item.id, 'synced');
        // Optionally delete synced data
        // await this.deleteData(item.id);
      } catch (error) {
        await this.updateDataStatus(item.id, 'failed');
        console.error('Failed to sync data:', error);
      }
    }
  }

  private async syncDataItem(item: OfflineData): Promise<void> {
    // Mock API sync - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(resolve, 1000 + Math.random() * 2000);
    });
  }
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [issyncing, setIssyncing] = useState(false);

  const offlineManager = OfflineStorageManager.getInstance();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize and check for pending data
    initOfflineManager();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initOfflineManager = async () => {
    try {
      await offlineManager.init();
      await updatePendingCount();
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
    }
  };

  const updatePendingCount = async () => {
    try {
      const pendingData = await offlineManager.getPendingData();
      setPendingCount(pendingData.length);
    } catch (error) {
      console.error('Failed to get pending data count:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline || issyncing) return;

    setIssyncing(true);
    try {
      await offlineManager.syncPendingData();
      await updatePendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIssyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!isOnline && (
        <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          <span className="text-xs">Offline</span>
        </div>
      )}
      
      {pendingCount > 0 && (
        <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          {issyncing ? (
            <CloudArrowUpIcon className="h-4 w-4 mr-1 animate-pulse" />
          ) : (
            <ClockIcon className="h-4 w-4 mr-1" />
          )}
          <span className="text-xs">
            {issyncing ? 'Syncing...' : `${pendingCount} pending`}
          </span>
        </div>
      )}

      {isOnline && pendingCount > 0 && !issyncing && (
        <button
          onClick={handleSync}
          className="bg-teal-600 text-white px-2 py-1 rounded text-xs hover:bg-teal-700 transition-colors"
        >
          Sync Now
        </button>
      )}
    </div>
  );
}