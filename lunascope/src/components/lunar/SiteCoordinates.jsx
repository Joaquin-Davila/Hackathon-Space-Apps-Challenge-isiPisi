import { formatCoordinate } from '../../utils/lunarHelpers.js';
export default function SiteCoordinates({ site }) {
  return <div className="coordinates"><div><span>LATITUDE</span><b>{formatCoordinate(site.latitude, 'latitude')}</b></div><i/><div><span>LONGITUDE</span><b>{formatCoordinate(site.longitude, 'longitude')}</b></div><i/><div className="selection-state"><span>SELECTION</span><b><em/> CANDIDATE SITE</b></div></div>;
}
