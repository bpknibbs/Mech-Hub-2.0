import React, { useEffect, useState } from 'react';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function WaterTanks() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTanks = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_type', 'Water Tank');

      if (error) {
        console.error('Error fetching water tanks:', error.message);
      } else {
        setTanks(data);
      }
      setLoading(false);
    };

    fetchTanks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Water Tanks</h1>
          <p className="mt-2 text-gray-600">
            Monitor water storage tanks and level management systems
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Water Tank
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tanks.map((tank) => (
          <Card key={tank.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CogIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tank.name}</h3>
                  <p className="text-sm text-gray-600">{tank.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                tank.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {tank.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="text-gray-900">{tank.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Level:</span>
                <span className="text-gray-900 font-semibold">{tank.currentLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900">{tank.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Temperature:</span>
                <span className="text-gray-900">{tank.temperature}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Cleaning:</span>
                <span className="text-gray-900">{new Date(tank.nextCleaning).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: tank.currentLevel }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Levels
              </Button>
              <Button size="sm">
                Schedule Clean
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}