import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'asset' | 'work-order' | 'team-member' | 'property' | 'form';
  url: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  category: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  performSearch: (query: string) => void;
  filterPresets: FilterPreset[];
  saveFilterPreset: (name: string, filters: Record<string, any>, category: string) => void;
  deleteFilterPreset: (id: string) => void;
  applyFilterPreset: (preset: FilterPreset) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([
    {
      id: '1',
      name: 'Overdue PPM Tasks',
      filters: { status: 'overdue', type: 'ppm' },
      category: 'work-orders'
    },
    {
      id: '2',
      name: 'Critical Assets',
      filters: { status: 'maintenance', priority: 'high' },
      category: 'assets'
    },
    {
      id: '3',
      name: 'Available Team Members',
      filters: { status: 'available' },
      category: 'team'
    },
    {
      id: '4',
      name: 'Gas Safe Engineers',
      filters: { certification: 'gas-safe' },
      category: 'team'
    },
    {
      id: '5',
      name: 'This Month LGSR',
      filters: { type: 'lgsr', dateRange: 'this-month' },
      category: 'forms'
    }
  ]);

  // Mock search data - in real app, this would come from your database
  const mockData: SearchResult[] = [
    // Assets
    { id: 'blr-001', title: 'Main Building Boiler #1', subtitle: 'Block A Plant Room • Viessmann', type: 'asset', url: '/assets/boilers', status: 'operational' },
    { id: 'fwp-001', title: 'Fresh Water Booster Pump', subtitle: 'Block A Plant Room • Grundfos', type: 'asset', url: '/assets/fresh-water-booster-pumps', status: 'operational' },
    { id: 'cp-001', title: 'Primary Heating Circuit Pump', subtitle: 'Block A Plant Room • Grundfos', type: 'asset', url: '/assets/circulator-pumps', status: 'operational' },
    
    // Work Orders
    { id: 'ppm-001', title: 'Boiler Annual Service - BLR-001', subtitle: 'PPM Task • Due Apr 15, 2024', type: 'work-order', url: '/work-orders/ppm', status: 'scheduled' },
    { id: 'rr-001', title: 'Boiler Not Igniting - BLR-002', subtitle: 'Reactive Repair • Critical Priority', type: 'work-order', url: '/work-orders/reactive-repairs', status: 'in-progress' },
    { id: 'pw-001', title: 'Heating System Upgrade - Block A', subtitle: 'Planned Work • £25,000 Budget', type: 'work-order', url: '/work-orders/planned-works', status: 'planning' },
    
    // Team Members
    { id: 'team-001', title: 'James Wilson', subtitle: 'Senior Heating Engineer • Gas Safe Certified', type: 'team-member', url: '/teams/dlo', status: 'on-duty' },
    { id: 'team-002', title: 'Sarah Mitchell', subtitle: 'Water Systems Specialist • Available', type: 'team-member', url: '/teams/dlo', status: 'available' },
    { id: 'team-003', title: 'Emma Thompson', subtitle: 'Maintenance Supervisor • On Duty', type: 'team-member', url: '/teams/dlo', status: 'on-duty' },
    
    // Properties
    { id: 'pr-001', title: 'Main Building Plant Room', subtitle: 'Block A - Basement Level • Fresh Water', type: 'property', url: '/properties/plant-rooms', status: 'active' },
    { id: 'pr-002', title: 'Community Hall Heating', subtitle: 'Community Center • Gas Heat Generating', type: 'property', url: '/properties/plant-rooms', status: 'active' },
    
    // Forms
    { id: 'form-001', title: 'Boiler Safety Inspection', subtitle: 'Safety Form Template • 4 Questions', type: 'form', url: '/forms', status: 'active' },
    { id: 'form-002', title: 'LGSR Form Submission', subtitle: 'Main Building - Completed', type: 'form', url: '/forms', status: 'completed' }
  ];

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = mockData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8); // Limit results
      
      setSearchResults(results);
      setIsSearching(false);
    }, 200);
  }, []);

  const saveFilterPreset = useCallback((name: string, filters: Record<string, any>, category: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters,
      category
    };
    setFilterPresets(prev => [...prev, newPreset]);
  }, []);

  const deleteFilterPreset = useCallback((id: string) => {
    setFilterPresets(prev => prev.filter(preset => preset.id !== id));
  }, []);

  const applyFilterPreset = useCallback((preset: FilterPreset) => {
    // This would be implemented by individual pages that support filtering
    console.log('Applying filter preset:', preset);
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    performSearch,
    filterPresets,
    saveFilterPreset,
    deleteFilterPreset,
    applyFilterPreset,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}