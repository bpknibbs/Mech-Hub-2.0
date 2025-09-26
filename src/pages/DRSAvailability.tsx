import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon, UserGroupIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function DRSAvailability() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*');

      if (error) {
        console.error('Error fetching team members:', error.message);
      } else {
        setTeamMembers(data);
      }
      setLoading(false);
    };

    fetchTeamMembers();
  }, []);

  const today = new Date();
  const todayMembers = teamMembers.filter(member => member.status !== 'On Leave'); // Assuming you'll have a status field
  const onDutyCount = todayMembers.filter(member => member.status === 'On Duty').length;
  const availableCount = todayMembers.filter(member => member.status === 'Available').length;
  const onLeaveCount = teamMembers.filter(member => member.status === 'On Leave').length;
  const totalCount = teamMembers.length;
  const utilizationRate = totalCount > 0 ? ((onDutyCount / totalCount) * 100).toFixed(0) : 0;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DRS (Dynamic Resource Scheduler) Availability</h1>
          <p className="mt-2 text-gray-600">
            Manage team availability, schedule resources, and optimize workforce allocation
          </p>
        </div>
        <Button>
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Schedule Resources
        </Button>
      </div>

      {/* Current Day Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule - {today.toLocaleDateString()}</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">All Team Members</h4>
            <div className="space-y-2">
              {teamMembers.map((person) => (
                <div key={person.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-600">{person.position}</p>
                      {person.currentTask && <p className="text-xs text-blue-600">{person.currentTask}</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      person.status === 'On Duty' ? 'bg-green-100 text-green-800' :
                      person.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {person.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Availability Calendar (This component needs a more complex back-end to support the calendar view, so I will leave this as a mock for now) */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sun</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((person, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {person.name}
                  </td>
                  {/* Mock schedule for each day */}
                  {['M', 'M', 'M', 'M', 'M', 'OFF', 'OFF'].map((shift, dayIndex) => (
                    <td key={dayIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        shift === 'M' ? 'bg-blue-100 text-blue-800' :
                        shift === 'D' ? 'bg-green-100 text-green-800' :
                        shift === 'E' ? 'bg-purple-100 text-purple-800' :
                        shift === 'N' ? 'bg-indigo-100 text-indigo-800' :
                        shift === 'ON-CALL' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {shift}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">M</span>
            <span>Morning</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">D</span>
            <span>Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">E</span>
            <span>Evening</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">ON-CALL</span>
            <span>On-Call</span>
          </div>
        </div>
      </Card>

      {/* Resource Allocation Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Availability</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Now</span>
              <span className="text-2xl font-bold text-green-600">{availableCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Duty</span>
              <span className="text-lg font-semibold text-blue-600">{onDutyCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Leave</span>
              <span className="text-lg font-semibold text-yellow-600">{onLeaveCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilization Rate</span>
              <span className="text-lg font-semibold text-purple-600">{utilizationRate}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Coverage</h3>
          <div className="space-y-3">
            {/* The data for this part is not available in the Supabase schema, so this section remains as mock for now */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gas Safe Engineers</span>
              <span className="text-sm font-medium text-gray-900">3/3 ✓</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Electrical Technicians</span>
              <span className="text-sm font-medium text-yellow-600">1/2 ⚠</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Water Specialists</span>
              <span className="text-sm font-medium text-gray-900">2/2 ✓</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">General Maintenance</span>
              <span className="text-sm font-medium text-gray-900">4/4 ✓</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Response</span>
              <span className="text-sm font-medium text-gray-900">2/2 ✓</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg flex items-start space-x-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Coverage Gap</p>
                <p className="text-xs text-red-600">Electrical coverage reduced - Michael Chen on leave</p>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg flex items-start space-x-3">
              <ClockIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Schedule Reminder</p>
                <p className="text-xs text-yellow-600">Night shift needs coverage confirmation for weekend</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg flex items-start space-x-3">
              <UserGroupIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Team Update</p>
                <p className="text-xs text-blue-600">New contractor training scheduled for next week</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}