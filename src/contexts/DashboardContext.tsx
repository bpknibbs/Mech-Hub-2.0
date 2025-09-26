import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'alerts' | 'recent-activity' | 'team-status' | 'asset-health';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  enabled: boolean;
  data?: any;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  category: 'maintenance' | 'stock' | 'safety' | 'schedule';
  actionUrl?: string;
}

interface DashboardContextType {
  widgets: Widget[];
  alerts: Alert[];
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  toggleWidget: (id: string) => void;
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  removeWidget: (id: string) => void;
  markAlertAsRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  loadDashboardData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const defaultWidgets: Widget[] = [
  {
    id: 'total-assets',
    type: 'kpi',
    title: 'Total Assets',
    size: 'small',
    position: { x: 0, y: 0 },
    enabled: true,
  },
  {
    id: 'active-tasks',
    type: 'kpi',
    title: 'Active Tasks',
    size: 'small',
    position: { x: 1, y: 0 },
    enabled: true,
  },
  {
    id: 'team-utilization',
    type: 'kpi',
    title: 'Team Utilization',
    size: 'small',
    position: { x: 2, y: 0 },
    enabled: true,
  },
  {
    id: 'system-health',
    type: 'chart',
    title: 'System Health Overview',
    size: 'large',
    position: { x: 0, y: 1 },
    enabled: true,
  },
  {
    id: 'maintenance-trends',
    type: 'chart',
    title: 'Maintenance Trends',
    size: 'medium',
    position: { x: 2, y: 1 },
    enabled: true,
  },
  {
    id: 'critical-alerts',
    type: 'alerts',
    title: 'Critical Alerts',
    size: 'medium',
    position: { x: 0, y: 2 },
    enabled: true,
  },
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: 'Recent Activity',
    size: 'medium',
    position: { x: 1, y: 2 },
    enabled: true,
  },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Simulate real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    // Mock real-time data - in production, this would fetch from your API
    const mockAlerts: Alert[] = [
      {
        id: '1',
        title: 'PPM Task Overdue',
        message: 'Boiler BLR-001 annual service is 3 days overdue',
        type: 'critical',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        category: 'maintenance',
        actionUrl: '/work-orders/ppm'
      },
      {
        id: '2',
        title: 'Low Stock Alert',
        message: 'Boiler filters down to 3 units (minimum: 10)',
        type: 'warning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        category: 'stock',
        actionUrl: '/parts-stock'
      },
      {
        id: '3',
        title: 'Equipment Malfunction',
        message: 'Fresh water pump FWP-002 showing unusual vibrations',
        type: 'warning',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        read: false,
        category: 'maintenance',
        actionUrl: '/assets/fresh-water-booster-pumps'
      },
      {
        id: '4',
        title: 'LGSR Due Soon',
        message: 'Annual gas safety record expires in 30 days',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        category: 'safety',
        actionUrl: '/forms'
      }
    ];
    
    setAlerts(mockAlerts);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  };

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    ));
  };

  const addWidget = (widget: Omit<Widget, 'id'>) => {
    const newWidget: Widget = {
      ...widget,
      id: Date.now().toString(),
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const markAlertAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const value = {
    widgets,
    alerts,
    updateWidget,
    toggleWidget,
    addWidget,
    removeWidget,
    markAlertAsRead,
    dismissAlert,
    loadDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}