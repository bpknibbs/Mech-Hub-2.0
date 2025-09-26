import React, { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, CogIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface AssetLocation {
  id: string;
  name: string;
  type: string;
  x: number; // Percentage position
  y: number; // Percentage position
  status: 'operational' | 'maintenance' | 'offline';
  plantRoom: string;
}

interface FacilityMapProps {
  selectedAsset?: string;
  onAssetSelect?: (assetId: string) => void;
  className?: string;
}

export default function FacilityMap({ selectedAsset, onAssetSelect, className = '' }: FacilityMapProps) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('ground');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mock asset locations - in production, this would come from API
  const assetLocations: AssetLocation[] = [
    { id: 'BLR-001', name: 'Main Boiler #1', type: 'Boiler', x: 25, y: 30, status: 'operational', plantRoom: 'Block A Plant Room' },
    { id: 'BLR-002', name: 'Main Boiler #2', type: 'Boiler', x: 35, y: 30, status: 'maintenance', plantRoom: 'Block A Plant Room' },
    { id: 'FWP-001', name: 'Fresh Water Pump', type: 'Pump', x: 60, y: 45, status: 'operational', plantRoom: 'Block A Plant Room' },
    { id: 'CP-001', name: 'Circulator Pump #1', type: 'Pump', x: 70, y: 45, status: 'operational', plantRoom: 'Block A Plant Room' },
    { id: 'PV-001', name: 'Potable Vessel', type: 'Vessel', x: 45, y: 60, status: 'operational', plantRoom: 'Block A Plant Room' },
    { id: 'WT-001', name: 'Water Tank', type: 'Tank', x: 80, y: 20, status: 'operational', plantRoom: 'Roof Level' },
    { id: 'GV-001', name: 'Main Gas Valve', type: 'Valve', x: 15, y: 50, status: 'operational', plantRoom: 'Block A Plant Room' },
  ];

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500 border-green-600';
      case 'maintenance':
        return 'bg-yellow-500 border-yellow-600';
      case 'offline':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getAssetIcon = (type: string) => {
    // Simple icon representation based on type
    switch (type.toLowerCase()) {
      case 'boiler':
        return '🔥';
      case 'pump':
        return '🔄';
      case 'vessel':
        return '⚡';
      case 'tank':
        return '💧';
      case 'valve':
        return '🔧';
      default:
        return '⚙️';
    }
  };

  const handleAssetClick = (assetId: string) => {
    if (onAssetSelect) {
      onAssetSelect(assetId);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-teal-800">Facility Map</h3>
          <p className="text-sm text-teal-600">Interactive asset location mapping</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="basement">Basement</option>
            <option value="ground">Ground Floor</option>
            <option value="roof">Roof Level</option>
          </select>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
              -
            </Button>
            <span className="text-sm text-teal-700 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-teal-50 border-2 border-teal-200 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #14b8a6 1px, transparent 1px),
              linear-gradient(to bottom, #14b8a6 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Plant Room Outlines */}
        <div className="absolute inset-4">
          {/* Block A Plant Room */}
          <div
            className="absolute border-2 border-teal-300 bg-teal-100 bg-opacity-30 rounded-lg"
            style={{
              left: '10%',
              top: '20%',
              width: '70%',
              height: '60%',
              transform: `scale(${zoomLevel})`
            }}
          >
            <div className="absolute -top-6 left-2 text-sm font-medium text-teal-700 bg-white px-2 py-1 rounded border border-teal-200">
              Block A Plant Room
            </div>
          </div>

          {/* Asset Markers */}
          {assetLocations.map((asset) => {
            const isHovered = hoveredAsset === asset.id;
            const isSelected = selectedAsset === asset.id;

            return (
              <div
                key={asset.id}
                className={`absolute cursor-pointer transform transition-all duration-200 ${
                  isHovered || isSelected ? 'scale-125 z-20' : 'z-10'
                }`}
                style={{
                  left: `${asset.x}%`,
                  top: `${asset.y}%`,
                  transform: `translate(-50%, -50%) scale(${zoomLevel}) ${isHovered || isSelected ? 'scale(1.25)' : ''}`
                }}
                onMouseEnter={() => setHoveredAsset(asset.id)}
                onMouseLeave={() => setHoveredAsset(null)}
                onClick={() => handleAssetClick(asset.id)}
              >
                {/* Asset Pin */}
                <div className={`relative w-8 h-8 rounded-full border-2 ${getAssetStatusColor(asset.status)} shadow-lg flex items-center justify-center text-white font-bold text-xs`}>
                  <span>{getAssetIcon(asset.type)}</span>
                  
                  {/* Pulse animation for maintenance items */}
                  {asset.status === 'maintenance' && (
                    <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30"></div>
                  )}
                </div>

                {/* Asset Info Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white border border-teal-200 rounded-lg shadow-lg min-w-max z-30">
                    <div className="text-sm">
                      <p className="font-semibold text-teal-800">{asset.name}</p>
                      <p className="text-teal-600">{asset.type}</p>
                      <p className="text-xs text-teal-500">{asset.plantRoom}</p>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full ${getAssetStatusColor(asset.status).split(' ')[0]} mr-2`}></div>
                        <span className="text-xs capitalize text-teal-700">{asset.status}</span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white border border-teal-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-teal-800 mb-2">Asset Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-teal-700">Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-teal-700">Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-teal-700">Offline</span>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div className="absolute top-4 left-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assets..."
              className="pl-8 pr-4 py-2 text-sm border border-teal-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Asset Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
          <div className="text-2xl font-bold text-teal-700">{assetLocations.length}</div>
          <div className="text-sm text-teal-600">Total Assets</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {assetLocations.filter(a => a.status === 'operational').length}
          </div>
          <div className="text-sm text-green-600">Operational</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">
            {assetLocations.filter(a => a.status === 'maintenance').length}
          </div>
          <div className="text-sm text-yellow-600">Maintenance</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">
            {assetLocations.filter(a => a.status === 'offline').length}
          </div>
          <div className="text-sm text-red-600">Offline</div>
        </div>
      </div>
    </Card>
  );
}