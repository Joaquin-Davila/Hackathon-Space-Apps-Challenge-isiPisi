const horizonSources = (siteId) => {
  const encodedId = encodeURIComponent(siteId);
  return [
    `/api/horizons/${encodedId}`,
    `/data/horizons/${encodedId}.json`,
    `/data/${encodedId}.json`,
  ];
};

export async function getHorizonData(siteId = 'shackleton') {
  for (const source of horizonSources(siteId)) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;

      const data = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) return data;
    } catch {
      // Try the next configured source; a missing horizon file is a normal state.
    }
  }

  return null;
}
