import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../contexts/SearchContext';
import Button from '../UI/Button';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  availableFilters: FilterConfig[];
  currentFilters: Record<string, any>;
  category?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'status' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export default function AdvancedFilters({
  onFiltersChange,
  availableFilters,
  currentFilters,
  category = 'general'
}: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const { filterPresets, saveFilterPreset, applyFilterPreset, deleteFilterPreset } = useSearch();

  const categoryPresets = filterPresets.filter(preset => preset.category === category);
  const hasActiveFilters = Object.keys(currentFilters).some(key => currentFilters[key]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...currentFilters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const handleSavePreset = () => {
    if (presetName.trim() && hasActiveFilters) {
      saveFilterPreset(presetName.trim(), currentFilters, category);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleApplyPreset = (preset: any) => {
    onFiltersChange(preset.filters);
    applyFilterPreset(preset);
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = currentFilters[filter.key] || '';

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'status':
        const statusOptions = [
          { value: 'operational', label: 'Operational' },
          { value: 'maintenance', label: 'Under Maintenance' },
          { value: 'available', label: 'Available' },
          { value: 'on-duty', label: 'On Duty' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'pending', label: 'Pending' },
        ];
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full rounded-md border-teal-300 bg-teal-50 text-teal-800 placeholder-teal-500 focus:border-teal-500 focus:ring-teal-500"
          />
        );
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`${hasActiveFilters ? 'ring-2 ring-teal-500' : ''}`}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs">
              {Object.keys(currentFilters).length}
            </span>
          )}
        </Button>

        {/* Quick Filter Presets */}
        {categoryPresets.length > 0 && (
          <div className="flex items-center space-x-2">
            {categoryPresets.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 text-sm bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-teal-600 hover:text-teal-800 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 z-40 mt-2 bg-white rounded-lg shadow-lg border border-teal-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-teal-800">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-teal-400 hover:text-teal-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {availableFilters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-teal-700 mb-1">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          {/* Saved Presets */}
          {categoryPresets.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-teal-700 mb-3">Saved Filter Presets</h4>
              <div className="flex flex-wrap gap-2">
                {categoryPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center bg-teal-50 rounded-md border border-teal-200"
                  >
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-2 text-sm text-teal-700 hover:text-teal-900 flex items-center"
                    >
                      <BookmarkIcon className="h-4 w-4 mr-1" />
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deleteFilterPreset(preset.id)}
                      className="px-2 py-2 text-teal-400 hover:text-red-600 border-l border-teal-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Preset */}
          <div className="flex items-center justify-between pt-4 border-t border-teal-200">
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <>
                  {!showSavePreset ? (
                    <button
                      onClick={() => setShowSavePreset(true)}
                      className="text-sm text-teal-600 hover:text-teal-800 underline"
                    >
                      Save as preset
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Preset name"
                        className="px-3 py-1 text-sm border border-teal-300 rounded-md bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSavePreset();
                          } else if (e.key === 'Escape') {
                            setShowSavePreset(false);
                            setPresetName('');
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleSavePreset}>
                        Save
                      </Button>
                      <button
                        onClick={() => {
                          setShowSavePreset(false);
                          setPresetName('');
                        }}
                        className="text-teal-400 hover:text-teal-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}