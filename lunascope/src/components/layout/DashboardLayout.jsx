import { useCallback, useState } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import Header from './Header.jsx';
import LunarScene from '../lunar/LunarScene.jsx';
import SiteCoordinates from '../lunar/SiteCoordinates.jsx';
import MissionOverview from '../dashboard/MissionOverview.jsx';
import useLunarSites from '../../hooks/useLunarSites.js';
import { DEFAULT_SITE_ID } from '../../utils/lunarHelpers.js';

function DashboardHome({ onNavigate, profile }) {
  const { sites } = useLunarSites();
  const [selectedId, setSelectedId] = useState(DEFAULT_SITE_ID);
  const selectedSite = sites.find((site) => site.id === selectedId) ?? sites[0];
  const selectSite = useCallback((index) => { const site = sites[index]; if (site) setSelectedId(site.id); }, [sites]);
  return <main className="dashboard-main">
    <section className="intro"><div><div className="eyebrow"><span/> LUNAR SURFACE OPERATIONS <span className="eyebrow-line"/></div><h1>LUNAR SOUTH POLE</h1><p>Select a candidate landing site to explore the horizon.</p></div><div className="mission-meta"><div><span>TARGET YEAR</span><b>2026</b></div><i/><div><span>LATITUDE</span><b>84°S — 90°S</b></div><i/><div><span>DATA</span><b>JPL HORIZONS / LOLA</b></div></div></section>
    <LunarScene sites={sites} selectedSite={selectedSite} onSelect={selectSite}/>
    <section className="selected-site"><div className="selected-kicker"><i/> SELECTED LANDING SITE <span>· {profile} VIEW</span></div><h2>{selectedSite.name}</h2><SiteCoordinates site={selectedSite}/><button className="primary-action" onClick={() => onNavigate('explorer')}>EXPLORE HORIZON 360° <ArrowUpRight size={17}/></button></section>
    <MissionOverview site={selectedSite}/><footer className="dashboard-footer"><span>LU<span>·</span>NAV <i/> LUNAR NAVIGATION SYSTEM</span><span>JPL HORIZONS / LOLA <i/> DATA SUBJECT TO AVAILABILITY</span><button onClick={() => onNavigate('planner')}>OPEN MISSION PLANNER <ChevronRight size={13}/></button></footer>
  </main>;
}
export default function DashboardLayout({ view, onNavigate, profile, onProfileChange, children }) {
  const onSearch = (query) => { if (query.trim()) window.dispatchEvent(new CustomEvent('lunav:search', { detail: query.trim() })); };
  return <div className="app-shell"><div className="ambient-stars"/><Header view={view} onNavigate={onNavigate} profile={profile} onProfileChange={onProfileChange} onSearch={onSearch}/>{view === 'dashboard' ? <DashboardHome onNavigate={onNavigate} profile={profile}/> : <main className="mode-main">{children}</main>}</div>;
}
