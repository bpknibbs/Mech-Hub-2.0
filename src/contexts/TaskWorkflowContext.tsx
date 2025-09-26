import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase } from '../lib/supabase';

interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  notes?: string;
  estimated_duration?: string;
  actual_duration?: string;
  completed_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  asset_id?: string;
  asset_name?: string;
  task_type: 'maintenance' | 'inspection' | 'repair' | 'service' | 'emergency';
  created_at: string;
  created_by: string;
  assignment?: TaskAssignment;
}

interface WorkflowStep {
  status: TaskAssignment['status'];
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface TaskWorkflowContextType {
  tasks: Task[];
  assignments: TaskAssignment[];
  workflowSteps: WorkflowStep[];
  assignTask: (taskId: string, assigneeId: string, dueDate: string, priority: TaskAssignment['priority'], notes?: string) => Promise<void>;
  updateTaskStatus: (assignmentId: string, status: TaskAssignment['status'], notes?: string) => Promise<void>;
  addReview: (assignmentId: string, reviewNotes: string, approved: boolean) => Promise<void>;
  completeTask: (assignmentId: string, actualDuration: string, completionNotes: string) => Promise<void>;
  loadTasks: () => void;
  getTasksByStatus: (status: TaskAssignment['status']) => Task[];
  getMyTasks: () => Task[];
  getMyReviewTasks: () => Task[];
}

const TaskWorkflowContext = createContext<TaskWorkflowContextType | undefined>(undefined);

const workflowSteps: WorkflowStep[] = [
  {
    status: 'assigned',
    label: 'Assigned',
    description: 'Task has been assigned to a team member',
    icon: '📋',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    description: 'Team member is actively working on the task',
    icon: '🔧',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    status: 'review',
    label: 'Review',
    description: 'Task completed, awaiting supervisor review',
    icon: '👁️',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    status: 'completed',
    label: 'Completed',
    description: 'Task approved and completed',
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
];

export function TaskWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    // In production, this would fetch from Supabase
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('task_assignments')
      .select('*');
    
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (!assignmentsError && assignmentsData && !tasksError && tasksData) {
      const mergedTasks = tasksData.map(task => ({
        ...task,
        assignment: assignmentsData.find(assignment => assignment.task_id === task.id)
      }));
      setTasks(mergedTasks as Task[]);
      setAssignments(assignmentsData as TaskAssignment[]);
    }
  };

  const assignTask = async (
    taskId: string, 
    assigneeId: string, 
    dueDate: string, 
    priority: TaskAssignment['priority'], 
    notes?: string
  ) => {
    const newAssignment = {
      task_id: taskId,
      assigned_to: assigneeId,
      assigned_by: user?.id || 'current-user',
      assigned_at: new Date().toISOString(),
      due_date: dueDate,
      priority,
      status: 'assigned',
      notes,
      estimated_duration: '2 hours'
    };

    const { data, error } = await supabase
      .from('task_assignments')
      .insert([newAssignment])
      .select();

    if (error) {
      console.error('Error assigning task:', error);
      addNotification({ title: 'Task Assignment Failed', message: error.message, type: 'error' });
    } else {
      loadTasks();
      addNotification({
        title: 'Task Assigned',
        message: `New ${priority} priority task has been assigned to ${assigneeId}`,
        type: 'info'
      });
    }
  };

  const updateTaskStatus = async (assignmentId: string, status: TaskAssignment['status'], notes?: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const updates: Partial<TaskAssignment> = { status };
    
    if (status === 'review') {
      updates.completed_at = new Date().toISOString();
    }

    if (notes) {
      updates.notes = notes;
    }

    const { error } = await supabase
      .from('task_assignments')
      .update(updates)
      .eq('id', assignmentId);

    if (error) {
      console.error('Error updating task status:', error);
      addNotification({ title: 'Status Update Failed', message: error.message, type: 'error' });
    } else {
      loadTasks();
      const statusLabels = {
        'assigned': 'assigned',
        'in_progress': 'started',
        'review': 'submitted for review',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      addNotification({
        title: 'Task Status Updated',
        message: `Task ${assignment.task_id} has been ${statusLabels[status]}`,
        type: 'info'
      });
    }
  };

  const addReview = async (assignmentId: string, reviewNotes: string, approved: boolean) => {
    const updates: Partial<TaskAssignment> = {
      review_notes: reviewNotes,
      reviewed_by: user?.id || 'current-user',
      reviewed_at: new Date().toISOString(),
      status: approved ? 'completed' : 'in_progress'
    };

    const { error } = await supabase
      .from('task_assignments')
      .update(updates)
      .eq('id', assignmentId);

    if (error) {
      console.error('Error adding review:', error);
      addNotification({ title: 'Review Failed', message: error.message, type: 'error' });
    } else {
      loadTasks();
      addNotification({
        title: approved ? 'Task Approved' : 'Task Needs Revision',
        message: approved 
          ? 'Task has been approved and marked as completed'
          : 'Task sent back for revision',
        type: approved ? 'success' : 'warning'
      });
    }
  };

  const completeTask = async (assignmentId: string, actualDuration: string, completionNotes: string) => {
    const updates: Partial<TaskAssignment> = {
      actual_duration: actualDuration,
      completed_at: new Date().toISOString(),
      status: 'review',
      notes: completionNotes
    };

    const { error } = await supabase
      .from('task_assignments')
      .update(updates)
      .eq('id', assignmentId);
    
    if (error) {
      console.error('Error completing task:', error);
      addNotification({ title: 'Task Completion Failed', message: error.message, type: 'error' });
    } else {
      loadTasks();
      addNotification({
        title: 'Task Submitted for Review',
        message: 'Task completed and submitted for supervisor review',
        type: 'success'
      });
    }
  };

  const getTasksByStatus = (status: TaskAssignment['status']): Task[] => {
    return tasks.filter(task => task.assignment?.status === status);
  };

  const getMyTasks = (): Task[] => {
    return tasks.filter(task => task.assignment?.assigned_to === user?.id);
  };

  const getMyReviewTasks = (): Task[] => {
    return tasks.filter(task => task.assignment?.status === 'review');
  };

  const value = {
    tasks,
    assignments,
    workflowSteps,
    assignTask,
    updateTaskStatus,
    addReview,
    completeTask,
    loadTasks,
    getTasksByStatus,
    getMyTasks,
    getMyReviewTasks,
  };

  return (
    <TaskWorkflowContext.Provider value={value}>
      {children}
    </TaskWorkflowContext.Provider>
  );
}

export function useTaskWorkflow() {
  const context = useContext(TaskWorkflowContext);
  if (context === undefined) {
    throw new Error('useTaskWorkflow must be used within a TaskWorkflowProvider');
  }
  return context;
}