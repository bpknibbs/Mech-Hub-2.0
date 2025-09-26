import React, { useEffect, useState } from 'react';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function DryRisers() {
  const [risers, setRisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDryRisers = async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('asset_type', 'Dry Riser');

      if (error) {
        console.error('Error fetching dry risers:', error.message);
      } else {
        setRisers(data);
      }
      setLoading(false);
    };

    fetchDryRisers();
  }, []);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dry Risers</h1>
          <p className="mt-2 text-gray-600">
            Monitor fire safety dry riser systems and access points
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Dry Riser
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {risers.map((riser) => (
          <Card key={riser.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <CogIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{riser.name}</h3>
                  <p className="text-sm text-gray-600">{riser.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                riser.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {riser.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900">{riser.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diameter:</span>
                <span className="text-gray-900">{riser.diameter}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Height:</span>
                <span className="text-gray-900">{riser.height}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Outlets:</span>
                <span className="text-gray-900">{riser.outlets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Test:</span>
                <span className="text-gray-900">{new Date(riser.nextTest).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Test Log
              </Button>
              <Button size="sm" variant="danger">
                Schedule Test
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}