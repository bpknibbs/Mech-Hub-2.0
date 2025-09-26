import React, { createContext, useContext, useState } from 'react';

interface Procedure {
  id: string;
  title: string;
  category: 'maintenance' | 'safety' | 'troubleshooting' | 'installation' | 'emergency';
  asset_types: string[];
  description: string;
  steps: ProcedureStep[];
  safety_warnings: string[];
  required_tools: string[];
  estimated_time: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  attachments?: Attachment[];
  rating: number;
  usage_count: number;
}

interface ProcedureStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  warnings?: string[];
  notes?: string[];
  image_urls?: string[];
  video_url?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document';
  url: string;
  size: number;
}

interface TroubleshootingGuide {
  id: string;
  title: string;
  asset_types: string[];
  symptoms: string[];
  possible_causes: CauseAction[];
  created_by: string;
  created_at: string;
  tags: string[];
  rating: number;
  usage_count: number;
}

interface CauseAction {
  cause: string;
  likelihood: 'high' | 'medium' | 'low';
  severity: 'critical' | 'major' | 'minor';
  actions: string[];
  required_parts?: string[];
  estimated_time?: string;
}

interface SearchFilter {
  category?: string;
  asset_type?: string;
  difficulty?: string;
  tags?: string[];
  text?: string;
}

interface KnowledgeBaseContextType {
  procedures: Procedure[];
  troubleshootingGuides: TroubleshootingGuide[];
  searchResults: (Procedure | TroubleshootingGuide)[];
  isSearching: boolean;
  searchProcedures: (query: string, filters?: SearchFilter) => void;
  getProceduresByAsset: (assetType: string) => Procedure[];
  getTroubleshootingBySymptoms: (symptoms: string[]) => TroubleshootingGuide[];
  addProcedure: (procedure: Omit<Procedure, 'id' | 'created_at' | 'updated_at' | 'rating' | 'usage_count'>) => void;
  updateProcedure: (id: string, updates: Partial<Procedure>) => void;
  deleteProcedure: (id: string) => void;
  rateProcedure: (id: string, rating: number) => void;
  incrementUsage: (id: string) => void;
  getPopularProcedures: () => (Procedure | TroubleshootingGuide)[];
  getRecentlyUpdated: () => Procedure[];
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);

export function KnowledgeBaseProvider({ children }: { children: React.ReactNode }) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [troubleshootingGuides, setTroubleshootingGuides] = useState<TroubleshootingGuide[]>([]);
  const [searchResults, setSearchResults] = useState<(Procedure | TroubleshootingGuide)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = () => {
    // Mock procedures data
    const mockProcedures: Procedure[] = [
      {
        id: '1',
        title: 'Boiler Annual Service Procedure',
        category: 'maintenance',
        asset_types: ['Boiler', 'Gas Boiler'],
        description: 'Complete annual maintenance service for gas boilers including safety checks and efficiency testing',
        steps: [
          {
            id: '1',
            step_number: 1,
            title: 'Safety Preparation',
            description: 'Isolate gas supply and electrical connections. Ensure adequate ventilation.',
            warnings: ['Always use gas detector before starting work', 'Check for gas leaks before proceeding'],
            image_urls: ['https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=300']
          },
          {
            id: '2',
            step_number: 2,
            title: 'Visual Inspection',
            description: 'Check for corrosion, leaks, and general condition of all components.',
            notes: ['Document any findings with photos', 'Check manufacturer date and service history'],
            image_urls: ['https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=300']
          },
          {
            id: '3',
            step_number: 3,
            title: 'Clean Heat Exchanger',
            description: 'Remove and clean primary heat exchanger. Check for scaling or blockages.',
            warnings: ['Wear appropriate PPE', 'Handle components carefully to avoid damage']
          },
          {
            id: '4',
            step_number: 4,
            title: 'Test and Calibrate',
            description: 'Test all safety devices, calibrate controls, and verify efficiency.',
            notes: ['Record all test results', 'Update maintenance log']
          }
        ],
        safety_warnings: [
          'Gas Safe registered engineer required',
          'Use calibrated gas detector',
          'Ensure proper ventilation'
        ],
        required_tools: [
          'Gas analyzer',
          'Flue gas analyzer',
          'Digital manometer',
          'Boiler service kit',
          'PPE equipment'
        ],
        estimated_time: '4-6 hours',
        difficulty_level: 'advanced',
        created_by: 'technical-lead',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-03-01T14:30:00Z',
        tags: ['boiler', 'annual', 'gas-safe', 'lgsr'],
        rating: 4.8,
        usage_count: 45
      },
      {
        id: '2',
        title: 'Fresh Water Pump Maintenance',
        category: 'maintenance',
        asset_types: ['Fresh Water Booster Pump', 'Circulator Pump'],
        description: 'Routine maintenance procedure for water pumps including bearing service and impeller inspection',
        steps: [
          {
            id: '1',
            step_number: 1,
            title: 'System Isolation',
            description: 'Isolate electrical supply and close isolation valves on suction and discharge.',
            warnings: ['Ensure electrical isolation is locked off', 'Drain system before disassembly']
          },
          {
            id: '2',
            step_number: 2,
            title: 'Pump Disassembly',
            description: 'Remove pump coupling and disassemble pump casing.',
            notes: ['Note impeller wear patterns', 'Check shaft alignment']
          },
          {
            id: '3',
            step_number: 3,
            title: 'Component Inspection',
            description: 'Inspect impeller, volute, and bearing condition.',
            image_urls: ['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=300']
          },
          {
            id: '4',
            step_number: 4,
            title: 'Reassembly and Testing',
            description: 'Reassemble pump, restore services, and test operation.',
            notes: ['Record performance readings', 'Update maintenance schedule']
          }
        ],
        safety_warnings: [
          'Electrical isolation required',
          'Use appropriate lifting equipment',
          'Check for residual pressure'
        ],
        required_tools: [
          'Pump pulling gear',
          'Bearing puller',
          'Torque wrench',
          'Dial gauge',
          'Multimeter'
        ],
        estimated_time: '2-3 hours',
        difficulty_level: 'intermediate',
        created_by: 'sarah-mitchell',
        created_at: '2024-02-10T09:00:00Z',
        updated_at: '2024-02-15T16:20:00Z',
        tags: ['pump', 'water', 'quarterly', 'mechanical'],
        rating: 4.6,
        usage_count: 28
      }
    ];

    const mockTroubleshooting: TroubleshootingGuide[] = [
      {
        id: '1',
        title: 'Boiler Not Igniting Troubleshooting',
        asset_types: ['Boiler', 'Gas Boiler'],
        symptoms: ['No ignition', 'Pilot light out', 'Error code displayed', 'Cold radiators'],
        possible_causes: [
          {
            cause: 'Gas supply issue',
            likelihood: 'high',
            severity: 'critical',
            actions: [
              'Check gas meter readings',
              'Verify gas isolation valves are open',
              'Test gas pressure at appliance',
              'Check for gas leaks'
            ],
            required_parts: ['Gas pressure gauge'],
            estimated_time: '30 minutes'
          },
          {
            cause: 'Ignition electrode fault',
            likelihood: 'medium',
            severity: 'major',
            actions: [
              'Inspect electrode condition',
              'Check electrode gap (3-4mm)',
              'Clean electrode surfaces',
              'Test ignition spark'
            ],
            required_parts: ['Ignition electrode', 'Electrode lead'],
            estimated_time: '45 minutes'
          },
          {
            cause: 'Control board failure',
            likelihood: 'low',
            severity: 'major',
            actions: [
              'Check control board LED indicators',
              'Test input/output signals',
              'Replace control board if faulty',
              'Reprogram parameters'
            ],
            required_parts: ['Control board', 'Programming cable'],
            estimated_time: '2 hours'
          }
        ],
        created_by: 'james-wilson',
        created_at: '2024-01-20T11:00:00Z',
        tags: ['boiler', 'ignition', 'gas', 'troubleshooting'],
        rating: 4.9,
        usage_count: 67
      }
    ];

    setProcedures(mockProcedures);
    setTroubleshootingGuides(mockTroubleshooting);
  };

  const searchProcedures = (query: string, filters?: SearchFilter) => {
    setIsSearching(true);
    
    setTimeout(() => {
      const allItems = [...procedures, ...troubleshootingGuides];
      
      const results = allItems.filter(item => {
        const matchesQuery = !query || 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          ('description' in item ? item.description.toLowerCase().includes(query.toLowerCase()) : false) ||
          item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        const matchesFilters = !filters || (
          (!filters.category || ('category' in item && item.category === filters.category)) &&
          (!filters.asset_type || item.asset_types.includes(filters.asset_type)) &&
          (!filters.difficulty || ('difficulty_level' in item && item.difficulty_level === filters.difficulty)) &&
          (!filters.tags || filters.tags.every(tag => item.tags.includes(tag)))
        );

        return matchesQuery && matchesFilters;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const getProceduresByAsset = (assetType: string): Procedure[] => {
    return procedures.filter(proc => proc.asset_types.includes(assetType));
  };

  const getTroubleshootingBySymptoms = (symptoms: string[]): TroubleshootingGuide[] => {
    return troubleshootingGuides.filter(guide =>
      symptoms.some(symptom => 
        guide.symptoms.some(guideSymptom =>
          guideSymptom.toLowerCase().includes(symptom.toLowerCase())
        )
      )
    );
  };

  const addProcedure = (procedure: Omit<Procedure, 'id' | 'created_at' | 'updated_at' | 'rating' | 'usage_count'>) => {
    const newProcedure: Procedure = {
      ...procedure,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rating: 0,
      usage_count: 0
    };
    setProcedures(prev => [newProcedure, ...prev]);
  };

  const updateProcedure = (id: string, updates: Partial<Procedure>) => {
    setProcedures(prev => prev.map(proc => 
      proc.id === id ? { ...proc, ...updates, updated_at: new Date().toISOString() } : proc
    ));
  };

  const deleteProcedure = (id: string) => {
    setProcedures(prev => prev.filter(proc => proc.id !== id));
  };

  const rateProcedure = (id: string, rating: number) => {
    setProcedures(prev => prev.map(proc => 
      proc.id === id ? { ...proc, rating } : proc
    ));
  };

  const incrementUsage = (id: string) => {
    setProcedures(prev => prev.map(proc => 
      proc.id === id ? { ...proc, usage_count: proc.usage_count + 1 } : proc
    ));
  };

  const getPopularProcedures = (): (Procedure | TroubleshootingGuide)[] => {
    const allItems = [...procedures, ...troubleshootingGuides];
    return allItems.sort((a, b) => b.usage_count - a.usage_count).slice(0, 5);
  };

  const getRecentlyUpdated = (): Procedure[] => {
    return procedures
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  };

  const value = {
    procedures,
    troubleshootingGuides,
    searchResults,
    isSearching,
    searchProcedures,
    getProceduresByAsset,
    getTroubleshootingBySymptoms,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    rateProcedure,
    incrementUsage,
    getPopularProcedures,
    getRecentlyUpdated,
  };

  return (
    <KnowledgeBaseContext.Provider value={value}>
      {children}
    </KnowledgeBaseContext.Provider>
  );
}

export function useKnowledgeBase() {
  const context = useContext(KnowledgeBaseContext);
  if (context === undefined) {
    throw new Error('useKnowledgeBase must be used within a KnowledgeBaseProvider');
  }
  return context;
}