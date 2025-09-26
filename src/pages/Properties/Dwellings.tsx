import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

export default function Dwellings() {
  const navigate = useNavigate();
  const [dwellings, setDwellings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDwellings = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', 'Dwelling');

      if (error) {
        console.error('Error fetching dwellings:', error.message);
      } else {
        setDwellings(data);
      }
      setLoading(false);
    };

    fetchDwellings();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dwellings</h1>
          <p className="mt-2 text-gray-600">
            Manage individual dwelling units and apartments
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Dwelling
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dwellings.map((dwelling) => (
          <Card 
            key={dwelling.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/apt-${dwelling.id.toLowerCase()}`)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <HomeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{dwelling.id}</h3>
                <p className="text-sm text-gray-600">{dwelling.type}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  dwelling.status === 'Occupied' ? 'bg-green-100 text-green-800' :
                  dwelling.status === 'Vacant' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {dwelling.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}