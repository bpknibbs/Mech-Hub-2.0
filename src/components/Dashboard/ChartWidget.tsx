import React from 'react';
import Card from '../UI/Card';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartWidgetProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie';
  onDataPointClick?: (dataPoint: ChartData) => void;
  className?: string;
}

export default function ChartWidget({
  title,
  data,
  type,
  onDataPointClick,
  className = ''
}: ChartWidgetProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  const handleBarClick = (dataPoint: ChartData) => {
    if (onDataPointClick) {
      onDataPointClick(dataPoint);
    }
  };

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-teal-700 font-medium truncate">
            {item.name}
          </div>
          <div className="flex-1 relative">
            <div
              className="h-6 rounded-full cursor-pointer transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: item.color,
                width: `${(item.value / maxValue) * 100}%`,
                minWidth: '8px'
              }}
              onClick={() => handleBarClick(item)}
            />
          </div>
          <div className="w-12 text-sm text-teal-800 font-semibold text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="h-48 flex items-end justify-between px-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1 mx-1">
          <div className="relative w-full h-full flex flex-col justify-end">
            <div
              className="w-full rounded-t cursor-pointer transition-all duration-300 hover:opacity-80 absolute bottom-0"
              style={{
                backgroundColor: item.color,
                height: `${(item.value / maxValue) * 100}%`,
              }}
              onClick={() => handleBarClick(item)}
            />
          </div>
          <div className="text-xs text-teal-600 mt-2 text-center truncate w-full">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center space-x-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              
              const element = (
                <circle
                  key={index}
                  cx="16"
                  cy="16"
                  r="15.9155"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-300 hover:stroke-4"
                  onClick={() => handleBarClick(item)}
                />
              );
              
              cumulativePercentage += percentage;
              return element;
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 cursor-pointer hover:bg-teal-50 p-1 rounded"
              onClick={() => handleBarClick(item)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-teal-700">{item.name}</span>
              <span className="text-sm text-teal-800 font-medium ml-auto">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-teal-800">{title}</h3>
        <ChartBarIcon className="h-5 w-5 text-teal-600" />
      </div>
      
      <div className="mt-4">
        {type === 'bar' && renderBarChart()}
        {type === 'line' && renderLineChart()}
        {type === 'pie' && renderPieChart()}
      </div>
    </Card>
  );
}