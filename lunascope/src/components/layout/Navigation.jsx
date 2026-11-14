export default function Navigation({ view, onNavigate, open, onClose }) {
  return <nav className={`nav-panel ${open ? 'is-open' : ''}`} aria-label="Main navigation">
    {[['dashboard', 'Mission control'], ['explorer', 'Explorer mode'], ['planner', 'Planner mode']].map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => { onNavigate(id); onClose(); }}>{label}<span>{id === 'dashboard' ? '01' : id === 'explorer' ? '02' : '03'}</span></button>)}
  </nav>;
}
