import React, { useEffect, useState } from 'react';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  CogIcon,
  PaperAirplaneIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';
import ComplianceDashboard from '../components/Reporting/ComplianceDashboard';
import CustomReportBuilder from '../components/Reporting/CustomReportBuilder';
import ReportScheduler from '../components/Reporting/ReportScheduler';
import BenchmarkComparisons from '../components/Reporting/BenchmarkComparisons';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface ReportData {
  totalAssets: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  lgsr: {
    completed: number;
    pending: number;
    overdue: number;
  };
  tasksByType: Record<string, number>;
  assetsByType: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    completed: number;
    overdue: number;
  }>;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    totalAssets: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    lgsr: { completed: 0, pending: 0, overdue: 0 },
    tasksByType: {},
    assetsByType: {},
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'benchmarks' | 'custom'>('overview');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const [
        assetsResponse,
        tasksResponse,
        lgsrResponse
      ] = await Promise.all([
        supabase.from('assets').select('asset_type'),
        supabase.from('work_orders').select('status, work_order_type, created_at, completed_at'),
        supabase
          .from('form_submissions')
          .select(`
            status, 
            created_at, 
            template:form_templates(category)
          `)
          .in('template.category', ['LGSR'])
      ]);

      // Process assets data
      const assetsByType: Record<string, number> = {};
      if (assetsResponse.data) {
        assetsResponse.data.forEach(asset => {
          assetsByType[asset.asset_type] = (assetsByType[asset.asset_type] || 0) + 1;
        });
      }

      // Process tasks data
      const tasksByType: Record<string, number> = {};
      let completedTasks = 0;
      let overdueTasks = 0;
      
      if (tasksResponse.data) {
        tasksResponse.data.forEach(task => {
          tasksByType[task.work_order_type] = (tasksByType[task.work_order_type] || 0) + 1;
          if (task.status === 'Completed') completedTasks++;
          if (task.status === 'Overdue') overdueTasks++;
        });
      }

      // Process LGSR data
      let lgsrCompleted = 0;
      let lgsrPending = 0;
      let lgsrOverdue = 0;
      
      if (lgsrResponse.data) {
        lgsrResponse.data.forEach(submission => {
          if (submission.status === 'approved') lgsrCompleted++;
          else if (submission.status === 'submitted') lgsrPending++;
          else lgsrOverdue++;
        });
      }

      // Generate monthly trends (simplified)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        
        monthlyTrends.push({
          month: monthName,
          // These are mock for now, as fetching and calculating monthly counts can be complex
          completed: Math.floor(Math.random() * 20) + 10,
          overdue: Math.floor(Math.random() * 5) + 1
        });
      }

      setReportData({
        totalAssets: assetsResponse.data?.length || 0,
        totalTasks: tasksResponse.data?.length || 0,
        completedTasks,
        overdueTasks,
        lgsr: {
          completed: lgsrCompleted,
          pending: lgsrPending,
          overdue: lgsrOverdue
        },
        tasksByType,
        assetsByType,
        monthlyTrends
      });

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    // Simulate PDF generation
    const reportContent = `
      <h1>Mech Hub - Mechanical Management Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      
      <h2>Summary</h2>
      <ul>
        <li>Total Assets: ${reportData.totalAssets}</li>
        <li>Total Tasks: ${reportData.totalTasks}</li>
        <li>Completed Tasks: ${reportData.completedTasks}</li>
        <li>Overdue Tasks: ${reportData.overdueTasks}</li>
      </ul>
      
      <h2>LGSR Compliance</h2>
      <ul>
        <li>Completed: ${reportData.lgsr.completed}</li>
        <li>Pending: ${reportData.lgsr.pending}</li>
        <li>Overdue: ${reportData.lgsr.overdue}</li>
      </ul>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Plant Room Management Report</title>
            <title>Mechanical Management Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              h2 { color: #374151; margin-top: 30px; }
              ul { line-height: 1.6; }
              li { margin-bottom: 5px; }
            </style>
          </head>
          <body>
            ${reportContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSaveReport = async (report: any) => {
    const { error } = await supabase
      .from('custom_reports')
      .insert([report]);

    if (error) {
      console.error('Error saving custom report:', error);
    } else {
      console.log('Custom report saved:', report);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const completionRate = reportData.totalTasks > 0 
    ? ((reportData.completedTasks / reportData.totalTasks) * 100).toFixed(1)
    : '0';

  const lgsrComplianceRate = (reportData.lgsr.completed + reportData.lgsr.pending + reportData.lgsr.overdue) > 0
    ? ((reportData.lgsr.completed / (reportData.lgsr.completed + reportData.lgsr.pending + reportData.lgsr.overdue)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive insights into maintenance performance and compliance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowReportBuilder(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Build Report
          </Button>
          <Button variant="outline" onClick={() => setShowScheduler(true)}>
            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={generatePDFReport}>
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Performance Overview', icon: ChartBarIcon },
            { key: 'compliance', label: 'Compliance Dashboard', icon: ShieldCheckIcon },
            { key: 'benchmarks', label: 'Benchmark Analysis', icon: TrophyIcon },
            { key: 'custom', label: 'Custom Reports', icon: CogIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Date Range Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalAssets}</p>
                  <p className="text-sm text-green-600">Active in system</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-green-50">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Task Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                  <p className="text-sm text-gray-500">{reportData.completedTasks} of {reportData.totalTasks} tasks</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-red-50">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-red-600">{reportData.overdueTasks}</p>
                  <p className="text-sm text-gray-500">Require immediate attention</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-purple-50">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">LGSR Compliance</p>
                  <p className="text-2xl font-bold text-gray-900">{lgsrComplianceRate}%</p>
                  <p className="text-sm text-gray-500">{reportData.lgsr.completed} completed</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts and Detailed Reports */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Task Types Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Type</h3>
              <div className="space-y-4">
                {Object.entries(reportData.tasksByType).map(([type, count]) => {
                  const percentage = reportData.totalTasks > 0 ? (count / reportData.totalTasks) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{type}</span>
                        <span className="text-gray-900">{count} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Asset Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assets by Type</h3>
              <div className="space-y-4">
                {Object.entries(reportData.assetsByType).map(([type, count]) => {
                  const percentage = reportData.totalAssets > 0 ? (count / reportData.totalAssets) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{type}</span>
                        <span className="text-gray-900">{count} assets</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'compliance' && <ComplianceDashboard />}
      
      {activeTab === 'benchmarks' && <BenchmarkComparisons />}
      
      {activeTab === 'custom' && (
        <Card className="p-12 text-center">
          <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-4">Custom Report Templates</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create custom reports with drag-and-drop components. Build exactly what you need for stakeholders and regulatory compliance.
          </p>
          <div className="space-y-4">
            <Button onClick={() => setShowReportBuilder(true)} className="mx-2">
              <PlusIcon className="h-5 w-5 mr-2" />
              Build Custom Report
            </Button>
            <Button variant="outline" onClick={() => setShowScheduler(true)} className="mx-2">
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              Schedule Reports
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 max-w-2xl mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Compliance Reports</h4>
              <p className="text-sm text-blue-700">LGSR, certificates, safety records</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Performance Reports</h4>
              <p className="text-sm text-green-700">KPIs, trends, team metrics</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Custom Analytics</h4>
              <p className="text-sm text-purple-700">Tailored insights and data</p>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <CustomReportBuilder
        isOpen={showReportBuilder}
        onClose={() => setShowReportBuilder(false)}
        onSave={handleSaveReport}
      />

      <ReportScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
      />

      {/* Legacy content - keeping for overview tab */}
      {activeTab === 'overview' && (
        <>
          {/* LGSR Compliance Detail */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">LGSR Compliance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.lgsr.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-900">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportData.lgsr.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">⏳</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-900">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{reportData.lgsr.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">⚠</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">6-Month Task Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Month</span>
                <span>Completed / Overdue</span>
              </div>
              {reportData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{trend.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{trend.completed}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{trend.overdue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportData.totalTasks > 0 ? Math.round((reportData.completedTasks / reportData.totalTasks) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600">Overall task completion rate shows {reportData.completedTasks > reportData.overdueTasks ? 'strong' : 'needs improvement'} performance</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportData.lgsr.completed}
                </div>
                <p className="text-sm text-gray-600">LGSR forms completed ensuring regulatory compliance</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {Object.keys(reportData.assetsByType).length}
                </div>
                <p className="text-sm text-gray-600">Different asset types being maintained across facilities</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}