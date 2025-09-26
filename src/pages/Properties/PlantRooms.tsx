import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MapPinIcon, BuildingOfficeIcon, CameraIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface PlantRoom {
  id: string;
  name: string;
  location: string;
  facility_type: 'Fresh Water' | 'Gas Heat Generating' | 'Community Halls';
  classification: 'Domestic' | 'Non-Domestic';
  description?: string;
  photo_url?: string;
  coordinates?: { lat: number; lng: number };
  created_at: string;
}

export default function PlantRooms() {
  const navigate = useNavigate();
  const [plantRooms, setPlantRooms] = useState<PlantRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    facility_type: 'Fresh Water' as PlantRoom['facility_type'],
    classification: 'Domestic' as PlantRoom['classification'],
    description: '',
  });

  useEffect(() => {
    loadPlantRooms();
  }, []);

  const loadPlantRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPlantRooms(data);
      }
    } catch (error) {
      console.error('Error loading plant rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('plant_rooms')
        .insert([formData]);

      if (!error) {
        setShowForm(false);
        setFormData({
          name: '',
          location: '',
          facility_type: 'Fresh Water',
          classification: 'Domestic',
          description: '',
        });
        loadPlantRooms();
      }
    } catch (error) {
      console.error('Error creating plant room:', error);
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'Gas Heat Generating':
        return '🔥';
      case 'Fresh Water':
        return '💧';
      case 'Community Halls':
        return '🏛️';
      default:
        return '🏢';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plant Rooms</h1>
          <p className="mt-2 text-gray-600">
            Manage your facility locations and track maintenance across multiple sites
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Plant Room
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Plant Room</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Facility Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.facility_type}
                onChange={(e) => setFormData({ ...formData, facility_type: e.target.value as PlantRoom['facility_type'] })}
              >
                <option value="Fresh Water">Fresh Water</option>
                <option value="Gas Heat Generating">Gas Heat Generating</option>
                <option value="Community Halls">Community Halls</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Classification</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.classification}
                onChange={(e) => setFormData({ ...formData, classification: e.target.value as PlantRoom['classification'] })}
              >
                <option value="Domestic">Domestic</option>
                <option value="Non-Domestic">Non-Domestic</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Plant Room
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plantRooms.map((room) => (
          <Card 
            key={room.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/${room.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getFacilityIcon(room.facility_type)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {room.location}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                room.classification === 'Domestic' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {room.classification}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 font-medium">{room.facility_type}</p>
              {room.description && (
                <p className="text-sm text-gray-500 mt-2">{room.description}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  Plant Room
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <CameraIcon className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {plantRooms.length === 0 && (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No plant rooms</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first plant room facility.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Plant Room
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}