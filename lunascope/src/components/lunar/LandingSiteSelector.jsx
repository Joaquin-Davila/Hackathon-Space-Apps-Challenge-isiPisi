import { useEffect } from 'react';
import IconButton from '../ui/IconButton.jsx';

export default function LandingSiteSelector({ sites, selectedSite, onSelect }) {
  useEffect(() => { const handler = (event) => { const index = sites.findIndex((site) => site.name.toLowerCase().includes(event.detail.toLowerCase())); if (index >= 0) onSelect(index); }; window.addEventListener('lunav:search', handler); return () => window.removeEventListener('lunav:search', handler); }, [sites, onSelect]);
  const index = sites.findIndex((site) => site.id === selectedSite.id);
  const move = (step) => onSelect((index + step + sites.length) % sites.length);
  return <div className="site-controls"><IconButton icon="previous" label="Previous landing site" onClick={() => move(-1)} /><div className="site-pips" aria-label="Choose landing site">{sites.map((site, i) => <button key={site.id} className={i === index ? 'selected' : ''} aria-label={`Select ${site.name}`} aria-pressed={i === index} onClick={() => onSelect(i)} />)}</div><IconButton icon="next" label="Next landing site" onClick={() => move(1)} /></div>;
}
