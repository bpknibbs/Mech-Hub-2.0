import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';

interface Certificate {
  id: string;
  name: string;
  type: 'LGSR' | 'PAT' | 'Fire Safety' | 'Lift Safety' | 'Water Hygiene' | 'Insurance' | 'Other';
  asset_id?: string;
  asset_name?: string;
  issue_date: string;
  expiry_date: string;
  issued_by: string;
  certificate_number: string;
  status: 'valid' | 'expiring' | 'expired' | 'renewal_required';
  file_url?: string;
  location: string;
}

interface ComplianceMetric {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
  target: number;
  benchmark: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on_target' | 'below_target' | 'exceeds_target';
  last_updated: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  type: 'compliance' | 'maintenance' | 'performance' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  components: string[];
  next_run: string;
  last_run?: string;
  active: boolean;
  template_id?: string;
}

interface ComplianceContextType {
  certificates: Certificate[];
  complianceMetrics: ComplianceMetric[];
  scheduledReports: ScheduledReport[];
  expiringCertificates: Certificate[];
  expiredCertificates: Certificate[];
  loadComplianceData: () => void;
  addCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  updateCertificate: (id: string, updates: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  scheduleReport: (report: Omit<ScheduledReport, 'id' | 'next_run' | 'last_run'>) => void;
  updateScheduledReport: (id: string, updates: Partial<ScheduledReport>) => void;
  deleteScheduledReport: (id: string) => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export function ComplianceProvider({ children }: { children: React.ReactNode }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadComplianceData();
    
    // Check for expiring certificates daily
    const interval = setInterval(checkExpiringCertificates, 24 * 60 * 60 * 1000);
    
    // Initial check after 5 seconds
    setTimeout(checkExpiringCertificates, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = () => {
    // Mock compliance data - in production, this would come from API
    const mockCertificates: Certificate[] = [
      {
        id: '1',
        name: 'Annual Gas Safety Record - Main Building',
        type: 'LGSR',
        asset_id: 'BLR-001',
        asset_name: 'Main Building Boiler #1',
        issue_date: '2024-01-15',
        expiry_date: '2025-01-15',
        issued_by: 'ABC Gas Services Ltd',
        certificate_number: 'LGSR-2024-001',
        status: 'valid',
        location: 'Block A Plant Room'
      },
      {
        id: '2',
        name: 'Fire Safety Certificate - Community Hall',
        type: 'Fire Safety',
        asset_name: 'Community Hall Fire Systems',
        issue_date: '2023-11-01',
        expiry_date: '2024-05-01',
        issued_by: 'Fire Safety Solutions',
        certificate_number: 'FSC-2023-045',
        status: 'expiring',
        location: 'Community Hall'
      },
      {
        id: '3',
        name: 'Water Hygiene Certificate',
        type: 'Water Hygiene',
        asset_id: 'WT-001',
        asset_name: 'Main Cold Water Tank',
        issue_date: '2023-12-01',
        expiry_date: '2024-04-01',
        issued_by: 'Aqua Safe Testing',
        certificate_number: 'WH-2023-089',
        status: 'expiring',
        location: 'Roof Level Tank Room'
      },
      {
        id: '4',
        name: 'PAT Testing Certificate',
        type: 'PAT',
        asset_name: 'Portable Electrical Equipment',
        issue_date: '2024-02-01',
        expiry_date: '2025-02-01',
        issued_by: 'Electrical Safety Co',
        certificate_number: 'PAT-2024-012',
        status: 'valid',
        location: 'Multiple Locations'
      }
    ];

    const mockMetrics: ComplianceMetric[] = [
      {
        id: '1',
        category: 'Maintenance Performance',
        metric: 'PPM Completion Rate',
        value: 94,
        unit: '%',
        target: 95,
        benchmark: 88,
        trend: 'up',
        status: 'below_target',
        last_updated: new Date().toISOString()
      },
      {
        id: '2',
        category: 'Response Times',
        metric: 'Emergency Response Time',
        value: 18,
        unit: 'minutes',
        target: 30,
        benchmark: 45,
        trend: 'down',
        status: 'exceeds_target',
        last_updated: new Date().toISOString()
      },
      {
        id: '3',
        category: 'Asset Reliability',
        metric: 'Unplanned Downtime',
        value: 2.3,
        unit: '%',
        target: 5,
        benchmark: 8.2,
        trend: 'stable',
        status: 'exceeds_target',
        last_updated: new Date().toISOString()
      },
      {
        id: '4',
        category: 'Cost Management',
        metric: 'Maintenance Cost per Asset',
        value: 1250,
        unit: '£',
        target: 1500,
        benchmark: 1800,
        trend: 'down',
        status: 'exceeds_target',
        last_updated: new Date().toISOString()
      }
    ];

    const mockScheduledReports: ScheduledReport[] = [
      {
        id: '1',
        name: 'Weekly Compliance Summary',
        type: 'compliance',
        frequency: 'weekly',
        recipients: ['manager@company.com', 'compliance@company.com'],
        components: ['certificates', 'expiring_items', 'task_summary'],
        next_run: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        last_run: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      },
      {
        id: '2',
        name: 'Monthly Performance Report',
        type: 'performance',
        frequency: 'monthly',
        recipients: ['director@company.com'],
        components: ['kpi_metrics', 'benchmarks', 'trends'],
        next_run: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      }
    ];

    setCertificates(mockCertificates);
    setComplianceMetrics(mockMetrics);
    setScheduledReports(mockScheduledReports);
  };

  const checkExpiringCertificates = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    certificates.forEach(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysToExpiry <= 0 && cert.status !== 'expired') {
        // Certificate has expired
        setCertificates(prev => prev.map(c => 
          c.id === cert.id ? { ...c, status: 'expired' } : c
        ));
        
        addNotification({
          title: 'Certificate Expired',
          message: `${cert.name} has expired and requires immediate renewal`,
          type: 'error'
        });
      } else if (daysToExpiry <= 30 && cert.status !== 'expiring' && cert.status !== 'expired') {
        // Certificate is expiring within 30 days
        setCertificates(prev => prev.map(c => 
          c.id === cert.id ? { ...c, status: 'expiring' } : c
        ));
        
        addNotification({
          title: 'Certificate Expiring Soon',
          message: `${cert.name} expires in ${daysToExpiry} days`,
          type: 'warning'
        });
      }
    });
  };

  const expiringCertificates = certificates.filter(cert => cert.status === 'expiring');
  const expiredCertificates = certificates.filter(cert => cert.status === 'expired');

  const addCertificate = (certificate: Omit<Certificate, 'id'>) => {
    const newCertificate: Certificate = {
      ...certificate,
      id: Date.now().toString()
    };
    setCertificates(prev => [...prev, newCertificate]);
  };

  const updateCertificate = (id: string, updates: Partial<Certificate>) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === id ? { ...cert, ...updates } : cert
    ));
  };

  const deleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
  };

  const scheduleReport = (report: Omit<ScheduledReport, 'id' | 'next_run' | 'last_run'>) => {
    const nextRun = new Date();
    
    switch (report.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
    }

    const newReport: ScheduledReport = {
      ...report,
      id: Date.now().toString(),
      next_run: nextRun.toISOString()
    };
    
    setScheduledReports(prev => [...prev, newReport]);
    
    addNotification({
      title: 'Report Scheduled',
      message: `${report.name} has been scheduled for ${report.frequency} delivery`,
      type: 'success'
    });
  };

  const updateScheduledReport = (id: string, updates: Partial<ScheduledReport>) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === id ? { ...report, ...updates } : report
    ));
  };

  const deleteScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id));
  };

  const value = {
    certificates,
    complianceMetrics,
    scheduledReports,
    expiringCertificates,
    expiredCertificates,
    loadComplianceData,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    scheduleReport,
    updateScheduledReport,
    deleteScheduledReport,
  };

  return (
    <ComplianceContext.Provider value={value}>
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
}