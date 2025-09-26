import React, { useState } from 'react';
import { CalendarIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, CheckCircleIcon, CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface HistoryEvent {
  id: string;
  date: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'service';
  title: string;
  description: string;
  technician: string;
  status: 'completed' | 'in-progress' | 'cancelled';
  photos?: string[];
  notes?: string;
  cost?: string;
  duration?: string;
  partsUsed?: string[];
}

interface AssetHistoryTimelineProps {
  assetId: string;
  assetName: string;
  className?: string;
}

export default function AssetHistoryTimeline({ assetId, assetName, className = '' }: AssetHistoryTimelineProps) {
  const [showPhotos, setShowPhotos] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Mock history data - in production, this would come from API
  const historyEvents: HistoryEvent[] = [
    {
      id: '1',
      date: '2024-03-10T10:00:00Z',
      type: 'maintenance',
      title: 'Annual Service Completed',
      description: 'Full annual maintenance including cleaning, calibration, and parts replacement',
      technician: 'James Wilson',
      status: 'completed',
      photos: [
        'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=300',
        'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=300'
      ],
      notes: 'All systems operating within normal parameters. Replaced worn gaskets and updated control software.',
      cost: '£450',
      duration: '4 hours',
      partsUsed: ['Gasket Set', 'Control Module', 'Filter']
    },
    {
      id: '2',
      date: '2024-02-15T14:30:00Z',
      type: 'repair',
      title: 'Emergency Repair - Pressure Relief',
      description: 'Replaced faulty pressure relief valve after high pressure alarm',
      technician: 'Sarah Mitchell',
      status: 'completed',
      photos: ['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=300'],
      notes: 'Valve was stuck due to mineral buildup. Recommended more frequent cleaning cycles.',
      cost: '£180',
      duration: '2 hours',
      partsUsed: ['Pressure Relief Valve', 'Sealing Compound']
    },
    {
      id: '3',
      date: '2024-01-20T09:15:00Z',
      type: 'inspection',
      title: 'LGSR Safety Inspection',
      description: 'Annual Landlord Gas Safety Record inspection and certification',
      technician: 'Michael Chen',
      status: 'completed',
      notes: 'All safety systems tested and verified. Certificate issued valid until January 2025.',
      cost: '£120',
      duration: '1.5 hours'
    },
    {
      id: '4',
      date: '2023-12-05T11:45:00Z',
      type: 'service',
      title: 'Quarterly Performance Check',
      description: 'Routine quarterly inspection and performance optimization',
      technician: 'James Wilson',
      status: 'completed',
      notes: 'Minor efficiency adjustments made. Performance within expected parameters.',
      duration: '1 hour'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'repair':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'inspection':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'service':
        return <WrenchScrewdriverIcon className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'text-teal-600 bg-teal-100';
      case 'repair':
        return 'text-red-600 bg-red-100';
      case 'inspection':
        return 'text-blue-600 bg-blue-100';
      case 'service':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredEvents = filter === 'all' 
    ? historyEvents 
    : historyEvents.filter(event => event.type === filter);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-teal-800">Asset History - {assetName}</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
        >
          <option value="all">All Events</option>
          <option value="maintenance">Maintenance</option>
          <option value="repair">Repairs</option>
          <option value="inspection">Inspections</option>
          <option value="service">Service</option>
        </select>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-teal-200"></div>
        
        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <Card className="p-4 hover:shadow-lg transition-all duration-200" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-teal-800">{event.title}</h4>
                      <p className="text-sm text-teal-600">{event.description}</p>
                    </div>
                    <div className="text-right text-sm text-teal-500">
                      <p>{new Date(event.date).toLocaleDateString()}</p>
                      <p>{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-teal-600">
                        <strong>Technician:</strong> {event.technician}
                      </p>
                      {event.duration && (
                        <p className="text-sm text-teal-600">
                          <strong>Duration:</strong> {event.duration}
                        </p>
                      )}
                      {event.cost && (
                        <p className="text-sm text-teal-600">
                          <strong>Cost:</strong> {event.cost}
                        </p>
                      )}
                    </div>
                    
                    {event.partsUsed && (
                      <div>
                        <p className="text-sm text-teal-600 mb-1"><strong>Parts Used:</strong></p>
                        <div className="flex flex-wrap gap-1">
                          {event.partsUsed.map((part, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {event.notes && (
                    <div className="mb-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-start space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-teal-700">{event.notes}</p>
                      </div>
                    </div>
                  )}

                  {event.photos && event.photos.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CameraIcon className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium text-teal-700">Photos ({event.photos.length})</span>
                      </div>
                      <div className="flex space-x-2">
                        {event.photos.map((photo, photoIdx) => (
                          <img
                            key={photoIdx}
                            src={photo}
                            alt={`${event.title} photo ${photoIdx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setShowPhotos(photo)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-teal-400 mx-auto mb-4" />
          <p className="text-teal-600">No history events found</p>
          <p className="text-sm text-teal-500 mt-1">
            {filter === 'all' ? 'No maintenance history available' : `No ${filter} events found`}
          </p>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotos && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-full">
            <img
              src={showPhotos}
              alt="Event photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              className="mt-4 mx-auto block"
              onClick={() => setShowPhotos(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}