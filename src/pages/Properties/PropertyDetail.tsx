import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  HomeIcon,
  BuildingOffice2Icon,
  ArchiveBoxIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

interface Property {
  id: string;
  name: string;
  location: string;
  type: 'plant-room' | 'block' | 'dwelling' | 'tank-room' | 'intake-cupboard' | 'community-hall' | 'concierge';
  classification?: string;
  facility_type?: string;
  description?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  status: 'operational' | 'maintenance' | 'offline';
  last_service?: string;
  next_service?: string;
}

interface WorkOrder {
  id: string;
  title: string;
  type: 'ppm' | 'reactive' | 'planned';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to: string;
  created_at: string;
  due_date?: string;
}

interface ActivityEvent {
  id: string;
  type: 'maintenance' | 'inspection' | 'repair' | 'service';
  description: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'in-progress';
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'work-orders' | 'history' | 'compliance'>('overview');

  useEffect(() => {
    loadPropertyData();
  }, [id]);

  const loadPropertyData = async () => {
    if (!id) return;
    
    // Mock data - in production this would come from API
    const mockProperty: Property = {
      id,
      name: getPropertyName(id),
      location: getPropertyLocation(id),
      type: getPropertyType(id),
      classification: 'Non-Domestic',
      facility_type: 'Fresh Water',
      description: getPropertyDescription(id),
      created_at: '2024-01-15T10:00:00Z',
      metadata: getPropertyMetadata(id)
    };

    const mockAssets: Asset[] = getAssetsForProperty(id);
    const mockWorkOrders: WorkOrder[] = getWorkOrdersForProperty(id);
    const mockActivities: ActivityEvent[] = getActivitiesForProperty(id);

    setProperty(mockProperty);
    setAssets(mockAssets);
    setWorkOrders(mockWorkOrders);
    setActivities(mockActivities);
    setLoading(false);
  };

  const getPropertyName = (id: string): string => {
    const names: Record<string, string> = {
      'pr-001': 'Main Building Plant Room',
      'pr-002': 'Community Hall Heating',
      'block-a': 'Block A',
      'block-b': 'Block B',
      'apt-101': 'Apartment 101',
      'tr-001': 'Main Cold Water Tank Room',
      'ic-001': 'Main Water Intake Cupboard',
      'ch-001': 'Main Community Hall',
      'con-001': 'Main Reception Desk'
    };
    return names[id] || `Property ${id}`;
  };

  const getPropertyLocation = (id: string): string => {
    const locations: Record<string, string> = {
      'pr-001': 'Block A - Basement Level',
      'pr-002': 'Community Center - Ground Floor',
      'block-a': '123 Main Street',
      'block-b': '125 Main Street',
      'apt-101': 'Block A - First Floor',
      'tr-001': 'Roof Level - Block A',
      'ic-001': 'Building Entry - Ground Level',
      'ch-001': 'Community Center',
      'con-001': 'Ground Floor - Block A'
    };
    return locations[id] || 'Location TBD';
  };

  const getPropertyType = (id: string): Property['type'] => {
    if (id.startsWith('pr-')) return 'plant-room';
    if (id.startsWith('block-')) return 'block';
    if (id.startsWith('apt-')) return 'dwelling';
    if (id.startsWith('tr-')) return 'tank-room';
    if (id.startsWith('ic-')) return 'intake-cupboard';
    if (id.startsWith('ch-')) return 'community-hall';
    if (id.startsWith('con-')) return 'concierge';
    return 'plant-room';
  };

  const getPropertyDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'pr-001': 'Primary mechanical services plant room serving residential units with heating, hot water, and fresh water systems.',
      'pr-002': 'Dedicated heating plant room for community facilities including main hall and meeting rooms.',
      'block-a': 'Main residential building with 24 units across 6 floors, built in 2018.',
      'block-b': 'Mixed-use building with 18 residential and commercial units across 8 floors.',
      'apt-101': 'One-bedroom apartment unit with individual heating controls and modern fixtures.',
      'tr-001': 'Dedicated storage facility housing cold water tanks with capacity monitoring and cleaning schedules.',
      'ic-001': 'Main utility intake point with smart meters, isolation valves, and emergency controls.',
      'ch-001': 'Multi-purpose community space with capacity for 150 people, including kitchen and A/V systems.',
      'con-001': '24/7 concierge desk providing package management, visitor access, and emergency response services.'
    };
    return descriptions[id] || 'Property details not available';
  };

  const getPropertyMetadata = (id: string): Record<string, any> => {
    const metadata: Record<string, any> = {
      'pr-001': { capacity: '500kW', systems: 4, lastInspection: '2024-02-15' },
      'block-a': { units: 24, floors: 6, yearBuilt: 2018 },
      'tr-001': { tankCount: 2, totalCapacity: '10,000L', temperature: '12°C' },
      'ic-001': { meterCount: 3, lastReading: '2024-03-10', valveCount: 5 },
      'ch-001': { capacity: 150, size: '200 sqm', amenities: 'Kitchen, A/V system' }
    };
    return metadata[id] || {};
  };

  const getAssetsForProperty = (propertyId: string): Asset[] => {
    const propertyAssets: Record<string, Asset[]> = {
      'pr-001': [
        { id: 'BLR-001', name: 'Main Building Boiler #1', asset_type: 'Boiler', status: 'operational', last_service: '2024-01-15', next_service: '2024-04-15' },
        { id: 'FWP-001', name: 'Fresh Water Booster Pump', asset_type: 'Pump', status: 'operational', last_service: '2024-02-01', next_service: '2024-05-01' },
        { id: 'CP-001', name: 'Primary Heating Circulation Pump', asset_type: 'Pump', status: 'operational', last_service: '2024-01-20', next_service: '2024-04-20' },
        { id: 'PV-001', name: 'Potable Water Vessel', asset_type: 'Vessel', status: 'maintenance', last_service: '2024-02-10' }
      ],
      'pr-002': [
        { id: 'BLR-003', name: 'Community Hall Boiler', asset_type: 'Boiler', status: 'operational', last_service: '2024-01-20', next_service: '2024-04-20' },
        { id: 'GV-002', name: 'Gas Control Valve', asset_type: 'Valve', status: 'operational' }
      ],
      'tr-001': [
        { id: 'WT-001', name: 'Main Cold Water Tank', asset_type: 'Tank', status: 'operational', last_service: '2024-01-15', next_service: '2024-07-15' },
        { id: 'WT-002', name: 'Reserve Cold Water Tank', asset_type: 'Tank', status: 'operational', last_service: '2024-01-15', next_service: '2024-07-15' }
      ],
      'ic-001': [
        { id: 'WM-001', name: 'Smart Water Meter', asset_type: 'Meter', status: 'operational' },
        { id: 'GV-001', name: 'Main Gas Isolation Valve', asset_type: 'Valve', status: 'operational' }
      ]
    };
    return propertyAssets[propertyId] || [];
  };

  const getWorkOrdersForProperty = (propertyId: string): WorkOrder[] => {
    return [
      {
        id: 'WO-001',
        title: 'Quarterly Safety Inspection',
        type: 'ppm',
        priority: 'medium',
        status: 'pending',
        assigned_to: 'James Wilson',
        created_at: '2024-03-10T09:00:00Z',
        due_date: '2024-03-25T17:00:00Z'
      },
      {
        id: 'WO-002',
        title: 'Heating System Maintenance',
        type: 'ppm',
        priority: 'high',
        status: 'in-progress',
        assigned_to: 'Sarah Mitchell',
        created_at: '2024-03-05T14:00:00Z',
        due_date: '2024-03-20T16:00:00Z'
      },
      {
        id: 'WO-003',
        title: 'Emergency Pump Repair',
        type: 'reactive',
        priority: 'critical',
        status: 'completed',
        assigned_to: 'Michael Chen',
        created_at: '2024-03-01T08:30:00Z'
      }
    ];
  };

  const getActivitiesForProperty = (propertyId: string): ActivityEvent[] => {
    return [
      {
        id: '1',
        type: 'maintenance',
        description: 'Completed annual boiler service',
        timestamp: '2024-03-15T10:30:00Z',
        user: 'James Wilson',
        status: 'completed'
      },
      {
        id: '2',
        type: 'inspection',
        description: 'LGSR safety inspection passed',
        timestamp: '2024-03-12T14:15:00Z',
        user: 'Sarah Mitchell',
        status: 'completed'
      },
      {
        id: '3',
        type: 'repair',
        description: 'Fixed water pressure issue',
        timestamp: '2024-03-08T11:45:00Z',
        user: 'Michael Chen',
        status: 'completed'
      },
      {
        id: '4',
        type: 'service',
        description: 'Updated BMS settings',
        timestamp: '2024-03-01T16:20:00Z',
        user: 'Technical Support',
        status: 'completed'
      }
    ];
  };

  const getPropertyIcon = (type: Property['type']) => {
    switch (type) {
      case 'plant-room': return <CogIcon className="h-8 w-8 text-gray-900" />;
      case 'block': return <BuildingOfficeIcon className="h-8 w-8 text-gray-900" />;
      case 'dwelling': return <HomeIcon className="h-8 w-8 text-gray-900" />;
      case 'tank-room': return <ArchiveBoxIcon className="h-8 w-8 text-gray-900" />;
      case 'intake-cupboard': return <BoltIcon className="h-8 w-8 text-gray-900" />;
      case 'community-hall': return <BuildingOffice2Icon className="h-8 w-8 text-gray-900" />;
      case 'concierge': return <UserGroupIcon className="h-8 w-8 text-gray-900" />;
      default: return <BuildingOfficeIcon className="h-8 w-8 text-gray-900" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'offline':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <CogIcon className="h-4 w-4" />;
      case 'inspection':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'repair':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'service':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
        <p className="text-gray-600">The requested property could not be found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending').length;
  const activeWorkOrders = workOrders.filter(wo => wo.status === 'in-progress').length;
  const operationalAssets = assets.filter(a => a.status === 'operational').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getPropertyIcon(property.type)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-600 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {property.location}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <CameraIcon className="h-4 w-4 mr-2" />
            Photos
          </Button>
          <Button>
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Schedule Visit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <CogIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
              <div className="text-sm text-gray-600">Assets</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg mr-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{operationalAssets}</div>
              <div className="text-sm text-gray-600">Operational</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg mr-3">
              <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-700">{pendingWorkOrders}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg mr-3">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{activeWorkOrders}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BuildingOfficeIcon },
            { key: 'assets', label: 'Assets', icon: CogIcon, count: assets.length },
            { key: 'work-orders', label: 'Work Orders', icon: ClipboardDocumentListIcon, count: workOrders.length },
            { key: 'history', label: 'Activity History', icon: ClockIcon, count: activities.length },
            { key: 'compliance', label: 'Compliance', icon: ShieldCheckIcon }
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count !== undefined && (
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{property.type.replace('-', ' ')}</p>
                </div>
                {property.classification && (
                  <div>
                    <p className="text-sm text-gray-600">Classification</p>
                    <p className="font-medium text-gray-900">{property.classification}</p>
                  </div>
                )}
                {property.facility_type && (
                  <div>
                    <p className="text-sm text-gray-600">Facility Type</p>
                    <p className="font-medium text-gray-900">{property.facility_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{new Date(property.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900 mt-1">{property.description}</p>
              </div>
              
              {/* Additional Metadata */}
              {Object.keys(property.metadata || {}).length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(property.metadata || {}).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-medium text-gray-900">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getStatusColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Asset Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Assets</span>
                  <span className="text-lg font-bold text-gray-900">{assets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Operational</span>
                  <span className="text-lg font-semibold text-green-600">{operationalAssets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Under Maintenance</span>
                  <span className="text-lg font-semibold text-yellow-600">{maintenanceAssets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offline</span>
                  <span className="text-lg font-semibold text-red-600">{assets.filter(a => a.status === 'offline').length}</span>
                </div>
              </div>
            </Card>

            {/* Work Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-lg font-bold text-gray-900">{workOrders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-lg font-semibold text-yellow-600">{pendingWorkOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-lg font-semibold text-blue-600">{activeWorkOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-semibold text-green-600">{workOrders.filter(wo => wo.status === 'completed').length}</span>
                </div>
              </div>
            </Card>

            {/* Compliance Status */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LGSR Certificate Current</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Safety Inspections</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">PPM Schedule</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Audit</span>
                  <span className="text-sm text-gray-900">Apr 15, 2024</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CogIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-600">{asset.asset_type}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>
              
              <div className="space-y-2">
                {asset.last_service && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Service:</span>
                    <span className="text-gray-900">{new Date(asset.last_service).toLocaleDateString()}</span>
                  </div>
                )}
                {asset.next_service && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Service:</span>
                    <span className="text-gray-900">{new Date(asset.next_service).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {assets.length === 0 && (
            <div className="col-span-full text-center py-12">
              <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assets found for this property</p>
            </div>
          )}
        </div>
      )}

      {/* Work Orders Tab */}
      {activeTab === 'work-orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {workOrders.map((workOrder) => (
              <Card key={workOrder.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workOrder.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{workOrder.type} Task</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(workOrder.priority)}`}>
                      {workOrder.priority.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                      {workOrder.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="text-gray-900">{workOrder.assigned_to}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{new Date(workOrder.created_at).toLocaleDateString()}</span>
                  </div>
                  {workOrder.due_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due:</span>
                      <span className={`${
                        new Date(workOrder.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {new Date(workOrder.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm">Update Status</Button>
                </div>
              </Card>
            ))}
          </div>
          
          {workOrders.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No work orders found for this property</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Checklist</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">LGSR Certificate Current</span>
                  </div>
                  <span className="text-xs text-green-600">Valid until Jan 2025</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Fire Safety Current</span>
                  </div>
                  <span className="text-xs text-green-600">Valid until Dec 2024</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">Water Hygiene Review</span>
                  </div>
                  <span className="text-xs text-yellow-600">Due in 30 days</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Schedule</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">Quarterly Inspection</p>
                  <p className="text-sm text-blue-600">Due: March 25, 2024</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Annual Service</p>
                  <p className="text-sm text-green-600">Due: July 15, 2024</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900">Safety Check</p>
                  <p className="text-sm text-purple-600">Due: September 1, 2024</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Compliance Rate</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">18</div>
                <div className="text-sm text-gray-600">Avg Response (min)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">4.8</div>
                <div className="text-sm text-gray-600">Satisfaction Rating</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}