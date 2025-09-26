import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  {
    name: 'Properties',
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Blocks', href: '/properties/blocks', icon: BuildingOfficeIcon },
      { name: 'Dwellings', href: '/properties/dwellings', icon: HomeIcon },
      { name: 'Plant Rooms', href: '/properties/plant-rooms', icon: CogIcon },
      { name: 'Tank Rooms', href: '/properties/tank-rooms', icon: BuildingOfficeIcon },
      { name: 'Intake Cupboards', href: '/properties/intake-cupboards', icon: CogIcon },
      { name: 'Community Halls', href: '/properties/community-halls', icon: BuildingOfficeIcon },
      { name: 'Concierge', href: '/properties/concierge', icon: UserGroupIcon },
    ]
  },
  {
    name: 'Assets',
    icon: CogIcon,
    children: [
      { name: 'Boilers', href: '/assets/boilers', icon: CogIcon },
      { name: 'Fresh Water Booster Pumps', href: '/assets/fresh-water-booster-pumps', icon: CogIcon },
      { name: 'Circulator Pumps', href: '/assets/circulator-pumps', icon: CogIcon },
      { name: 'Shunt Pumps', href: '/assets/shunt-pumps', icon: CogIcon },
      { name: 'Sump Pumps', href: '/assets/sump-pumps', icon: CogIcon },
      { name: 'Pressure Units', href: '/assets/pressure-units', icon: CogIcon },
      { name: 'Degassers', href: '/assets/degassers', icon: CogIcon },
      { name: 'Gas Valves', href: '/assets/gas-valves', icon: CogIcon },
      { name: 'Potable Vessels', href: '/assets/potable-vessels', icon: CogIcon },
      { name: 'Heating Vessels', href: '/assets/heating-vessels', icon: CogIcon },
      { name: 'Dry Risers', href: '/assets/dry-risers', icon: CogIcon },
      { name: 'Water Tanks', href: '/assets/water-tanks', icon: CogIcon },
      { name: 'Other', href: '/assets/other', icon: CogIcon },
    ]
  },
  {
    name: 'Work Orders',
    icon: ClipboardDocumentListIcon,
    children: [
      { name: 'PPM', href: '/work-orders/ppm', icon: ClipboardDocumentListIcon },
      { name: 'Planned Works', href: '/work-orders/planned-works', icon: ClipboardDocumentListIcon },
      { name: 'Reactive Repairs', href: '/work-orders/reactive-repairs', icon: ClipboardDocumentListIcon },
    ]
  },
  {
    name: 'Teams',
    icon: UserGroupIcon,
    children: [
      { name: 'DLO', href: '/teams/dlo', icon: UserGroupIcon },
      { name: 'Contractors', href: '/teams/contractors', icon: UserGroupIcon },
    ]
  },
  { name: 'Forms', href: '/forms', icon: DocumentTextIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'DRS Availability', href: '/drs-availability', icon: CalendarDaysIcon },
  { name: 'Parts & Stock Management', href: '/parts-stock', icon: CubeIcon },
  { name: 'Team Collaboration', href: '/collaboration', icon: ChatBubbleLeftRightIcon },
  { name: 'Data Management', href: '/data-management', icon: CircleStackIcon },
  { name: 'Field Worker Mobile', href: '/field-worker', icon: DevicePhoneMobileIcon },
];

function NavigationItem({ item, level = 0 }: { item: NavigationItem; level?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-100 transition-colors ${
            level > 0 ? 'pl-6' : ''
          }`}
        >
          <item.icon className="h-6 w-6 shrink-0" />
          <span className="flex-1 text-left">{item.name}</span>
          {isOpen ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavigationItem key={child.name} item={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.href!}
        className={({ isActive }) =>
          `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
            level > 0 ? 'pl-8' : ''
          } ${
            isActive
              ? 'bg-teal-200 text-teal-800 border-r-2 border-teal-600'
              : 'text-teal-700 hover:text-teal-800 hover:bg-teal-100'
          }`
        }
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {item.name}
      </NavLink>
    </li>
  );
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-teal-50 px-6 shadow-xl border-r border-teal-200">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <CogIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-teal-800">Mech Hub</h1>
            </div>
            <button
              type="button"
              className="lg:hidden p-1 text-teal-500 hover:text-teal-700"
              onClick={() => setOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => (
                    <NavigationItem key={item.name} item={item} />
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto">
                <button
                  onClick={signOut}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-teal-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}