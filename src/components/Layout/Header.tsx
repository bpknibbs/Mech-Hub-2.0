import React from 'react';
import { Bars3Icon, BellIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import GlobalSearchBar from '../Search/GlobalSearchBar';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-teal-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-teal-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-teal-300 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center space-x-6">
          <h2 className="text-lg font-semibold text-teal-800 hidden lg:block">Mechanical Management System</h2>
          <GlobalSearchBar />
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <NotificationDropdown>
            <button
              type="button"
              className="relative -m-2.5 p-2.5 text-teal-600 hover:text-teal-500"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </NotificationDropdown>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
              <span className="text-sm font-medium text-white">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden text-sm font-medium text-teal-700 lg:block">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}