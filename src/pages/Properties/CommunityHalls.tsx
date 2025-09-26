import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function CommunityHalls() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', 'Community Hall');

      if (error) {
        console.error('Error fetching community halls:', error.message);
      } else {
        setHalls(data);
      }
      setLoading(false);
    };

    fetchHalls();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Halls</h1>
          <p className="mt-2 text-gray-600">
            Manage facilities and maintenance for community halls and shared spaces
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Community Hall
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {halls.map((hall) => (
          <Card 
            key={hall.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/${hall.id.toLowerCase()}`)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{hall.name}</h3>
                <p className="text-sm text-gray-600">{hall.address}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {hall.type}</p>
              <p>Capacity: {hall.capacity}</p>
              <p>Last Service: {new Date(hall.last_service).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}