import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface ScheduledTask {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  type: 'ppm' | 'inspection' | 'service' | 'repair';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface MaintenanceSchedulerProps {
  className?: string;
}

export default function MaintenanceScheduler({ className = '' }: MaintenanceSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  // Mock scheduled tasks - in production, this would come from API
  const scheduledTasks: ScheduledTask[] = [
    {
      id: '1',
      title: 'Boiler Annual Service',
      assetId: 'BLR-001',
      assetName: 'Main Building Boiler #1',
      type: 'ppm',
      priority: 'high',
      assignee: 'James Wilson',
      startTime: '09:00',
      endTime: '13:00',
      date: '2024-03-18',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Pump Quarterly Check',
      assetId: 'FWP-001',
      assetName: 'Fresh Water Booster Pump',
      type: 'inspection',
      priority: 'medium',
      assignee: 'Sarah Mitchell',
      startTime: '10:00',
      endTime: '12:00',
      date: '2024-03-19',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'LGSR Safety Inspection',
      assetId: 'BLR-002',
      assetName: 'Main Building Boiler #2',
      type: 'inspection',
      priority: 'critical',
      assignee: 'Michael Chen',
      startTime: '08:00',
      endTime: '17:00',
      date: '2024-03-20',
      status: 'scheduled'
    },
    {
      id: '4',
      title: 'Water Tank Cleaning',
      assetId: 'WT-001',
      assetName: 'Main Cold Water Tank',
      type: 'service',
      priority: 'medium',
      assignee: 'Emma Thompson',
      startTime: '07:00',
      endTime: '15:00',
      date: '2024-03-21',
      status: 'in-progress'
    }
  ];

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'ppm':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'inspection':
        return 'bg-green-500 border-green-600 text-white';
      case 'service':
        return 'bg-purple-500 border-purple-600 text-white';
      case 'repair':
        return 'bg-red-500 border-red-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledTasks.filter(task => task.date === dateStr);
  };

  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-teal-800">Maintenance Scheduler</h3>
          <p className="text-sm text-teal-600">Visual planning for PPM and maintenance tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-teal-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'week' ? 'bg-teal-600 text-white' : 'text-teal-600'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-teal-600 text-white' : 'text-teal-600'}`}
            >
              Month
            </button>
          </div>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <h4 className="text-lg font-medium text-teal-800">
          {currentDate.toLocaleDateString('en-GB', { 
            month: 'long', 
            year: 'numeric',
            day: 'numeric'
          })} - Week View
        </h4>
        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-teal-700 pb-2 border-b border-teal-200">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const tasksForDay = getTasksForDate(day);

          return (
            <div
              key={index}
              className={`min-h-32 p-2 border rounded-lg ${
                isToday ? 'bg-teal-100 border-teal-300' : 'bg-teal-50 border-teal-200'
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-teal-800' : 'text-teal-700'}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {tasksForDay.map((task) => (
                  <div
                    key={task.id}
                    className={`p-1 text-xs rounded border cursor-pointer hover:opacity-80 transition-opacity ${getTaskTypeColor(task.type)}`}
                    onClick={() => setSelectedTask(task)}
                    title={`${task.title} - ${task.assignee}`}
                  >
                    <div className="truncate font-medium">{task.title}</div>
                    <div className="truncate opacity-90">{task.startTime} - {task.endTime}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {scheduledTasks.filter(t => t.type === 'ppm').length}
          </div>
          <div className="text-sm text-blue-600">PPM Tasks</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {scheduledTasks.filter(t => t.type === 'inspection').length}
          </div>
          <div className="text-sm text-green-600">Inspections</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">
            {scheduledTasks.filter(t => t.type === 'service').length}
          </div>
          <div className="text-sm text-purple-600">Services</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">
            {scheduledTasks.filter(t => t.priority === 'critical').length}
          </div>
          <div className="text-sm text-red-600">Critical Priority</div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
        <h4 className="text-sm font-medium text-teal-800 mb-2">Task Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-teal-700">PPM</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-teal-700">Inspection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-teal-700">Service</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-teal-700">Repair</span>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-teal-800">Task Details</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-teal-800">{selectedTask.title}</h4>
                <p className="text-sm text-teal-600">{selectedTask.assetName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-teal-600">Date</p>
                  <p className="font-medium text-teal-800">
                    {new Date(selectedTask.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-teal-600">Time</p>
                  <p className="font-medium text-teal-800">
                    {selectedTask.startTime} - {selectedTask.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(selectedTask.type)}`}>
                  {selectedTask.type.toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityBadge(selectedTask.priority)}`}>
                  {selectedTask.priority.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-sm text-teal-600">Assigned to</p>
                <p className="font-medium text-teal-800">{selectedTask.assignee}</p>
              </div>

              <div className="pt-4 border-t border-teal-200">
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setSelectedTask(null)} className="flex-1">
                    Close
                  </Button>
                  <Button className="flex-1">
                    Edit Task
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}