import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  BookOpenIcon, 
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  TagIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useKnowledgeBase } from '../../contexts/KnowledgeBaseContext';

interface KnowledgeBaseProps {
  className?: string;
}

export default function KnowledgeBase({ className = '' }: KnowledgeBaseProps) {
  const {
    procedures,
    troubleshootingGuides,
    searchResults,
    isSearching,
    searchProcedures,
    getProceduresByAsset,
    incrementUsage,
    rateProcedure,
    getPopularProcedures,
    getRecentlyUpdated
  } = useKnowledgeBase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'recent'>('search');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filters: any = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    if (selectedAssetType !== 'all') filters.asset_type = selectedAssetType;
    searchProcedures(query, filters);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'safety': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'troubleshooting': return <BookOpenIcon className="h-4 w-4" />;
      default: return <BookOpenIcon className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const displayItems = (() => {
    switch (activeTab) {
      case 'popular':
        return getPopularProcedures();
      case 'recent':
        return getRecentlyUpdated();
      default:
        return searchQuery ? searchResults : [...procedures, ...troubleshootingGuides];
    }
  })();

  const categories = ['all', 'maintenance', 'safety', 'troubleshooting', 'installation', 'emergency'];
  const assetTypes = ['all', 'Boiler', 'Pump', 'Valve', 'Tank', 'Vessel'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search procedures, troubleshooting guides..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Procedure
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedAssetType}
            onChange={(e) => setSelectedAssetType(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {assetTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Asset Types' : type}
              </option>
            ))}
          </select>

          {/* Tab Controls */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'search' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'popular' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'recent' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Recent
            </button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isSearching ? (
          <Card className="p-8 text-center col-span-full">
            <div className="inline-flex items-center">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-3"></div>
              Searching knowledge base...
            </div>
          </Card>
        ) : (
          displayItems.map(item => (
            <Card key={item.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" hover>
              <div onClick={() => setSelectedProcedure(item)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {'category' in item ? getCategoryIcon(item.category) : <BookOpenIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {'description' in item ? item.description : `${item.symptoms?.length || 0} symptoms covered`}
                      </p>
                    </div>
                  </div>
                  {renderStars(item.rating)}
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  {'difficulty_level' in item && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty_level)}`}>
                      {item.difficulty_level}
                    </span>
                  )}
                  {'estimated_time' in item && (
                    <span className="inline-flex items-center text-xs text-gray-600">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {item.estimated_time}
                    </span>
                  )}
                  <span className="inline-flex items-center text-xs text-gray-600">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    {item.usage_count} uses
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {item.asset_types.slice(0, 3).map(type => (
                    <span key={type} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {type}
                    </span>
                  ))}
                  {item.asset_types.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      +{item.asset_types.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center text-xs text-blue-600">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button size="sm">
                    <BookOpenIcon className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        {!isSearching && displayItems.length === 0 && (
          <Card className="p-12 text-center col-span-full">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No results found' : 'No procedures available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No procedures found for "${searchQuery}". Try different keywords or filters.`
                : 'Start building your knowledge base by adding maintenance procedures and troubleshooting guides.'
              }
            </p>
          </Card>
        )}
      </div>

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900">{selectedProcedure.title}</h3>
                <p className="text-sm text-gray-600">
                  {'description' in selectedProcedure ? selectedProcedure.description : 'Troubleshooting Guide'}
                </p>
              </div>
              <button
                onClick={() => setSelectedProcedure(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {'steps' in selectedProcedure ? (
              <div className="space-y-6">
                {/* Safety Warnings */}
                {selectedProcedure.safety_warnings?.length > 0 && (
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <h4 className="font-medium text-red-900">Safety Warnings</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProcedure.safety_warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm text-red-700">{warning}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Required Tools */}
                {selectedProcedure.required_tools?.length > 0 && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Required Tools & Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcedure.required_tools.map((tool: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Procedure Steps */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Procedure Steps</h4>
                  {selectedProcedure.steps?.map((step: any, index: number) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-2">{step.title}</h5>
                          <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                          {step.warnings?.length > 0 && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex items-center space-x-2 mb-1">
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium text-yellow-900">Warnings</span>
                              </div>
                              <ul className="list-disc list-inside">
                                {step.warnings.map((warning: string, idx: number) => (
                                  <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.notes?.length > 0 && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">Notes:</span>
                              <ul className="list-disc list-inside mt-1">
                                {step.notes.map((note: string, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-600">{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {step.image_urls?.length > 0 && (
                            <div className="flex space-x-2 mt-3">
                              {step.image_urls.map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Step ${step.step_number} illustration`}
                                  className="w-20 h-20 object-cover rounded border border-gray-300"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Symptoms */}
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-3">Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProcedure.symptoms?.map((symptom: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Possible Causes */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Possible Causes & Actions</h4>
                  {selectedProcedure.possible_causes?.map((cause: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-medium text-gray-900">{cause.cause}</h5>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            cause.likelihood === 'high' ? 'bg-red-100 text-red-800' :
                            cause.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {cause.likelihood} likelihood
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            cause.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            cause.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cause.severity}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Actions:</span>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            {cause.actions?.map((action: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">{action}</li>
                            ))}
                          </ol>
                        </div>

                        {cause.required_parts?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Required Parts:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cause.required_parts.map((part: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {cause.estimated_time && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Estimated time: {cause.estimated_time}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    incrementUsage(selectedProcedure.id);
                    setSelectedProcedure(null);
                  }}
                >
                  Mark as Used
                </Button>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Rate this:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => rateProcedure(selectedProcedure.id, rating)}
                      className="text-gray-300 hover:text-yellow-400"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setSelectedProcedure(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{procedures.length}</div>
          <div className="text-sm text-gray-600">Procedures</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{troubleshootingGuides.length}</div>
          <div className="text-sm text-gray-600">Troubleshooting Guides</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {getPopularProcedures().reduce((sum, item) => sum + item.usage_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Uses</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {procedures.filter(p => p.rating >= 4.5).length}
          </div>
          <div className="text-sm text-gray-600">Highly Rated</div>
        </Card>
      </div>
    </div>
  );
}