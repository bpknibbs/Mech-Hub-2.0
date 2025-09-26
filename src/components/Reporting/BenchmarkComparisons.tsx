import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useCompliance } from '../../contexts/ComplianceContext';

interface BenchmarkComparisonsProps {
  className?: string;
}

export default function BenchmarkComparisons({ className = '' }: BenchmarkComparisonsProps) {
  const { complianceMetrics } = useCompliance();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [compareWith, setCompareWith] = useState('industry');

  const categories = ['all', ...new Set(complianceMetrics.map(m => m.category))];

  const filteredMetrics = selectedCategory === 'all' 
    ? complianceMetrics 
    : complianceMetrics.filter(m => m.category === selectedCategory);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeds_target':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'on_target':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'below_target':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceVsBenchmark = (value: number, benchmark: number) => {
    const difference = ((value - benchmark) / benchmark) * 100;
    return {
      percentage: Math.abs(difference),
      isBelow: difference < 0,
      isAbove: difference > 0,
      isEqual: Math.abs(difference) < 1
    };
  };

  const industryAverages = {
    'PPM Completion Rate': { value: 88, trend: 'stable' },
    'Emergency Response Time': { value: 45, trend: 'down' },
    'Unplanned Downtime': { value: 8.2, trend: 'up' },
    'Maintenance Cost per Asset': { value: 1800, trend: 'up' }
  };

  const overallPerformance = complianceMetrics.reduce((acc, metric) => {
    if (metric.status === 'exceeds_target') acc.excellent++;
    else if (metric.status === 'on_target') acc.good++;
    else acc.needsImprovement++;
    return acc;
  }, { excellent: 0, good: 0, needsImprovement: 0 });

  const overallScore = complianceMetrics.length > 0 
    ? Math.round(((overallPerformance.excellent * 100 + overallPerformance.good * 75) / (complianceMetrics.length * 100)) * 100)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Score */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Overall Performance Score</h3>
              <p className="text-sm text-gray-600">Compared to industry benchmarks</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{overallScore}</div>
            <div className="text-lg text-gray-600">/100</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{overallPerformance.excellent}</div>
            <div className="text-sm text-green-600">Exceeds Target</div>
          </div>
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{overallPerformance.good}</div>
            <div className="text-sm text-blue-600">On Target</div>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{overallPerformance.needsImprovement}</div>
            <div className="text-sm text-red-600">Below Target</div>
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compare With</label>
          <select
            value={compareWith}
            onChange={(e) => setCompareWith(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="industry">Industry Average</option>
            <option value="target">Internal Targets</option>
            <option value="previous">Previous Period</option>
          </select>
        </div>
      </div>

      {/* Benchmark Comparison Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredMetrics.map((metric) => {
          const benchmark = compareWith === 'industry' ? metric.benchmark : metric.target;
          const performance = getPerformanceVsBenchmark(metric.value, benchmark);
          
          return (
            <Card key={metric.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{metric.metric}</h4>
                  <p className="text-sm text-gray-600">{metric.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                    {metric.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metric.value.toLocaleString()}
                    <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-sm text-blue-600">Your Performance</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {benchmark.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {compareWith === 'industry' ? 'Industry Avg' : 'Target'}
                  </div>
                </div>
              </div>

              {/* Performance Comparison */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Performance vs {compareWith === 'industry' ? 'Industry' : 'Target'}</span>
                  <span className={`text-sm font-medium ${
                    performance.isAbove && metric.metric.includes('Time') || metric.metric.includes('Cost') || metric.metric.includes('Downtime')
                      ? 'text-red-600'
                      : performance.isAbove ? 'text-green-600' 
                      : performance.isBelow ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {performance.isEqual ? 'On Par' :
                     performance.isAbove ? `${performance.percentage.toFixed(1)}% ${metric.metric.includes('Time') || metric.metric.includes('Cost') || metric.metric.includes('Downtime') ? 'worse' : 'better'}` :
                     `${performance.percentage.toFixed(1)}% ${metric.metric.includes('Time') || metric.metric.includes('Cost') || metric.metric.includes('Downtime') ? 'better' : 'worse'}`}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      metric.status === 'exceeds_target' ? 'bg-green-500' :
                      metric.status === 'on_target' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (metric.value / (benchmark * 1.2)) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Industry Context */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Industry Context:</p>
                    <p>
                      {metric.metric.includes('Rate') || metric.metric.includes('Utilization') ? 
                        `Industry average: ${benchmark}${metric.unit}. Top quartile: ${Math.round(benchmark * 1.15)}${metric.unit}` :
                        metric.metric.includes('Time') || metric.metric.includes('Cost') ?
                        `Industry average: ${benchmark}${metric.unit}. Best in class: ${Math.round(benchmark * 0.7)}${metric.unit}` :
                        `Industry benchmark: ${benchmark}${metric.unit}. Leading facilities: ${Math.round(benchmark * 0.5)}${metric.unit}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Benchmark Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Benchmark Analysis Summary</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrophyIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-700">
              {complianceMetrics.filter(m => m.status === 'exceeds_target').length}
            </div>
            <div className="text-sm text-green-600">Metrics Above Benchmark</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-700">
              {complianceMetrics.filter(m => m.status === 'on_target').length}
            </div>
            <div className="text-sm text-blue-600">Metrics Meeting Target</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <InformationCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-red-700">
              {complianceMetrics.filter(m => m.status === 'below_target').length}
            </div>
            <div className="text-sm text-red-600">Metrics Need Improvement</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Performance Insights</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Your facility ranks in the <strong>top 25%</strong> for emergency response times</p>
                <p>• Asset reliability exceeds industry standards by <strong>180%</strong></p>
                <p>• PPM completion rate needs improvement to reach industry average</p>
                <p>• Cost management shows <strong>excellent</strong> efficiency compared to peers</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}