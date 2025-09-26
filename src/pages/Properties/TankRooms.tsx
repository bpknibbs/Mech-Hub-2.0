import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function TankRooms() {
  const navigate = useNavigate();
  const [tankRooms, setTankRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTankRooms = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', 'Tank Room');

      if (error) {
        console.error('Error fetching tank rooms:', error.message);
      } else {
        setTankRooms(data);
      }
      setLoading(false);
    };

    fetchTankRooms();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tank Rooms</h1>
          <p className="mt-2 text-gray-600">
            Manage water tank facilities and associated assets
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Tank Room
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tankRooms.map((room) => (
          <Card 
            key={room.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/${room.id.toLowerCase()}`)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-600">{room.address}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {room.type}</p>
              <p>Last Inspection: {new Date(room.last_inspection).toLocaleDateString()}</p>
              <p>Next Service: {new Date(room.next_service).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}