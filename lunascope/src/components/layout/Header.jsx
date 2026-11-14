import { useState } from 'react';
import { Search } from 'lucide-react';
import IconButton from '../ui/IconButton.jsx';
import Navigation from './Navigation.jsx';

export default function Header({ view, onNavigate, profile, onProfileChange, onSearch }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return <header className="topbar">
    <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="LuNav mission control"><span className="brand-mark">L<span>·</span></span><span className="brand-copy"><b>LUNAV</b><small>LUNAR LANDING SITE SELECTOR</small></span></button>
    <Navigation view={view} onNavigate={onNavigate} open={navOpen} onClose={() => setNavOpen(false)} />
    <div className="header-tools">
      {searchOpen && <form className="search-field" onSubmit={(event) => { event.preventDefault(); onSearch(event.currentTarget.elements.site.value); setSearchOpen(false); }}><input name="site" autoFocus placeholder="Find a landing site" aria-label="Find a landing site" /></form>}
      <IconButton icon="search" label={searchOpen ? 'Close search' : 'Search sites'} onClick={() => setSearchOpen(!searchOpen)} />
      <label className="profile-select"><span className="sr-only">Viewing profile</span><select value={profile} onChange={(event) => onProfileChange(event.target.value)}><option>STUDENT</option><option>ASTRONAUT</option></select><span className="select-caret">⌄</span></label>
      <span className="mission-indicator"><i /> DATA PENDING</span>
      <IconButton icon={navOpen ? 'close' : 'menu'} className="mobile-menu" label="Toggle navigation" onClick={() => setNavOpen(!navOpen)} />
    </div>
  </header>;
}
