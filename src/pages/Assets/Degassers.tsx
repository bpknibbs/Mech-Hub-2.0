import React, { useEffect, useState } from 'react';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Degassers() {
  const [degassers, setDegassers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDegassers = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_type', 'Degasser');

      if (error) {
        console.error('Error fetching degassers:', error.message);
      } else {
        setDegassers(data);
      }
      setLoading(false);
    };

    fetchDegassers();
  }, []);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Degassers</h1>
          <p className="mt-2 text-gray-600">
            Monitor air and gas removal systems for heating circuits
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Degasser
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {degassers.map((degasser) => (
          <Card key={degasser.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <CogIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{degasser.name}</h3>
                  <p className="text-sm text-gray-600">{degasser.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                degasser.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {degasser.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="text-gray-900">{degasser.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pressure:</span>
                <span className="text-gray-900">{degasser.pressure}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Temperature:</span>
                <span className="text-gray-900">{degasser.temperature}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="text-gray-900">{degasser.model}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}