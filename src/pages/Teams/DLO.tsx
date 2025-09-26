import React, { useEffect, useState, useMemo } from 'react';
import { PlusIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import AdvancedFilters from '../../components/Search/AdvancedFilters';
import BulkOperations, { useBulkSelection } from '../../components/DataOperations/BulkOperations';
import ExportButton from '../../components/DataOperations/ExportButton';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function DLO() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { selectedIds, isSelected, toggleSelection } = useBulkSelection('team');
  const [dloMembers, setDloMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    status: 'Available',
    phone: '',
    experience: '',
    skills: [],
    type: 'DLO',
  });

  useEffect(() => {
    fetchDloMembers();
  }, []);

  const fetchDloMembers = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('type', 'DLO');

    if (error) {
      console.error('Error fetching DLO members:', error.message);
    } else {
      setDloMembers(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase
      .from('teams')
      .insert([formData]);

    if (error) {
      console.error('Error adding DLO member:', error.message);
    } else {
      fetchDloMembers();
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        position: '',
        department: '',
        status: 'Available',
        phone: '',
        experience: '',
        skills: [],
        type: 'DLO',
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
      key: 'department',
      label: 'Department',
      type: 'select' as const,
      options: [
        { value: 'Mechanical Services', label: 'Mechanical Services' },
        { value: 'Plumbing & Water', label: 'Plumbing & Water' },
        { value: 'Electrical Services', label: 'Electrical Services' },
        { value: 'General Maintenance', label: 'General Maintenance' },
      ]
    },
    {
      key: 'skills',
      label: 'Skills',
      type: 'text' as const,
      placeholder: 'Search by skill or certification'
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text' as const,
      placeholder: 'Team member name'
    }
  ];

  const filteredMembers = useMemo(() => {
    return dloMembers.filter(member => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'status':
            return member.status.toLowerCase().replace(' ', '-') === value.toLowerCase();
          case 'department':
            return member.department === value;
          case 'skills':
            return member.skills.some(skill => 
              skill.toLowerCase().includes(value.toLowerCase())
            );
          case 'name':
            return member.name.toLowerCase().includes(value.toLowerCase());
          default:
            return true;
        }
      });
    });
  }, [filters, dloMembers]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DLO (Direct Labour Organization)</h1>
          <p className="mt-2 text-gray-600">
            Manage in-house maintenance team and direct labour staff
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add DLO Member
        </Button>
        <ExportButton 
          category="team" 
          items={filteredMembers}
          selectedItems={selectedIds}
        />
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New DLO Member</h3>
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
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
              <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={formData.skills.join(', ')} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Member
              </Button>
            </div>
          </form>
        </Card>
      )}

      <BulkOperations 
        category="team" 
        items={filteredMembers}
      />

      <AdvancedFilters
        onFiltersChange={setFilters}
        currentFilters={filters}
        availableFilters={filterConfig}
        category="team"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-6 hover:shadow-lg transition-all duration-200" hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.position}</p>
                  <p className="text-xs text-gray-500">{member.department}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                member.status === 'On Duty' ? 'bg-green-100 text-green-800' :
                member.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {member.phone}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience:</span>
                <span className="text-gray-900">{member.experience}</span>
              </div>
              {member.currentTask && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Task:</span>
                  <span className="text-gray-900">{member.currentTask}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills & Certifications</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button size="sm" variant="outline">
                View Schedule
              </Button>
              <Button size="sm">
                Assign Task
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total DLO Staff</span>
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Duty</span>
              <span className="text-lg font-semibold text-green-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available</span>
              <span className="text-lg font-semibold text-blue-600">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Leave</span>
              <span className="text-lg font-semibold text-yellow-600">2</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mechanical Services</span>
              <span className="text-gray-900">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plumbing & Water</span>
              <span className="text-gray-900">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Electrical Services</span>
              <span className="text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">General Maintenance</span>
              <span className="text-gray-900">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Management</span>
              <span className="text-gray-900">1</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasks Completed</span>
              <span className="text-lg font-bold text-green-600">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-lg font-semibold text-blue-600">18min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Rating</span>
              <span className="text-lg font-semibold text-yellow-600">4.7/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Efficiency</span>
              <span className="text-lg font-semibold text-green-600">94%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}