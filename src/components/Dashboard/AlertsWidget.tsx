import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useDashboard, Alert } from '../../contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';

interface AlertsWidgetProps {
  className?: string;
}

export default function AlertsWidget({ className = '' }: AlertsWidgetProps) {
  const { alerts, markAlertAsRead, dismissAlert } = useDashboard();
  const navigate = useNavigate();
  
  const criticalAlerts = alerts.filter(alert => !alert.read && alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => !alert.read && alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => !alert.read && alert.type === 'info');

  const getAlertIcon = (type: Alert['type']) => {
    const baseClass = "h-5 w-5";
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className={`${baseClass} text-red-600`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${baseClass} text-yellow-600`} />;
      case 'info':
        return <ClockIcon className={`${baseClass} text-blue-600`} />;
      default:
        return <ExclamationTriangleIcon className={`${baseClass} text-gray-600`} />;
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleAlertClick = (alert: Alert) => {
    markAlertAsRead(alert.id);
    if (alert.actionUrl) {
      navigate(alert.actionUrl);
    }
  };

  const handleDismiss = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissAlert(alertId);
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-teal-800">
          Critical Alerts
          {unreadAlerts.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadAlerts.length}
            </span>
          )}
        </h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {/* Critical Alerts */}
        {criticalAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getAlertBgColor(alert.type)}`}
            onClick={() => handleAlertClick(alert)}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {alert.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={(e) => handleDismiss(alert.id, e)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Warning Alerts */}
        {warningAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getAlertBgColor(alert.type)}`}
            onClick={() => handleAlertClick(alert)}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {alert.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={(e) => handleDismiss(alert.id, e)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Info Alerts */}
        {infoAlerts.slice(0, 2).map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getAlertBgColor(alert.type)}`}
            onClick={() => handleAlertClick(alert)}
          >
            <div className="flex items-start space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {alert.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={(e) => handleDismiss(alert.id, e)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {unreadAlerts.length === 0 && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="h-12 w-12 text-teal-400 mx-auto mb-4" />
            <p className="text-sm text-teal-600">No active alerts</p>
            <p className="text-xs text-teal-500 mt-1">All systems are running normally</p>
          </div>
        )}
      </div>

      {unreadAlerts.length > 5 && (
        <div className="pt-4 border-t border-teal-200 mt-4">
          <Button variant="outline" size="sm" className="w-full">
            View All Alerts ({unreadAlerts.length})
          </Button>
        </div>
      )}
    </Card>
  );
}