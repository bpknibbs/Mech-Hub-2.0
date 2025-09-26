import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './NotificationContext';

interface AutomationRule {
  id: string;
  name: string;
  type: 'predictive_maintenance' | 'auto_work_order' | 'stock_reorder' | 'escalation';
  enabled: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  lastTriggered?: string;
  triggerCount: number;
}

interface PredictiveAlert {
  id: string;
  assetId: string;
  assetName: string;
  alertType: 'wear_prediction' | 'failure_risk' | 'efficiency_decline' | 'overdue_maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  predictedDate: string;
  confidence: number;
  recommendations: string[];
  triggers: string[];
}

interface AutoWorkOrder {
  id: string;
  title: string;
  assetId: string;
  type: 'ppm' | 'inspection' | 'service';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate: string;
  generatedBy: 'automation';
  sourceRule: string;
}

interface StockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minimumLevel: number;
  reorderPoint: number;
  suggestedQuantity: number;
  supplier: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  autoReorderEnabled: boolean;
}

interface EscalationAlert {
  id: string;
  taskId: string;
  taskTitle: string;
  assignee: string;
  supervisor: string;
  daysOverdue: number;
  escalationLevel: 1 | 2 | 3;
  lastEscalated: string;
}

interface AutomationContextType {
  rules: AutomationRule[];
  predictiveAlerts: PredictiveAlert[];
  autoWorkOrders: AutoWorkOrder[];
  stockAlerts: StockAlert[];
  escalationAlerts: EscalationAlert[];
  addRule: (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => void;
  toggleRule: (id: string) => void;
  removeRule: (id: string) => void;
  runAutomationCycle: () => void;
  dismissAlert: (type: string, id: string) => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

const defaultRules: AutomationRule[] = [
  {
    id: 'pred-boiler-wear',
    name: 'Boiler Wear Prediction',
    type: 'predictive_maintenance',
    enabled: true,
    conditions: { assetType: 'boiler', ageThreshold: 5, efficiencyDrop: 0.05 },
    actions: { generateAlert: true, createTask: true, notifySupervisor: false },
    triggerCount: 0
  },
  {
    id: 'auto-ppm-weekly',
    name: 'Weekly PPM Generation',
    type: 'auto_work_order',
    enabled: true,
    conditions: { frequency: 'weekly', leadDays: 7 },
    actions: { createWorkOrder: true, assignToAvailable: true },
    triggerCount: 0
  },
  {
    id: 'stock-critical-parts',
    name: 'Critical Parts Auto-Reorder',
    type: 'stock_reorder',
    enabled: true,
    conditions: { category: 'critical', reorderPoint: 0.2 },
    actions: { autoReorder: true, notifyManager: true },
    triggerCount: 0
  },
  {
    id: 'task-escalation-3day',
    name: '3-Day Task Escalation',
    type: 'escalation',
    enabled: true,
    conditions: { overdueThreshold: 3, taskPriority: 'high' },
    actions: { notifySupervisor: true, escalationLevel: 1 },
    triggerCount: 0
  }
];

export function AutomationProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [autoWorkOrders, setAutoWorkOrders] = useState<AutoWorkOrder[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [escalationAlerts, setEscalationAlerts] = useState<EscalationAlert[]>([]);
  
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Run automation cycle every 5 minutes
    const interval = setInterval(runAutomationCycle, 5 * 60 * 1000);
    
    // Run initial cycle after 3 seconds
    setTimeout(runAutomationCycle, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const runAutomationCycle = () => {
    console.log('Running automation cycle...');
    
    rules.forEach(rule => {
      if (!rule.enabled) return;

      switch (rule.type) {
        case 'predictive_maintenance':
          runPredictiveMaintenanceEngine(rule);
          break;
        case 'auto_work_order':
          runWorkOrderGenerator(rule);
          break;
        case 'stock_reorder':
          runStockManagementSystem(rule);
          break;
        case 'escalation':
          runEscalationManager(rule);
          break;
      }
    });
  };

  const runPredictiveMaintenanceEngine = (rule: AutomationRule) => {
    // Mock predictive maintenance analysis
    const mockPredictiveAlerts: PredictiveAlert[] = [
      {
        id: 'pred-' + Date.now(),
        assetId: 'BLR-001',
        assetName: 'Main Building Boiler #1',
        alertType: 'efficiency_decline',
        severity: 'medium',
        predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.78,
        recommendations: [
          'Schedule heat exchanger cleaning',
          'Check combustion chamber',
          'Inspect burner efficiency'
        ],
        triggers: ['Efficiency dropped 6% over last month', 'Increased gas consumption']
      },
      {
        id: 'pred-' + (Date.now() + 1),
        assetId: 'FWP-001',
        assetName: 'Fresh Water Booster Pump',
        alertType: 'wear_prediction',
        severity: 'high',
        predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85,
        recommendations: [
          'Replace pump impeller',
          'Check bearing condition',
          'Service motor coupling'
        ],
        triggers: ['Vibration levels increasing', '8000+ operating hours']
      }
    ];

    // Only add new alerts if they don't already exist
    const newAlerts = mockPredictiveAlerts.filter(alert => 
      !predictiveAlerts.some(existing => existing.assetId === alert.assetId && existing.alertType === alert.alertType)
    );

    if (newAlerts.length > 0) {
      setPredictiveAlerts(prev => [...prev, ...newAlerts]);
      
      newAlerts.forEach(alert => {
        addNotification({
          title: 'Predictive Maintenance Alert',
          message: `${alert.assetName}: ${alert.alertType.replace('_', ' ')} predicted in ${Math.ceil((new Date(alert.predictedDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days`,
          type: alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'
        });
      });

      // Update rule trigger count
      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, triggerCount: r.triggerCount + newAlerts.length, lastTriggered: new Date().toISOString() } : r
      ));
    }
  };

  const runWorkOrderGenerator = (rule: AutomationRule) => {
    // Mock automatic work order generation
    const mockWorkOrders: AutoWorkOrder[] = [
      {
        id: 'auto-' + Date.now(),
        title: 'Weekly Boiler Inspection - BLR-002',
        assetId: 'BLR-002',
        type: 'inspection',
        priority: 'medium',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'automation',
        sourceRule: rule.id
      }
    ];

    // Check if similar work order already exists
    const newWorkOrders = mockWorkOrders.filter(wo => 
      !autoWorkOrders.some(existing => existing.assetId === wo.assetId && existing.type === wo.type)
    );

    if (newWorkOrders.length > 0 && Math.random() > 0.7) { // 30% chance to generate
      setAutoWorkOrders(prev => [...prev, ...newWorkOrders]);
      
      newWorkOrders.forEach(workOrder => {
        addNotification({
          title: 'Auto Work Order Generated',
          message: `${workOrder.title} scheduled for ${new Date(workOrder.scheduledDate).toLocaleDateString()}`,
          type: 'info'
        });
      });

      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, triggerCount: r.triggerCount + newWorkOrders.length, lastTriggered: new Date().toISOString() } : r
      ));
    }
  };

  const runStockManagementSystem = (rule: AutomationRule) => {
    // Mock stock management alerts
    const mockStockAlerts: StockAlert[] = [
      {
        id: 'stock-' + Date.now(),
        itemName: 'Boiler Gasket Set',
        currentStock: 2,
        minimumLevel: 5,
        reorderPoint: 3,
        suggestedQuantity: 20,
        supplier: 'HVAC Parts Ltd',
        urgency: 'high',
        autoReorderEnabled: true
      },
      {
        id: 'stock-' + (Date.now() + 1),
        itemName: 'Pump Bearing Kit',
        currentStock: 1,
        minimumLevel: 3,
        reorderPoint: 2,
        suggestedQuantity: 10,
        supplier: 'Mechanical Supplies Co',
        urgency: 'critical',
        autoReorderEnabled: false
      }
    ];

    const newStockAlerts = mockStockAlerts.filter(alert => 
      !stockAlerts.some(existing => existing.itemName === alert.itemName)
    );

    if (newStockAlerts.length > 0 && Math.random() > 0.8) { // 20% chance to generate
      setStockAlerts(prev => [...prev, ...newStockAlerts]);
      
      newStockAlerts.forEach(alert => {
        addNotification({
          title: 'Low Stock Alert',
          message: `${alert.itemName}: ${alert.currentStock} remaining (min: ${alert.minimumLevel})`,
          type: alert.urgency === 'critical' ? 'error' : 'warning'
        });

        if (alert.autoReorderEnabled) {
          addNotification({
            title: 'Auto Reorder Triggered',
            message: `Automatically reordering ${alert.suggestedQuantity}x ${alert.itemName}`,
            type: 'success'
          });
        }
      });

      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, triggerCount: r.triggerCount + newStockAlerts.length, lastTriggered: new Date().toISOString() } : r
      ));
    }
  };

  const runEscalationManager = (rule: AutomationRule) => {
    // Mock task escalation
    const mockEscalations: EscalationAlert[] = [
      {
        id: 'esc-' + Date.now(),
        taskId: 'PPM-001',
        taskTitle: 'Boiler Annual Service - BLR-001',
        assignee: 'James Wilson',
        supervisor: 'Emma Thompson',
        daysOverdue: 3,
        escalationLevel: 1,
        lastEscalated: new Date().toISOString()
      }
    ];

    const newEscalations = mockEscalations.filter(esc => 
      !escalationAlerts.some(existing => existing.taskId === esc.taskId)
    );

    if (newEscalations.length > 0 && Math.random() > 0.9) { // 10% chance to generate
      setEscalationAlerts(prev => [...prev, ...newEscalations]);
      
      newEscalations.forEach(escalation => {
        addNotification({
          title: 'Task Escalation Alert',
          message: `Task "${escalation.taskTitle}" is ${escalation.daysOverdue} days overdue. Supervisor ${escalation.supervisor} notified.`,
          type: 'warning'
        });
      });

      setRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, triggerCount: r.triggerCount + newEscalations.length, lastTriggered: new Date().toISOString() } : r
      ));
    }
  };

  const addRule = (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: Date.now().toString(),
      triggerCount: 0
    };
    setRules(prev => [...prev, newRule]);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const dismissAlert = (type: string, id: string) => {
    switch (type) {
      case 'predictive':
        setPredictiveAlerts(prev => prev.filter(alert => alert.id !== id));
        break;
      case 'workorder':
        setAutoWorkOrders(prev => prev.filter(order => order.id !== id));
        break;
      case 'stock':
        setStockAlerts(prev => prev.filter(alert => alert.id !== id));
        break;
      case 'escalation':
        setEscalationAlerts(prev => prev.filter(alert => alert.id !== id));
        break;
    }
  };

  const value = {
    rules,
    predictiveAlerts,
    autoWorkOrders,
    stockAlerts,
    escalationAlerts,
    addRule,
    toggleRule,
    removeRule,
    runAutomationCycle,
    dismissAlert
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
}