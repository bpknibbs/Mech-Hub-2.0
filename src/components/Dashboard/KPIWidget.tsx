import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';

interface KPIWidgetProps {
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBgColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  onClick?: () => void;
  className?: string;
}

export default function KPIWidget({
  title,
  value,
  previousValue,
  unit = '',
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  trendValue,
  onClick,
  className = ''
}: KPIWidgetProps) {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down') {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const formatTrendValue = (value?: number) => {
    if (!value) return '';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  return (
    <Card 
      className={`p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:shadow-teal-500/20 hover:border-teal-400' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-teal-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-teal-800">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-lg font-medium ml-1">{unit}</span>}
            </p>
          </div>
          
          {(trend || trendValue) && (
            <div className="flex items-center mt-2 space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {formatTrendValue(trendValue)}
              </span>
              {previousValue && (
                <span className="text-xs text-gray-500">
                  vs {previousValue.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}