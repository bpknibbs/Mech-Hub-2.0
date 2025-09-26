import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: 'text' | 'photo' | 'voice' | 'file';
  file_url?: string;
  created_at: string;
  read_by: string[];
}

interface Conversation {
  id: string;
  type: 'task' | 'asset' | 'general' | 'emergency';
  title: string;
  description?: string;
  participants: string[];
  related_id?: string; // task_id or asset_id
  related_type?: 'task' | 'asset';
  created_at: string;
  created_by: string;
  last_message?: Message;
  unread_count: number;
  is_active: boolean;
}

interface MessagingContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  unreadTotal: number;
  createConversation: (conversation: Omit<Conversation, 'id' | 'created_at' | 'unread_count' | 'is_active'>) => Promise<string>;
  sendMessage: (conversationId: string, message: string, type?: Message['message_type'], fileUrl?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  getConversationsForTask: (taskId: string) => Conversation[];
  getConversationsForAsset: (assetId: string) => Conversation[];
  addParticipant: (conversationId: string, userId: string) => Promise<void>;
  removeParticipant: (conversationId: string, userId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = () => {
    // Mock conversation data
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        type: 'task',
        title: 'Boiler Service Discussion',
        description: 'Communication about BLR-001 annual service',
        participants: ['james-wilson', 'emma-thompson', 'supervisor-1'],
        related_id: '1',
        related_type: 'task',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_by: 'supervisor-1',
        unread_count: 2,
        is_active: true
      },
      {
        id: 'conv-2',
        type: 'asset',
        title: 'Pump FWP-001 Issues',
        description: 'Ongoing discussion about pump performance',
        participants: ['sarah-mitchell', 'technical-lead'],
        related_id: 'FWP-001',
        related_type: 'asset',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        created_by: 'sarah-mitchell',
        unread_count: 0,
        is_active: true
      },
      {
        id: 'conv-3',
        type: 'emergency',
        title: 'Emergency Response Team',
        description: 'Emergency coordination channel',
        participants: ['all-engineers'],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'emergency-coordinator',
        unread_count: 1,
        is_active: true
      }
    ];

    const mockMessages: Record<string, Message[]> = {
      'conv-1': [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          sender_id: 'supervisor-1',
          sender_name: 'Emma Thompson',
          message: 'James, can you start the BLR-001 service today? Need to complete before the LGSR inspection.',
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_by: ['supervisor-1']
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          sender_id: 'james-wilson',
          sender_name: 'James Wilson',
          message: 'Already on it! I\'ll have it done by 2 PM today. Just need to check the heat exchanger.',
          message_type: 'text',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read_by: ['james-wilson']
        },
        {
          id: 'msg-3',
          conversation_id: 'conv-1',
          sender_id: 'james-wilson',
          sender_name: 'James Wilson',
          message: 'Found some minor scaling. Taking a photo for the report.',
          message_type: 'photo',
          file_url: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=300',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read_by: ['james-wilson']
        }
      ],
      'conv-2': [
        {
          id: 'msg-4',
          conversation_id: 'conv-2',
          sender_id: 'sarah-mitchell',
          sender_name: 'Sarah Mitchell',
          message: 'The FWP-001 pump is showing unusual vibration patterns. Should I schedule a detailed inspection?',
          message_type: 'text',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read_by: ['sarah-mitchell', 'technical-lead']
        },
        {
          id: 'msg-5',
          conversation_id: 'conv-2',
          sender_id: 'technical-lead',
          sender_name: 'Technical Lead',
          message: 'Yes, schedule it for this week. Also check the mounting bolts and alignment.',
          message_type: 'text',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read_by: ['technical-lead']
        }
      ]
    };

    setConversations(mockConversations);
    setMessages(mockMessages);
  };

  const unreadTotal = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  const createConversation = async (conversation: Omit<Conversation, 'id' | 'created_at' | 'unread_count' | 'is_active'>) => {
    const newConversation: Conversation = {
      ...conversation,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      unread_count: 0,
      is_active: true
    };

    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  };

  const sendMessage = async (
    conversationId: string, 
    message: string, 
    type: Message['message_type'] = 'text', 
    fileUrl?: string
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      sender_id: user?.id || 'current-user',
      sender_name: user?.email || 'Current User',
      message,
      message_type: type,
      file_url: fileUrl,
      created_at: new Date().toISOString(),
      read_by: [user?.id || 'current-user']
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? {
        ...conv,
        last_message: newMessage,
        unread_count: conv.participants.filter(p => p !== user?.id).length
      } : conv
    ));
  };

  const markAsRead = async (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
    ));
  };

  const loadConversation = async (conversationId: string) => {
    // In production, this would load messages from API
    console.log('Loading conversation:', conversationId);
  };

  const getConversationsForTask = (taskId: string): Conversation[] => {
    return conversations.filter(conv => conv.related_id === taskId && conv.related_type === 'task');
  };

  const getConversationsForAsset = (assetId: string): Conversation[] => {
    return conversations.filter(conv => conv.related_id === assetId && conv.related_type === 'asset');
  };

  const addParticipant = async (conversationId: string, userId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? {
        ...conv,
        participants: [...conv.participants, userId]
      } : conv
    ));
  };

  const removeParticipant = async (conversationId: string, userId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? {
        ...conv,
        participants: conv.participants.filter(p => p !== userId)
      } : conv
    ));
  };

  const value = {
    conversations,
    messages,
    unreadTotal,
    createConversation,
    sendMessage,
    markAsRead,
    loadConversation,
    getConversationsForTask,
    getConversationsForAsset,
    addParticipant,
    removeParticipant,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}