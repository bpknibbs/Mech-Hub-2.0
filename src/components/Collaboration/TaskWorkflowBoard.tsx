import React, { useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useTaskWorkflow } from '../../contexts/TaskWorkflowContext';
import { useMessaging } from '../../contexts/MessagingContext';

interface TaskWorkflowBoardProps {
  className?: string;
}

export default function TaskWorkflowBoard({ className = '' }: TaskWorkflowBoardProps) {
  const { tasks, workflowSteps, updateTaskStatus, addReview, getTasksByStatus } = useTaskWorkflow();
  const { createConversation, getConversationsForTask } = useMessaging();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleStatusUpdate = async (assignmentId: string, newStatus: any) => {
    await updateTaskStatus(assignmentId, newStatus);
  };

  const handleReview = async (assignmentId: string, approved: boolean) => {
    await addReview(assignmentId, reviewNotes, approved);
    setShowReviewModal(null);
    setReviewNotes('');
  };

  const createTaskConversation = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const conversationId = await createConversation({
      type: 'task',
      title: `Discussion: ${task.title}`,
      description: `Team communication about ${task.title}`,
      participants: [task.assignment?.assigned_to || '', task.created_by],
      related_id: taskId,
      related_type: 'task',
      created_by: 'current-user'
    });
    
    console.log('Created conversation:', conversationId);
  };

  const getStatusBadge = (status: string, priority: string) => {
    const step = workflowSteps.find(s => s.status === status);
    if (!step) return null;

    const priorityColors = {
      'critical': 'ring-2 ring-red-500',
      'high': 'ring-2 ring-orange-500',
      'medium': 'ring-2 ring-yellow-500',
      'low': 'ring-2 ring-green-500'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${step.color} ${step.bgColor} ${priorityColors[priority as keyof typeof priorityColors] || ''}`}>
        <span className="mr-2">{step.icon}</span>
        {step.label}
      </span>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Progress Overview */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Task Workflow Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {workflowSteps.map((step, index) => {
            const tasksInStep = getTasksByStatus(step.status).length;
            
            return (
              <div key={step.status} className="relative">
                <div className={`p-4 rounded-lg border-2 ${step.bgColor} ${step.color.replace('text-', 'border-')}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h4 className="font-medium">{step.label}</h4>
                      <p className="text-sm opacity-80">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{tasksInStep}</div>
                  <div className="text-sm opacity-70">tasks</div>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowRightIcon className="absolute top-1/2 -right-6 transform -translate-y-1/2 h-6 w-6 text-gray-400 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflowSteps.map(step => {
          const stepTasks = getTasksByStatus(step.status);
          
          return (
            <Card key={step.status} className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">{step.icon}</span>
                <h3 className={`font-semibold ${step.color}`}>{step.label}</h3>
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {stepTasks.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stepTasks.map(task => {
                  const assignment = task.assignment;
                  if (!assignment) return null;

                  const conversations = getConversationsForTask(task.id);
                  const hasUnreadMessages = conversations.some(conv => conv.unread_count > 0);

                  return (
                    <Card 
                      key={task.id} 
                      className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                        selectedTask === task.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      hover
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight">
                            {task.title}
                          </h4>
                          {getPriorityIcon(assignment.priority)}
                        </div>

                        <div className="text-xs text-gray-600">
                          <p>{task.asset_name}</p>
                          <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                          {assignment.assigned_to && (
                            <p>Assigned to: {assignment.assigned_to.replace('-', ' ')}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {assignment.priority.toUpperCase()}
                          </span>
                          
                          {conversations.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <ChatBubbleLeftIcon className={`h-4 w-4 ${hasUnreadMessages ? 'text-blue-600' : 'text-gray-400'}`} />
                              {hasUnreadMessages && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expanded Details */}
                        {selectedTask === task.id && (
                          <div className="mt-4 pt-3 border-t border-gray-200 space-y-3">
                            <div className="text-xs text-gray-600">
                              {assignment.notes && (
                                <p><strong>Notes:</strong> {assignment.notes}</p>
                              )}
                              {assignment.estimated_duration && (
                                <p><strong>Estimated:</strong> {assignment.estimated_duration}</p>
                              )}
                              {assignment.actual_duration && (
                                <p><strong>Actual:</strong> {assignment.actual_duration}</p>
                              )}
                              {assignment.completed_at && (
                                <p><strong>Completed:</strong> {formatDistanceToNow(new Date(assignment.completed_at), { addSuffix: true })}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {assignment.status === 'assigned' && (
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(assignment.id, 'in_progress');
                                  }}
                                >
                                  Start Task
                                </Button>
                              )}
                              
                              {assignment.status === 'in_progress' && (
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(assignment.id, 'review');
                                  }}
                                >
                                  Submit for Review
                                </Button>
                              )}
                              
                              {assignment.status === 'review' && (
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowReviewModal(assignment.id);
                                  }}
                                >
                                  Review Task
                                </Button>
                              )}

                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createTaskConversation(task.id);
                                }}
                              >
                                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {stepTasks.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="text-4xl mb-2">{step.icon}</div>
                    <p className="text-sm">No tasks in {step.label.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Review Task</h3>
              <p className="text-sm text-gray-600">Provide feedback and approve or request changes</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your review comments..."
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReviewModal(null);
                  setReviewNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleReview(showReviewModal, false)}
                className="flex-1"
              >
                Request Changes
              </Button>
              <Button 
                onClick={() => handleReview(showReviewModal, true)}
                className="flex-1"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}