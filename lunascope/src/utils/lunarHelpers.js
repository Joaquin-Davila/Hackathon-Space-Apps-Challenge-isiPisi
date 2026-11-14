export const DEFAULT_SITE_ID = 'shackleton-rim';

export function formatCoordinate(value, axis) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const direction = axis === 'latitude' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
  return `${Math.abs(value).toFixed(3)}° ${direction}`;
}

export function normalizeSite(site, index = 0) {
  const name = site.name ?? site.siteName ?? site.label ?? `Candidate site ${index + 1}`;
  return {
    id: String(site.id ?? site.slug ?? `site-${index + 1}`),
    name,
    latitude: site.latitude ?? site.lat ?? null,
    longitude: site.longitude ?? site.lon ?? site.lng ?? null,
    description: site.description ?? '',
  };
}
