import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SearchProvider } from './contexts/SearchContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { AutomationProvider } from './contexts/AutomationContext';
import { ComplianceProvider } from './contexts/ComplianceContext';
import { TaskWorkflowProvider } from './contexts/TaskWorkflowContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { KnowledgeBaseProvider } from './contexts/KnowledgeBaseContext';
import { SkillsMatrixProvider } from './contexts/SkillsMatrixContext';
import { DataOperationsProvider } from './contexts/DataOperationsContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import Reports from './pages/Reports';
import Collaboration from './pages/Collaboration';
import DataManagement from './pages/DataManagement';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Properties Pages
import Blocks from './pages/Properties/Blocks';
import Dwellings from './pages/Properties/Dwellings';
import PlantRooms from './pages/Properties/PlantRooms';
import PropertyDetail from './pages/Properties/PropertyDetail';
import TankRooms from './pages/Properties/TankRooms';
import IntakeCupboards from './pages/Properties/IntakeCupboards';
import CommunityHalls from './pages/Properties/CommunityHalls';
import Concierge from './pages/Properties/Concierge';

// Asset Pages
import Boilers from './pages/Assets/Boilers';
import FreshWaterBoosterPumps from './pages/Assets/FreshWaterBoosterPumps';
import CirculatorPumps from './pages/Assets/CirculatorPumps';
import ShuntPumps from './pages/Assets/ShuntPumps';
import SumpPumps from './pages/Assets/SumpPumps';
import PressureUnits from './pages/Assets/PressureUnits';
import Degassers from './pages/Assets/Degassers';
import GasValves from './pages/Assets/GasValves';
import PotableVessels from './pages/Assets/PotableVessels';
import HeatingVessels from './pages/Assets/HeatingVessels';
import DryRisers from './pages/Assets/DryRisers';
import WaterTanks from './pages/Assets/WaterTanks';
import OtherAssets from './pages/Assets/Other';

// Work Order Pages
import PPM from './pages/WorkOrders/PPM';
import PlannedWorks from './pages/WorkOrders/PlannedWorks';
import ReactiveRepairs from './pages/WorkOrders/ReactiveRepairs';

// Team Pages
import DLO from './pages/Teams/DLO';
import Contractors from './pages/Teams/Contractors';

// Other Pages
import DRSAvailability from './pages/DRSAvailability';
import PartsStock from './pages/PartsStock';
import FieldWorker from './pages/Mobile/FieldWorker';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Routes><Route path="*" element={<Login />} /></Routes>;
  }

  // Define routes that should not use the main layout
  const noLayoutRoutes = ['/field-worker'];
  const useLayout = !noLayoutRoutes.includes(location.pathname);

  const routes = (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      
      {/* Properties Routes */}
      <Route path="/properties/blocks" element={<Blocks />} />
      <Route path="/properties/dwellings" element={<Dwellings />} />
      <Route path="/properties/plant-rooms" element={<PlantRooms />} />
      <Route path="/properties/detail/:id" element={<PropertyDetail />} />
      <Route path="/properties/tank-rooms" element={<TankRooms />} />
      <Route path="/properties/intake-cupboards" element={<IntakeCupboards />} />
      <Route path="/properties/community-halls" element={<CommunityHalls />} />
      <Route path="/properties/concierge" element={<Concierge />} />
      
      {/* Asset Routes */}
      <Route path="/assets/boilers" element={<Boilers />} />
      <Route path="/assets/fresh-water-booster-pumps" element={<FreshWaterBoosterPumps />} />
      <Route path="/assets/circulator-pumps" element={<CirculatorPumps />} />
      <Route path="/assets/shunt-pumps" element={<ShuntPumps />} />
      <Route path="/assets/sump-pumps" element={<SumpPumps />} />
      <Route path="/assets/pressure-units" element={<PressureUnits />} />
      <Route path="/assets/degassers" element={<Degassers />} />
      <Route path="/assets/gas-valves" element={<GasValves />} />
      <Route path="/assets/potable-vessels" element={<PotableVessels />} />
      <Route path="/assets/heating-vessels" element={<HeatingVessels />} />
      <Route path="/assets/dry-risers" element={<DryRisers />} />
      <Route path="/assets/water-tanks" element={<WaterTanks />} />
      <Route path="/assets/other" element={<OtherAssets />} />
      
      {/* Work Order Routes */}
      <Route path="/work-orders/ppm" element={<PPM />} />
      <Route path="/work-orders/planned-works" element={<PlannedWorks />} />
      <Route path="/work-orders/reactive-repairs" element={<ReactiveRepairs />} />
      
      {/* Team Routes */}
      <Route path="/teams/dlo" element={<DLO />} />
      <Route path="/teams/contractors" element={<Contractors />} />
      
      <Route path="/forms" element={<Forms />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/drs-availability" element={<DRSAvailability />} />
      <Route path="/parts-stock" element={<PartsStock />} />
      <Route path="/field-worker" element={<FieldWorker />} />
      <Route path="/collaboration" element={<Collaboration />} />
      <Route path="/data-management" element={<DataManagement />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return useLayout ? <Layout>{routes}</Layout> : routes;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ComplianceProvider>
            <AutomationProvider>
              <DataOperationsProvider>
                <TaskWorkflowProvider>
                  <MessagingProvider>
                    <KnowledgeBaseProvider>
                      <SkillsMatrixProvider>
                        <DashboardProvider>
                          <SearchProvider>
                            <div className="min-h-screen bg-white">
                              <AppRoutes />
                            </div>
                          </SearchProvider>
                        </DashboardProvider>
                      </SkillsMatrixProvider>
                    </KnowledgeBaseProvider>
                  </MessagingProvider>
                </TaskWorkflowProvider>
              </DataOperationsProvider>
            </AutomationProvider>
          </ComplianceProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;