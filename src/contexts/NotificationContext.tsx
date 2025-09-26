import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Skip real-time subscriptions in dummy mode
      if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        return;
      }
      
      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    // Handle dummy/development mode
    if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
      const mockNotifications = [
        {
          id: '1',
          title: 'Task Assigned',
          message: 'You have been assigned a new boiler maintenance task',
          type: 'info' as const,
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: '2',
          title: 'LGSR Due',
          message: 'LGSR inspection is due for Main Building plant room',
          type: 'warning' as const,
          read: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        },
        {
          id: '3',
          title: 'Task Completed',
          message: 'Pump maintenance task has been completed successfully',
          type: 'success' as const,
          read: true,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        }
      ];
      setNotifications(mockNotifications);
      return;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!user) return;
    
    // Handle dummy/development mode
    if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
      return;
    }
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        user_id: user.id,
        read: false
      });

    if (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    // Handle dummy/development mode
    if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      return;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    // Handle dummy/development mode
    if (import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      return;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}