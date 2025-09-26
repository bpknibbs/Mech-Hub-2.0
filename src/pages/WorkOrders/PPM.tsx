import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { PlusIcon, ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import AdvancedFilters from '../../components/Search/AdvancedFilters';
import MaintenanceScheduler from '../../components/Assets/MaintenanceScheduler';
import { useAutomation } from '../../contexts/AutomationContext';
import BulkOperations, { useBulkSelection } from '../../components/DataOperations/BulkOperations';
import ExportButton from '../../components/DataOperations/ExportButton';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function PPM() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showScheduler, setShowScheduler] = useState(false);
  const { autoWorkOrders, escalationAlerts } = useAutomation();
  const { selectedIds, isSelected, toggleSelection } = useBulkSelection('tasks');
  const [ppmTasks, setPpmTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPpmTasks = async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('work_order_type', 'PPM');

      if (error) {
        console.error('Error fetching PPM tasks:', error.message);
      } else {
        setPpmTasks(data);
      }
      setLoading(false);
    };

    fetchPpmTasks();
  }, []);

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'status' as const,
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
      ]
    },
    {
      key: 'frequency',
      label: 'Frequency',
      type: 'select' as const,
      options: [
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Quarterly', label: 'Quarterly' },
        { value: 'Semi-Annual', label: 'Semi-Annual' },
        { value: 'Annual', label: 'Annual' },
      ]
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      type: 'text' as const,
      placeholder: 'Engineer name or role'
    },
    {
      key: 'dueBefore',
      label: 'Due Before',
      type: 'date' as const,
    }
  ];

  const filteredTasks = useMemo(() => {
    return ppmTasks.filter(task => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'status':
            return task.status.toLowerCase().replace(' ', '-') === value.toLowerCase();
          case 'priority':
            return task.priority === value;
          case 'frequency':
            return task.frequency === value;
          case 'assignedTo':
            return task.assignedTo.toLowerCase().includes(value.toLowerCase());
          case 'dueBefore':
            return new Date(task.nextDue) <= new Date(value);
          default:
            return true;
        }
      });
    });
  }, [filters, ppmTasks]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PPM (Planned Preventive Maintenance)</h1>
          <p className="mt-2 text-gray-600">
            Manage scheduled maintenance tasks and preventive maintenance programs
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create PPM Task
        </Button>
        <ExportButton 
          category="tasks" 
          items={filteredTasks}
          selectedItems={selectedIds}
        />
        <Button variant="outline" onClick={() => setShowScheduler(true)}>
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Scheduler
        </Button>
      </div>

      {/* Bulk Operations */}
      <BulkOperations 
        category="tasks" 
        items={filteredTasks}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        onFiltersChange={setFilters}
        currentFilters={filters}
        availableFilters={filterConfig}
        category="work-orders"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.asset}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frequency:</span>
                <span className="text-gray-900">{task.frequency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Due:</span>
                <span className={`${
                  new Date(task.nextDue) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'
                }`}>
                  {new Date(task.nextDue).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assigned To:</span>
                <span className="text-gray-900">{task.assignedTo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">{task.estimatedDuration}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
              <Button size="sm">
                Start Task
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">PPM Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total PPM Tasks</span>
              <span className="text-2xl font-bold text-gray-900">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due This Month</span>
              <span className="text-lg font-semibold text-orange-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="text-lg font-semibold text-red-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed (Month)</span>
              <span className="text-lg font-semibold text-green-600">12</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Critical Tasks</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="font-medium text-red-900">LGSR Inspection Due</p>
              <p className="text-sm text-red-600">May 1, 2024 - Critical</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium text-orange-900">Boiler Service Due</p>
              <p className="text-sm text-orange-600">April 15, 2024 - High</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Frequency Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily</span>
              <span className="text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly</span>
              <span className="text-gray-900">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly</span>
              <span className="text-gray-900">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quarterly</span>
              <span className="text-gray-900">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual</span>
              <span className="text-gray-900">3</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Maintenance Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative max-w-6xl mx-auto">
            <MaintenanceScheduler />
            <Button 
              className="mt-4 mx-auto block"
              onClick={() => setShowScheduler(false)}
            >
              Close Scheduler
            </Button>
          </div>
        </div>
      )}
      {/* Automation Alerts */}
      {(autoWorkOrders.length > 0 || escalationAlerts.length > 0) && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Automation Alerts
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {autoWorkOrders.length + escalationAlerts.length}
            </span>
          </h3>
          <div className="space-y-3">
            {autoWorkOrders.map((order) => (
              <div key={order.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">🤖 Auto-Generated Work Order</p>
                    <p className="text-sm text-green-700">{order.title}</p>
                    <p className="text-xs text-green-600">
                      Scheduled: {new Date(order.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm">Assign</Button>
                </div>
              </div>
            ))}
            {escalationAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900">⚠️ Task Escalation Alert</p>
                    <p className="text-sm text-red-700">{alert.taskTitle}</p>
                    <p className="text-xs text-red-600">
                      {alert.daysOverdue} days overdue • Supervisor {alert.supervisor} notified
                    </p>
                  </div>
                  <Button size="sm" variant="danger">Urgent</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}