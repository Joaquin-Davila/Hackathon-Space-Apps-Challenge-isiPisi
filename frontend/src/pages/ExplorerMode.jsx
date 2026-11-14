import { useEffect, useState } from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import HorizonProfileChart from '../components/lunar/HorizonProfileChart.jsx';
import { getHorizonData } from '../services/horizonsService.js';

const DEFAULT_SITE = { id: 'shackleton-rim', name: 'Shackleton Rim' };
const DATA_SOURCE = 'JPL HORIZONS / LRO LOLA DEM';

function formatCoordinate(value, axis) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '—';
  const numericValue = Number(value);
  const direction = axis === 'latitude'
    ? (numericValue < 0 ? 'S' : 'N')
    : (numericValue < 0 ? 'W' : 'E');
  return `${Math.abs(numericValue).toFixed(2)}° ${direction}`;
}

function formatNumber(value, suffix = '') {
  return value == null || value === '' || !Number.isFinite(Number(value)) ? '—' : `${Number(value)}${suffix}`;
}

function Metadata({ label, children }) {
  return <div className="explorer-meta-row"><span>{label}</span><b>{children || 'NOT PROVIDED'}</b></div>;
}

export default function ExplorerMode({ site = DEFAULT_SITE, onBack }) {
  const siteId = site.horizonId ?? site.siteId ?? String(site.id ?? 'shackleton').replace(/-rim$/, '');
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null });
    getHorizonData(siteId).then((data) => {
      if (!cancelled) setState({ loading: false, data });
    });
    return () => { cancelled = true; };
  }, [siteId]);

  const { loading, data } = state;
  const coordinates = data?.coordinates;
  const latitude = Number.isFinite(site.lat) ? site.lat : coordinates?.latitude;
  const longitude = Number.isFinite(site.lon) ? site.lon : coordinates?.longitude;
  const metrics = data?.metrics ?? {};
  const profile = Array.isArray(data?.horizonProfile) ? data.horizonProfile : [];

  return (
    <section className="mode-panel explorer-panel" aria-labelledby="explorer-title">
      <button className="back-link" type="button" onClick={onBack}>
        <ArrowLeft size={15} /> BACK TO PLANNER
      </button>

      <header className="explorer-heading">
        <div className="eyebrow"><span /> LUNAR SURFACE ANALYSIS</div>
        <div className="explorer-title-row">
          <Compass className="mode-icon" size={25} aria-hidden="true" />
          <div>
            <h1 id="explorer-title">EXPLORER MODE</h1>
            <p className="mode-lede">360° horizon and terrain telemetry · {data?.name ?? site.name}</p>
          </div>
        </div>
      </header>

      {loading ? (
        <p className="explorer-state" role="status">LOADING HORIZON DATA…</p>
      ) : data ? (
        <div className="explorer-workspace">
          <HorizonProfileChart profile={profile} data={data} />
          <aside className="explorer-sidebar" aria-label="Site and mission metadata">
            <section className="explorer-info-block">
              <h2>SITE METADATA</h2>
              <Metadata label="TARGET">{data.name ?? site.name}</Metadata>
              <Metadata label="LATITUDE">{formatCoordinate(latitude, 'latitude')}</Metadata>
              <Metadata label="LONGITUDE">{formatCoordinate(longitude, 'longitude')}</Metadata>
              <Metadata label="DATA SOURCE">{data.source ?? DATA_SOURCE}</Metadata>
            </section>

            <section className="explorer-info-block">
              <h2>ILLUMINATION / LINK</h2>
              <Metadata label="SOLAR ELEVATION">{formatNumber(metrics.solarElevation, '°')}</Metadata>
              <Metadata label="SOLAR AZIMUTH">{formatNumber(metrics.solarAzimuth ?? data.solarAzimuth, '°')}</Metadata>
              <Metadata label="EARTH AZIMUTH">{formatNumber(metrics.earthAzimuth ?? data.earthAzimuth, '°')}</Metadata>
              <Metadata label="DIRECT TO EARTH">{metrics.earthVisibility ?? 'NOT PROVIDED'}</Metadata>
              <Metadata label="SOLAR WINDOW">{formatNumber(metrics.solarWindowHours, ' h')}</Metadata>
              <Metadata label="EARTH LINK">{formatNumber(metrics.earthLinkHours, ' h')}</Metadata>
            </section>
          </aside>
        </div>
      ) : (
        <div className="mode-data-state">
          <i />
          <div>
            <b>HORIZON DATA NOT AVAILABLE</b>
            <span>No hay un perfil para {site.name}. Agrega datos verificados en <code>backend/data/{siteId}.json</code>; el panel no genera topografía sintética.</span>
          </div>
        </div>
      )}

      <div className="mode-footnote">MISSION ANALYSIS · {DATA_SOURCE}</div>
    </section>
  );
}
