import React, { useEffect, useState } from 'react';
import { PlusIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function ReactiveRepairs() {
  const [reactiveRepairs, setReactiveRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactiveRepairs = async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('work_order_type', 'Reactive Repairs');

      if (error) {
        console.error('Error fetching reactive repairs:', error.message);
      } else {
        setReactiveRepairs(data);
      }
      setLoading(false);
    };

    fetchReactiveRepairs();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reactive Repairs</h1>
          <p className="mt-2 text-gray-600">
            Manage emergency repairs, breakdown responses, and urgent maintenance
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Report Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reactiveRepairs.map((repair) => (
          <Card key={repair.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  repair.priority === 'Critical' ? 'bg-red-50' :
                  repair.priority === 'High' ? 'bg-orange-50' : 'bg-yellow-50'
                }`}>
                  <ExclamationTriangleIcon className={`h-6 w-6 ${
                    repair.priority === 'Critical' ? 'text-red-600' :
                    repair.priority === 'High' ? 'text-orange-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{repair.title}</h3>
                  <p className="text-sm text-gray-600">{repair.location}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  repair.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  repair.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {repair.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  repair.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  repair.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  repair.status === 'Awaiting Parts' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {repair.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{repair.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reported By:</span>
                <span className="text-gray-900">{repair.reported_by}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reported At:</span>
                <span className="text-gray-900">
                  {new Date(repair.reported_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assigned To:</span>
                <span className="text-gray-900">{repair.assigned_to}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. Fix Time:</span>
                <span className="text-gray-900">{repair.estimated_fix}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost:</span>
                <span className="text-gray-900 font-medium">{repair.cost}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                <ClockIcon className="h-4 w-4 mr-1" />
                Update Status
              </Button>
              <Button size="sm">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Cases</span>
              <span className="text-2xl font-bold text-gray-900">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="text-lg font-semibold text-red-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Priority</span>
              <span className="text-lg font-semibold text-orange-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response</span>
              <span className="text-lg font-semibold text-blue-600">25min</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-gray-900">£2,340</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average per Job</span>
              <span className="text-lg font-semibold text-blue-600">£195</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emergency Calls</span>
              <span className="text-lg font-semibold text-red-600">£850</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Parts Cost</span>
              <span className="text-lg font-semibold text-orange-600">£640</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Common Issues</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Heating Issues</span>
              <span className="text-gray-900">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Water System</span>
              <span className="text-gray-900">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Electrical</span>
              <span className="text-gray-900">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pump Problems</span>
              <span className="text-gray-900">12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Other</span>
              <span className="text-gray-900">5%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}