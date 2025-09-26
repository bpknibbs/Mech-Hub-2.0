import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function IntakeCupboards() {
  const navigate = useNavigate();
  const [cupboards, setCupboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCupboards = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', 'Intake Cupboard');

      if (error) {
        console.error('Error fetching intake cupboards:', error.message);
      } else {
        setCupboards(data);
      }
      setLoading(false);
    };

    fetchCupboards();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intake Cupboards</h1>
          <p className="mt-2 text-gray-600">
            Manage electrical and utility intake cupboards for various properties
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Cupboard
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cupboards.map((cupboard) => (
          <Card 
            key={cupboard.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/${cupboard.id.toLowerCase()}`)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cupboard.name}</h3>
                <p className="text-sm text-gray-600">{cupboard.address}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {cupboard.type}</p>
              <p>Assets: {cupboard.assets}</p>
              <p>Last Checked: {new Date(cupboard.last_checked).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}