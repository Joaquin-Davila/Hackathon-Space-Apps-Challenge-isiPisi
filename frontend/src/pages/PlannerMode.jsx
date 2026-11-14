import { ArrowLeft, Route } from 'lucide-react';
export default function PlannerMode({ onBack }) {
  return <section className="mode-panel"><button className="back-link" onClick={onBack}><ArrowLeft size={15}/> MISSION CONTROL</button><div className="eyebrow"><span/> MISSION DESIGN</div><Route className="mode-icon" size={28}/><h1>PLANNER MODE</h1><p className="mode-lede">Plan a surface mission around terrain, illumination, and Earth visibility.</p><div className="mode-data-state"><i/><div><b>SIMULATION INPUTS PENDING</b><span>Terrain, irradiance, scenario, and visibility modules are empty. Verified inputs are needed before a mission plan can be calculated.</span></div></div><div className="mode-footnote">PLANNER VIEW · SIMULATION OUTPUTS PENDING</div></section>;
}
