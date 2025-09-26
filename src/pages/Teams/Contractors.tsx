import React, { useEffect, useState } from 'react';
import { PlusIcon, BuildingOffice2Icon, StarIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractors = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('type', 'Contractor');

      if (error) {
        console.error('Error fetching contractors:', error.message);
      } else {
        setContractors(data);
      }
      setLoading(false);
    };

    fetchContractors();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="mt-2 text-gray-600">
            Manage external contractors, specialists, and service providers
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Contractor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contractors.map((contractor) => (
          <Card key={contractor.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BuildingOffice2Icon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{contractor.company}</h3>
                  <p className="text-sm text-gray-600">{contractor.contact}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                contractor.status === 'Active' ? 'bg-green-100 text-green-800' :
                contractor.status === 'On Call' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {contractor.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-900">{contractor.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-900">{contractor.rating}</span>
                  <span className="ml-1 text-gray-500">rating</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recent Jobs:</span>
                <span className="text-gray-900">{contractor.recentJobs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="text-gray-900 font-medium">{contractor.totalValue}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-1">
                {contractor.specialties.map((specialty, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              Insurance: {contractor.insurance}
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Profile
              </Button>
              <Button size="sm">
                Request Quote
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contractor Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Contractors</span>
              <span className="text-2xl font-bold text-gray-900">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-lg font-semibold text-green-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Call</span>
              <span className="text-lg font-semibold text-blue-600">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Rating</span>
              <span className="text-lg font-semibold text-yellow-600">4.7/5</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-gray-900">£28,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emergency Calls</span>
              <span className="text-lg font-semibold text-red-600">£6,200</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Planned Work</span>
              <span className="text-lg font-semibold text-blue-600">£18,750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Specialist Jobs</span>
              <span className="text-lg font-semibold text-purple-600">£3,500</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">ABC Heating Services</p>
              <p className="text-sm text-green-600">4.8★ • 12 completed jobs</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Water Systems Pro</p>
              <p className="text-sm text-blue-600">4.9★ • 8 completed jobs</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900">Power & Control</p>
              <p className="text-sm text-purple-600">4.6★ • 6 completed jobs</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}