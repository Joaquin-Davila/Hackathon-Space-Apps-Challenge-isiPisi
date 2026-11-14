import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import LunarGlobe from './LunarGlobe.jsx';
import LandingSiteSelector from './LandingSiteSelector.jsx';

export default function LunarScene({ sites, selectedSite, onSelect }) {
  const [showSites, setShowSites] = useState(true);
  return <section className="scene" aria-label="Lunar south pole scene">
    <div className="scene-grid"/><div className="scene-topline"><span><i className="live-dot"/> SOUTH POLAR REGION</span><span>SELENOGRAPHIC VIEW <b>·</b> 01 / 03</span></div>
    <LunarGlobe />
    <div className="scene-coordinates coordinate-left"><span>POLAR REGION</span><i/> LUNAR SOUTH POLE</div><div className="scene-coordinates coordinate-right">ELEVATION MODEL <i/> LOLA / PENDING</div>
    {showSites && <div className="site-marker marker-main"><i/><span className="marker-label">{selectedSite.name.toUpperCase()}<small>LANDING SITE CANDIDATE</small></span></div>}
    <div className="site-marker marker-secondary marker-upper"><i/></div><div className="site-marker marker-secondary marker-lower"><i/></div>
    <button className={`scene-toggle ${showSites ? 'on' : ''}`} onClick={() => setShowSites(!showSites)}><Crosshair size={14}/> SITE MARKERS <span>{showSites ? 'ON' : 'OFF'}</span></button>
    <div className="scene-caption"><span>ILLUSTRATIVE LUNAR RENDER</span><span>NOT TO SCALE</span></div>
    <LandingSiteSelector sites={sites} selectedSite={selectedSite} onSelect={onSelect}/>
  </section>;
}
