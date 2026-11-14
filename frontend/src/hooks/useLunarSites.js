// frontend/src/hooks/useLunarSites.js
import { useEffect, useState } from 'react';
import { normalizeSite } from '../lunarHelpers.js';

const SOURCES = ['/api/sites', '/data/sites.json'];
const FALLBACK_SITES = [
  { id: 'shackleton-rim', name: 'Shackleton Rim', lat: null, lon: null, markers: [] },
  { id: 'connecting-ridge', name: 'Connecting Ridge', lat: null, lon: null, markers: [] },
  { id: 'malapert-massif', name: 'Malapert Massif', lat: null, lon: null, markers: [] },
];

export function useLunarSites() {
  const [state, setState] = useState({ sites: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of SOURCES) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const list = Array.isArray(json) ? json : json.sites;
          if (list?.length) {
            if (!cancelled) setState({ sites: list.map(normalizeSite), loading: false, error: null });
            return;
          }
        } catch {
          /* prueba la siguiente fuente */
        }
      }
      if (!cancelled) setState({ sites: FALLBACK_SITES.map(normalizeSite), loading: false, error: null });
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
