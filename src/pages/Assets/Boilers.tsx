import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { PlusIcon, CogIcon, FireIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { QrCodeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import AdvancedFilters from '../../components/Search/AdvancedFilters';
import AssetHistoryTimeline from '../../components/Assets/AssetHistoryTimeline';
import QRCodeGenerator from '../../components/Assets/QRCodeGenerator';
import FacilityMap from '../../components/Assets/FacilityMap';
import BulkOperations, { useBulkSelection } from '../../components/DataOperations/BulkOperations';
import ExportButton from '../../components/DataOperations/ExportButton';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function Boilers() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [boilerData, setBoilerData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { selectedIds, isSelected, toggleSelection } = useBulkSelection('assets');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manufacturer: '',
    model: '',
    capacity: '',
    status: 'Operational',
    lastService: '',
    nextService: '',
    efficiency: '',
    asset_type: 'Boiler'
  });

  useEffect(() => {
    fetchBoilers();
  }, []);

  const fetchBoilers = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('asset_type', 'Boiler');

    if (error) {
      console.error('Error fetching boilers:', error.message);
    } else {
      setBoilerData(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase
      .from('assets')
      .insert([formData]);

    if (error) {
      console.error('Error adding boiler:', error.message);
    } else {
      fetchBoilers();
      setShowForm(false);
      setFormData({
        name: '',
        location: '',
        manufacturer: '',
        model: '',
        capacity: '',
        status: 'Operational',
        lastService: '',
        nextService: '',
        efficiency: '',
        asset_type: 'Boiler'
      });
    }
    setLoading(false);
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'status' as const,
    },
    {
      key: 'location',
      label: 'Location',
      type: 'select' as const,
      options: [
        { value: 'Block A Plant Room', label: 'Block A Plant Room' },
        { value: 'Block B Plant Room', label: 'Block B Plant Room' },
        { value: 'Community Center', label: 'Community Center' },
      ]
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: 'select' as const,
      options: [
        { value: 'Viessmann', label: 'Viessmann' },
        { value: 'Worcester Bosch', label: 'Worcester Bosch' },
        { value: 'Baxi', label: 'Baxi' },
      ]
    },
    {
      key: 'nextService',
      label: 'Service Due Before',
      type: 'date' as const,
    }
  ];

  const filteredBoilers = useMemo(() => {
    return boilerData.filter(boiler => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'status':
            return boiler.status.toLowerCase() === value.toLowerCase();
          case 'location':
            return boiler.location === value;
          case 'manufacturer':
            return boiler.manufacturer === value;
          case 'nextService':
            return new Date(boiler.nextService) <= new Date(value);
          default:
            return true;
        }
      });
    });
  }, [filters, boilerData]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boilers</h1>
          <p className="mt-2 text-gray-600">
            Manage boiler assets, maintenance schedules, and performance monitoring
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Boiler
        </Button>
        <ExportButton 
          category="assets" 
          items={filteredBoilers}
          selectedItems={selectedIds}
        />
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Boiler</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Efficiency</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.efficiency} onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Service</label>
              <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.lastService} onChange={(e) => setFormData({ ...formData, lastService: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Next Service</label>
              <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.nextService} onChange={(e) => setFormData({ ...formData, nextService: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Boiler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <BulkOperations 
        category="assets" 
        items={filteredBoilers}
      />

      <AdvancedFilters
        onFiltersChange={setFilters}
        currentFilters={filters}
        availableFilters={filterConfig}
        category="assets"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBoilers.map((boiler) => (
          <Card key={boiler.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FireIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{boiler.name}</h3>
                  <p className="text-sm text-gray-600">{boiler.location}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                boiler.status === 'Operational' ? 'bg-green-100 text-green-800' :
                boiler.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {boiler.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="text-gray-900">{boiler.manufacturer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="text-gray-900">{boiler.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="text-gray-900">{boiler.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efficiency:</span>
                <span className="text-gray-900">{boiler.efficiency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Service:</span>
                <span className="text-gray-900">{new Date(boiler.nextService).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowHistory(boiler.id)}
                  title="View History"
                >
                  <ClockIcon className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowQRCode({
                    id: boiler.id,
                    name: boiler.name,
                    asset_type: 'Boiler',
                    plant_room: { name: boiler.location, location: boiler.location }
                  })}
                  title="Generate QR Code"
                >
                  <QrCodeIcon className="h-4 w-4" />
                </Button>
                <Button size="sm">
                  Schedule Service
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Facility Map */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Asset Locations</h3>
            <Button variant="outline" size="sm" onClick={() => setShowMap(true)}>
              <MapPinIcon className="h-4 w-4 mr-1" />
              Full Map
            </Button>
          </div>
          <FacilityMap 
            selectedAsset={selectedAsset} 
            onAssetSelect={setSelectedAsset}
            className="h-64"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Boiler Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Boilers</span>
              <span className="text-2xl font-bold text-gray-900">{boilerData.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operational</span>
              <span className="text-lg font-semibold text-green-600">{filteredBoilers.filter(b => b.status === 'Operational').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Under Maintenance</span>
              <span className="text-lg font-semibold text-yellow-600">{filteredBoilers.filter(b => b.status === 'Under Maintenance').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Efficiency</span>
              <span className="text-lg font-semibold text-blue-600">94%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Maintenance</h3>
          <div className="space-y-3">
            {filteredBoilers.map((boiler) => (
              <div key={boiler.id} className="p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{boiler.name}</p>
                  <p className="text-sm text-gray-600">{boiler.manufacturer} - {boiler.location}</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {new Date(boiler.nextService).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Asset History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative max-w-4xl mx-auto">
            <AssetHistoryTimeline 
              assetId={showHistory}
              assetName={filteredBoilers.find(b => b.id === showHistory)?.name || 'Asset'}
            />
            <Button 
              className="mt-4 mx-auto block"
              onClick={() => setShowHistory(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeGenerator 
          asset={showQRCode}
          onClose={() => setShowQRCode(null)}
        />
      )}

      {/* Full Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative max-w-6xl mx-auto">
            <FacilityMap 
              selectedAsset={selectedAsset} 
              onAssetSelect={setSelectedAsset}
            />
            <Button 
              className="mt-4 mx-auto block"
              onClick={() => setShowMap(false)}
            >
              Close Map
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}