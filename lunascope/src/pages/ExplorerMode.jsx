import { ArrowLeft, Compass } from 'lucide-react';
export default function ExplorerMode({ onBack }) {
  return <section className="mode-panel"><button className="back-link" onClick={onBack}><ArrowLeft size={15}/> MISSION CONTROL</button><div className="eyebrow"><span/> EXPLORATION SYSTEMS</div><Compass className="mode-icon" size={28}/><h1>EXPLORER MODE</h1><p className="mode-lede">Horizon exploration for the selected lunar landing site.</p><div className="mode-data-state"><i/><div><b>HORIZON DATA NOT AVAILABLE</b><span>The Horizons data files are empty. Add verified site horizon data to enable the 360° view.</span></div></div><div className="mode-footnote">EXPLORER VIEW · DATA SOURCE: JPL HORIZONS</div></section>;
}
