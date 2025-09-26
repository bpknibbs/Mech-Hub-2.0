import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import TaskWorkflowBoard from '../components/Collaboration/TaskWorkflowBoard';
import TeamMessaging from '../components/Collaboration/TeamMessaging';
import KnowledgeBase from '../components/Collaboration/KnowledgeBase';
import SkillsMatrix from '../components/Collaboration/SkillsMatrix';
import LoadingSpinner from '../components/UI/LoadingSpinner';

type Tab = 'workflow' | 'messaging' | 'knowledge' | 'skills';

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState<Tab>('workflow');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasks: 0,
    messages: 0,
    knowledgeItems: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    try {
      const [
        { count: tasksCount },
        { count: messagesCount },
        { count: knowledgeCount },
        { count: teamCount }
      ] = await Promise.all([
        supabase.from('work_orders').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('knowledge_base').select('*', { count: 'exact', head: true }),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        tasks: tasksCount || 0,
        messages: messagesCount || 0,
        knowledgeItems: knowledgeCount || 0,
        teamMembers: teamCount || 0,
      });
    } catch (error) {
      console.error('Error loading collaboration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    {
      key: 'workflow',
      label: 'Task Workflow',
      icon: ClipboardDocumentListIcon,
      count: stats.tasks,
      description: 'Manage task assignments and workflow'
    },
    {
      key: 'messaging',
      label: 'Team Chat',
      icon: ChatBubbleLeftRightIcon,
      count: stats.messages,
      description: 'Communicate with team members'
    },
    {
      key: 'knowledge',
      label: 'Knowledge Base',
      icon: BookOpenIcon,
      count: stats.knowledgeItems,
      description: 'Procedures and troubleshooting guides'
    },
    {
      key: 'skills',
      label: 'Skills Matrix',
      icon: AcademicCapIcon,
      count: stats.teamMembers,
      description: 'Team skills and certifications'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="mt-2 text-gray-600">
            Streamlined workflow management, communication, and knowledge sharing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          
          return (
            <Card 
              key={tab.key} 
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                activeTab === tab.key ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setActiveTab(tab.key as Tab)}
              hover
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.key ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <TabIcon className={`h-6 w-6 ${
                      activeTab === tab.key ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tab.label}</h3>
                    <p className="text-sm text-gray-600">{tab.description}</p>
                  </div>
                </div>
                {tab.count > 0 && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'workflow' && <TaskWorkflowBoard />}
        {activeTab === 'messaging' && <TeamMessaging />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'skills' && <SkillsMatrix />}
      </div>
    </div>
  );
}