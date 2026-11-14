import { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ExplorerMode from './pages/ExplorerMode.jsx';
import PlannerMode from './pages/PlannerMode.jsx';
import './styles/dashboard.css';
import './components/lunar/lunar-scene.css';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [profile, setProfile] = useState('STUDENT');
  return <DashboardLayout view={view} onNavigate={setView} profile={profile} onProfileChange={setProfile}>
    {view === 'explorer' ? <ExplorerMode onBack={() => setView('dashboard')} /> : view === 'planner' ? <PlannerMode onBack={() => setView('dashboard')} /> : null}
  </DashboardLayout>;
}
