import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import KPIWidget from '../components/Dashboard/KPIWidget';
import ChartWidget from '../components/Dashboard/ChartWidget';
import AlertsWidget from '../components/Dashboard/AlertsWidget';
import DashboardCustomizer from '../components/Dashboard/DashboardCustomizer';
import AutomationDashboard from '../components/Automation/AutomationDashboard';
import { useDashboard } from '../contexts/DashboardContext';
import { useAutomation } from '../contexts/AutomationContext';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalPlantRooms: number;
  totalAssets: number;
  pendingTasks: number;
  overdueTasks: number;
  teamMembers: number;
  completedTasksToday: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { widgets, alerts } = useDashboard();
  const { predictiveAlerts, stockAlerts, escalationAlerts } = useAutomation();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlantRooms: 0,
    totalAssets: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    teamMembers: 0,
    completedTasksToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check if we're using dummy Supabase setup
      if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        // Return mock data for demo purposes
        setStats({
          totalPlantRooms: 12,
          totalAssets: 247,
          pendingTasks: 18,
          overdueTasks: 8,
          teamMembers: 12,
          completedTasksToday: 15,
        });
        setLoading(false);
        return;
      }

      const [
        { count: plantRoomsCount },
        { count: assetsCount },
        { count: pendingTasksCount },
        { count: overdueTasksCount },
        { count: teamCount },
        { count: completedTodayCount },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('type', 'Plant Room'),
        supabase.from('assets').select('*', { count: 'exact', head: true }),
        supabase.from('work_orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('work_orders').select('*', { count: 'exact', head: true }).eq('status', 'Overdue'),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('work_orders').select('*', { count: 'exact', head: true })
          .eq('status', 'Completed')
          .gte('completed_at', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalPlantRooms: plantRoomsCount || 0,
        totalAssets: assetsCount || 0,
        pendingTasks: pendingTasksCount || 0,
        overdueTasks: overdueTasksCount || 0,
        teamMembers: teamCount || 0,
        completedTasksToday: completedTodayCount || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const systemHealthData = [
    { name: 'Boilers', value: 18, color: '#ef4444' },
    { name: 'Pumps', value: 45, color: '#3b82f6' },
    { name: 'Vessels', value: 32, color: '#10b981' },
    { name: 'Valves', value: 67, color: '#f59e0b' },
    { name: 'Tanks', value: 28, color: '#8b5cf6' },
  ];

  const maintenanceTrendsData = [
    { name: 'Jan', value: 45, color: '#0d9488' },
    { name: 'Feb', value: 52, color: '#0d9488' },
    { name: 'Mar', value: 38, color: '#0d9488' },
    { name: 'Apr', value: 61, color: '#0d9488' },
    { name: 'May', value: 55, color: '#0d9488' },
    { name: 'Jun', value: 67, color: '#0d9488' },
  ];

  const handleChartClick = (dataPoint: any, chartType: string) => {
    console.log(`Clicked on ${dataPoint.name} in ${chartType} chart`);
    // Navigate to relevant page based on the clicked data
    if (chartType === 'system-health') {
      if (dataPoint.name === 'Boilers') navigate('/assets/boilers');
      if (dataPoint.name === 'Pumps') navigate('/assets/fresh-water-booster-pumps');
      if (dataPoint.name === 'Vessels') navigate('/assets/potable-vessels');
    } else if (chartType === 'maintenance-trends') {
      navigate('/work-orders/ppm');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-teal-800">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-dark-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-dark-600 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-800">Dashboard</h1>
          <p className="mt-2 text-teal-600">
            Welcome to Mech Hub - your comprehensive mechanical management system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCustomizer(true)}
          className="flex items-center space-x-2"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span>Customize</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAutomation(true)}
          className="flex items-center space-x-2"
        >
          <span className="text-lg">🤖</span>
          <span>Automation</span>
          {(predictiveAlerts.length + stockAlerts.length + escalationAlerts.length) > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
              {predictiveAlerts.length + stockAlerts.length + escalationAlerts.length}
            </span>
          )}
        </Button>
      </div>

      {/* KPI Widgets Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPIWidget
          title="Total Assets"
          value={stats.totalAssets}
          previousValue={235}
          icon={CogIcon}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
          trend="up"
          trendValue={5.1}
          onClick={() => navigate('/assets/boilers')}
        />
        <KPIWidget
          title="Active Tasks"
          value={stats.pendingTasks}
          previousValue={22}
          icon={ClipboardDocumentListIcon}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend="down"
          trendValue={-18.2}
          onClick={() => navigate('/work-orders/ppm')}
        />
        <KPIWidget
          title="Team Utilization"
          value="87"
          unit="%"
          previousValue={82}
          icon={UserGroupIcon}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend="up"
          trendValue={6.1}
          onClick={() => navigate('/teams/dlo')}
        />
        <KPIWidget
          title="Overdue Tasks"
          value={stats.overdueTasks}
          previousValue={12}
          icon={ExclamationTriangleIcon}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          trend="down"
          trendValue={-33.3}
          onClick={() => navigate('/work-orders/reactive-repairs')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Large Chart Widget */}
        <div className="lg:col-span-2">
          <ChartWidget
            title="Asset Distribution by Type"
            data={systemHealthData}
            type="pie"
            onDataPointClick={(dataPoint) => handleChartClick(dataPoint, 'system-health')}
            className="h-full"
          />
        </div>

        {/* Alerts Widget */}
        <AlertsWidget />
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartWidget
          title="Maintenance Tasks Completed (Monthly)"
          data={maintenanceTrendsData}
          type="line"
          onDataPointClick={(dataPoint) => handleChartClick(dataPoint, 'maintenance-trends')}
        />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-teal-800">System Status</h3>
            <ChartBarIcon className="h-5 w-5 text-teal-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-600">Critical Systems</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                All Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-600">Database Connection</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-600">Last System Check</span>
              <span className="text-sm text-teal-800">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-600">Uptime</span>
              <span className="text-sm text-teal-800">99.8%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-teal-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-teal-800">Task completed: Boiler BLR-001 annual service</p>
              <p className="text-xs text-teal-500">James Wilson • 15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-teal-800">LGSR form submitted for Community Hall</p>
              <p className="text-xs text-teal-500">Sarah Mitchell • 1 hour ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-teal-800">New work order: Pump maintenance required</p>
              <p className="text-xs text-teal-500">System • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-teal-800">Alert: Low stock on boiler filters</p>
              <p className="text-xs text-teal-500">Inventory System • 3 hours ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dashboard Customizer Modal */}
      <DashboardCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />

      {/* Automation Dashboard Modal */}
      <AutomationDashboard
        isOpen={showAutomation}
        onClose={() => setShowAutomation(false)}
      />
    </div>
  );
}