import React, { useEffect, useState } from 'react';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function ShuntPumps() {
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPumps = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_type', 'Shunt Pump');

      if (error) {
        console.error('Error fetching shunt pumps:', error.message);
      } else {
        setPumps(data);
      }
      setLoading(false);
    };

    fetchPumps();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shunt Pumps</h1>
          <p className="mt-2 text-gray-600">
            Monitor shunt pump systems for temperature control and mixing
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Shunt Pump
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pumps.map((pump) => (
          <Card key={pump.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <CogIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pump.name}</h3>
                  <p className="text-sm text-gray-600">{pump.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                pump.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {pump.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Application:</span>
                <span className="text-gray-900">{pump.application}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Set Temperature:</span>
                <span className="text-gray-900">{pump.setTemp}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual Temperature:</span>
                <span className="text-gray-900">{pump.actualTemp}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="text-gray-900">{pump.model}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}