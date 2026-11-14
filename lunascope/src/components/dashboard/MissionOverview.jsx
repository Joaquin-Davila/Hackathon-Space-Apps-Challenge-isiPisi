import MissionStatus from './MissionStatus.jsx';
import SolarWindow from './SolarWindow.jsx';
import EarthLinkStatus from './EarthLinkStatus.jsx';
export default function MissionOverview({ site }) { return <section className="mission-overview"><div className="overview-heading"><span>MISSION OVERVIEW</span><span>LIVE TELEMETRY <i className="status-dot muted"/></span></div><div className="overview-grid"><MissionStatus/><SolarWindow/><EarthLinkStatus/><div className="overview-item active-site"><span className="overview-label">ACTIVE LANDING SITE</span><b>{site.name.toUpperCase()}</b><small>{site.latitude == null || site.longitude == null ? 'COORDINATES PENDING SOURCE DATA' : 'COORDINATES VERIFIED'}</small></div></div></section>; }
