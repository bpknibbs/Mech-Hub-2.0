import React, { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CogIcon, ClipboardDocumentListIcon, UserIcon, BuildingOfficeIcon, DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../contexts/SearchContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    setShowSearchResults,
    performSearch,
  } = useSearch();
  
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to close search
      if (event.key === 'Escape' && showSearchResults) {
        setShowSearchResults(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearchResults, setShowSearchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
    setShowSearchResults(true);
  };

  const handleResultClick = (result: any) => {
    navigate(result.url);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    inputRef.current?.focus();
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <CogIcon className="h-5 w-5" />;
      case 'work-order':
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
      case 'team-member':
        return <UserIcon className="h-5 w-5" />;
      case 'property':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      case 'form':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <TagIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'operational':
      case 'available':
      case 'completed':
        return 'text-green-600';
      case 'maintenance':
      case 'in-progress':
      case 'scheduled':
        return 'text-blue-600';
      case 'overdue':
      case 'critical':
        return 'text-red-600';
      case 'planning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative flex-1 max-w-lg">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-teal-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-teal-300 rounded-lg text-teal-800 placeholder-teal-500 bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          placeholder="Search assets, work orders, team members... (Ctrl+K)"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            setInputFocused(true);
            if (searchQuery) {
              setShowSearchResults(true);
            }
          }}
          onBlur={() => {
            setInputFocused(false);
            // Delay hiding results to allow clicks
            setTimeout(() => {
              if (!inputFocused) {
                setShowSearchResults(false);
              }
            }, 200);
          }}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-teal-400 hover:text-teal-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && (searchQuery.trim() || isSearching) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-teal-200 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-teal-600">
              <div className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mr-2"></div>
                Searching...
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-3 border-b border-teal-100">
                <p className="text-sm text-teal-600 font-medium">
                  Found {searchResults.length} results
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-teal-50 border-b border-teal-50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">{getResultTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-teal-800 truncate">
                            {result.title}
                          </p>
                          {result.status && (
                            <span className={`text-xs font-medium ml-2 ${getStatusColor(result.status)}`}>
                              {result.status.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-teal-600 truncate">
                          {result.subtitle}
                        </p>
                        <p className="text-xs text-teal-400 capitalize mt-1">
                          {result.type.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center">
              <p className="text-sm text-teal-600">No results found for "{searchQuery}"</p>
              <p className="text-xs text-teal-400 mt-1">
                Try searching for assets, work orders, team members, or forms
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}