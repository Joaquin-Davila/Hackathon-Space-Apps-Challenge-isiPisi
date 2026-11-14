import { useEffect, useState } from 'react';
import { normalizeSite } from '../utils/lunarHelpers.js';

const candidates = [
  { id: 'shackleton-rim', name: 'Shackleton Rim' },
  { id: 'connecting-ridge', name: 'Connecting Ridge' },
  { id: 'malapert-massif', name: 'Malapert Massif' },
];

export default function useLunarSites() {
  const [sites, setSites] = useState(candidates.map(normalizeSite));
  const [sourceAvailable, setSourceAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    const readSites = async () => {
      // Prefer the API, while keeping the static JSON as a no-backend fallback.
      for (const url of ['/api/sites', '/data/sites.json']) {
        try {
          const response = await fetch(url);
          if (response.ok) return response.json();
        } catch { /* Try the next source. */ }
      }
      throw new Error('Sites data unavailable');
    };
    readSites().then((data) => {
      const rows = Array.isArray(data) ? data : data.sites;
      if (active && Array.isArray(rows) && rows.length) {
        const normalized = rows.map(normalizeSite);
        // Preserve the requested candidate names where the data file only contains coordinates.
        setSites(candidates.map((candidate, index) => {
          const entry = normalized.find((site) => site.id === candidate.id) ?? normalized[index];
          return entry ? { ...candidate, latitude: entry.latitude, longitude: entry.longitude } : candidate;
        }));
        setSourceAvailable(true);
      }
    }).catch(() => { /* Empty source means coordinates remain unavailable. */ });
    return () => { active = false; };
  }, []);
  return { sites, sourceAvailable };
}
