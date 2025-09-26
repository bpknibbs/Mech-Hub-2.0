import React, { useEffect, useState } from 'react';
import { PlusIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function PlannedWorks() {
  const [plannedWorks, setPlannedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlannedWorks = async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('work_order_type', 'Planned Works');

      if (error) {
        console.error('Error fetching planned works:', error.message);
      } else {
        setPlannedWorks(data);
      }
      setLoading(false);
    };

    fetchPlannedWorks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planned Works</h1>
          <p className="mt-2 text-gray-600">
            Manage scheduled improvement projects and planned installations
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Planned Work
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plannedWorks.map((work) => (
          <Card key={work.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{work.title}</h3>
                  <p className="text-sm text-gray-600">{work.location}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  work.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {work.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  work.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  work.status === 'Planning' ? 'bg-orange-100 text-orange-800' :
                  work.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {work.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{work.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date:</span>
                <span className="text-gray-900">{new Date(work.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">End Date:</span>
                <span className="text-gray-900">{new Date(work.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget:</span>
                <span className="text-gray-900 font-medium">{work.budget}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Contractor:</span>
                <span className="text-gray-900">{work.contractor}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">{work.progress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: work.progress }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                <ClockIcon className="h-4 w-4 mr-1" />
                Timeline
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Works Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-2xl font-bold text-gray-900">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-lg font-semibold text-blue-600">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Planning</span>
              <span className="text-lg font-semibold text-orange-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-semibold text-green-600">8</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-lg font-bold text-gray-900">£180,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Allocated</span>
              <span className="text-lg font-semibold text-blue-600">£110,500</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Spent</span>
              <span className="text-lg font-semibold text-orange-600">£65,200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-lg font-semibold text-green-600">£69,500</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Milestones</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Heating Upgrade Start</p>
              <p className="text-sm text-blue-600">April 1, 2024</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">Water Tank Complete</p>
              <p className="text-sm text-green-600">March 25, 2024</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900">BMS Installation</p>
              <p className="text-sm text-purple-600">May 1, 2024</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}