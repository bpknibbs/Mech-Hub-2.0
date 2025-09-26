import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Concierge() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('type', 'Concierge');

      if (error) {
        console.error('Error fetching concierge locations:', error.message);
      } else {
        setLocations(data);
      }
      setLoading(false);
    };

    fetchLocations();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Concierge Locations</h1>
          <p className="mt-2 text-gray-600">
            Manage concierge desks, reception areas, and service locations
          </p>
        </div>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Concierge Location
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card 
            key={location.id} 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
            hover
            onClick={() => navigate(`/properties/detail/${location.id.toLowerCase()}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {location.location}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                location.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {location.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900">{location.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hours:</span>
                <span className="text-gray-900">{location.hours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Currently Staffed:</span>
                <span className={`${location.staffed ? 'text-green-600' : 'text-red-600'}`}>
                  {location.staffed ? `Yes - ${location.currentStaff}` : 'No'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Services Offered</h4>
              <div className="flex flex-wrap gap-1">
                {location.services.map((service, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button size="sm">
                Manage Location
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Locations</span>
              <span className="text-2xl font-bold text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-lg font-semibold text-green-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Currently Staffed</span>
              <span className="text-lg font-semibold text-blue-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">24/7 Locations</span>
              <span className="text-lg font-semibold text-purple-600">2</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Types</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Package Management</span>
              <span className="text-gray-900">3 locations</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visitor Access</span>
              <span className="text-gray-900">2 locations</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Response</span>
              <span className="text-gray-900">2 locations</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Event Coordination</span>
              <span className="text-gray-900">1 location</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">24/7 Operations</span>
              <span className="text-gray-900">2 locations</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Business Hours Only</span>
              <span className="text-gray-900">1 location</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Coverage</span>
              <span className="text-gray-900">18.7 hrs/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Hours Coverage</span>
              <span className="text-gray-900">100%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}