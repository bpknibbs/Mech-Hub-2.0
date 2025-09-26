import React, { useEffect, useState } from 'react';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function GasValves() {
  const [valves, setValves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValves = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_type', 'Gas Valve');

      if (error) {
        console.error('Error fetching gas valves:', error.message);
      } else {
        setValves(data);
      }
      setLoading(false);
    };

    fetchValves();
  }, []);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gas Valves</h1>
          <p className="mt-2 text-gray-600">
            Monitor and maintain gas control and safety valve systems
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Gas Valve
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {valves.map((valve) => (
          <Card key={valve.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <CogIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{valve.name}</h3>
                  <p className="text-sm text-gray-600">{valve.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                valve.status === 'Operational' ? 'bg-green-100 text-green-800' :
                valve.status === 'Standby' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {valve.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900">{valve.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="text-gray-900">{valve.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pressure:</span>
                <span className="text-gray-900">{valve.pressure}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Test:</span>
                <span className="text-gray-900">{new Date(valve.lastTest).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <Button size="sm" variant="outline">
                  Safety Check
                </Button>
                <Button size="sm" variant="danger">
                  Emergency Stop
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}