import React, { useState, useEffect } from 'react';
import { 
  CameraIcon, 
  MicrophoneIcon, 
  WifiIcon, 
  SignalSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import PhotoCapture from './PhotoCapture';
import VoiceRecorder from './VoiceRecorder';

interface Task {
  id: string;
  title: string;
  asset: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  location: string;
}

interface FieldWorkerInterfaceProps {
  technician: string;
  tasks: Task[];
}

export default function FieldWorkerInterface({ technician, tasks }: FieldWorkerInterfaceProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const startTask = (task: Task) => {
    setCurrentTask(task);
  };

  const completeTask = async (taskId: string, data: any) => {
    const taskData = {
      id: taskId,
      completedAt: new Date().toISOString(),
      completedBy: technician,
      ...data
    };

    if (isOnline) {
      // Submit immediately if online
      try {
        await submitTaskCompletion(taskData);
      } catch (error) {
        // Add to sync queue if submission fails
        setSyncQueue(prev => [...prev, taskData]);
      }
    } else {
      // Add to sync queue for later submission
      setSyncQueue(prev => [...prev, taskData]);
      // Store in IndexedDB for persistence
      storeOfflineData(taskData);
    }
  };

  const submitTaskCompletion = async (data: any) => {
    // Mock API call
    console.log('Submitting task completion:', data);
    return Promise.resolve();
  };

  const storeOfflineData = (data: any) => {
    // Store in IndexedDB or localStorage for offline access
    const stored = localStorage.getItem('offlineTaskData') || '[]';
    const offlineData = JSON.parse(stored);
    offlineData.push(data);
    localStorage.setItem('offlineTaskData', JSON.stringify(offlineData));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="bg-teal-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Field Worker</h1>
            <p className="text-teal-200 text-sm">{technician}</p>
          </div>
          <div className="flex items-center space-x-2">
            {syncQueue.length > 0 && (
              <div className="flex items-center bg-yellow-500 px-2 py-1 rounded-full">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">{syncQueue.length}</span>
              </div>
            )}
            <div className="flex items-center">
              {isOnline ? (
                <WifiIcon className="h-5 w-5 text-green-300" />
              ) : (
                <SignalSlashIcon className="h-5 w-5 text-red-300" />
              )}
              <span className="text-xs ml-1">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTask ? (
        <TaskDetail 
          task={currentTask}
          onComplete={completeTask}
          onPhotoCapture={() => setShowPhotoCapture(true)}
          onVoiceNote={() => setShowVoiceRecorder(true)}
          onBack={() => setCurrentTask(null)}
        />
      ) : (
        <TaskList 
          tasks={tasks}
          onStartTask={startTask}
        />
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <PhotoCapture
          onCapture={(photo) => {
            console.log('Photo captured:', photo);
            setShowPhotoCapture(false);
          }}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onRecording={(audio) => {
            console.log('Voice note recorded:', audio);
            setShowVoiceRecorder(false);
          }}
          onClose={() => setShowVoiceRecorder(false)}
        />
      )}
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
}

function TaskList({ tasks, onStartTask }: TaskListProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
          <div className="text-xs text-blue-600">Pending</div>
        </Card>
        <Card className="p-3 text-center bg-yellow-50 border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
          <div className="text-xs text-yellow-600">In Progress</div>
        </Card>
        <Card className="p-3 text-center bg-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          <div className="text-xs text-green-600">Completed</div>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="space-y-4">
        {pendingTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-teal-800 mb-3">Pending Tasks</h2>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStart={() => onStartTask(task)} />
              ))}
            </div>
          </div>
        )}

        {inProgressTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-teal-800 mb-3">In Progress</h2>
            <div className="space-y-2">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStart={() => onStartTask(task)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onStart: () => void;
}

function TaskCard({ task, onStart }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200" hover>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-teal-800 flex-1">{task.title}</h3>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
      
      <p className="text-sm text-teal-600 mb-2">{task.asset}</p>
      <p className="text-xs text-teal-500 mb-3">{task.location}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-teal-600">Est: {task.estimatedTime}</span>
        <Button size="sm" onClick={onStart}>
          {task.status === 'pending' ? 'Start Task' : 'Continue'}
        </Button>
      </div>
    </Card>
  );
}

interface TaskDetailProps {
  task: Task;
  onComplete: (taskId: string, data: any) => void;
  onPhotoCapture: () => void;
  onVoiceNote: () => void;
  onBack: () => void;
}

function TaskDetail({ task, onComplete, onPhotoCapture, onVoiceNote, onBack }: TaskDetailProps) {
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);

  const handleComplete = () => {
    const completionData = {
      notes,
      photos,
      voiceNotes,
      completedAt: new Date().toISOString()
    };
    onComplete(task.id, completionData);
    onBack();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <span className="text-sm text-teal-600">Est: {task.estimatedTime}</span>
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-bold text-teal-800 mb-2">{task.title}</h2>
        <p className="text-teal-600 mb-2">{task.asset}</p>
        <p className="text-sm text-teal-500">{task.location}</p>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onPhotoCapture} className="flex items-center justify-center py-4">
          <CameraIcon className="h-6 w-6 mr-2" />
          Take Photo
        </Button>
        <Button variant="outline" onClick={onVoiceNote} className="flex items-center justify-center py-4">
          <MicrophoneIcon className="h-6 w-6 mr-2" />
          Voice Note
        </Button>
      </div>

      {/* Notes */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-teal-700 mb-2">
          Task Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full p-3 border border-teal-300 rounded-md bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
          placeholder="Enter any observations, issues, or additional notes..."
        />
      </Card>

      {/* Complete Task */}
      <Button onClick={handleComplete} className="w-full py-4 text-lg">
        <CheckCircleIcon className="h-6 w-6 mr-2" />
        Complete Task
      </Button>
    </div>
  );
}