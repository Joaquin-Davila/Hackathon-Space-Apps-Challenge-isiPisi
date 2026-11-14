function finite(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function firstFinite(...values) {
  for (const value of values) {
    const numeric = finite(value);
    if (numeric !== null) return numeric;
  }
  return null;
}

function normalizeAzimuth(value) {
  const azimuth = finite(value);
  return azimuth === null ? null : ((azimuth % 360) + 360) % 360;
}

function readBodyPosition(data, body) {
  const isSun = body === 'sun';
  const metrics = data?.metrics ?? {};
  const rootPosition = data?.[body] ?? {};
  const aliases = isSun ? ['solar', 'sun'] : ['earth'];
  const angleKeys = isSun ? ['solarAzimuth', 'solarAzimuthDeg', 'sunAzimuth'] : ['earthAzimuth', 'earthAzimuthDeg'];
  const elevationKeys = isSun ? ['solarElevation', 'solarElevationDeg', 'sunElevation'] : ['earthElevation', 'earthElevationDeg'];
  const position = (data?.positions?.[body] ?? data?.positions?.[isSun ? 'solar' : 'earth'] ?? rootPosition);

  const azimuth = normalizeAzimuth(firstFinite(
    ...angleKeys.flatMap((key) => [metrics[key], data?.[key]]),
    ...aliases.flatMap((key) => [data?.[key]?.azimuth, data?.[key]?.azimuthDeg]),
    position?.azimuth,
    position?.azimuthDeg,
  ));
  const elevation = firstFinite(
    ...elevationKeys.flatMap((key) => [metrics[key], data?.[key]]),
    ...aliases.flatMap((key) => [data?.[key]?.elevation, data?.[key]?.elevationDeg]),
    position?.elevation,
    position?.elevationDeg,
    isSun ? metrics.solarElevation : null,
  );
  return { azimuth, elevation };
}

export default function HorizonProfileChart({ profile = [], data }) {
  const samples = profile
    .map((point) => ({ azimuth: finite(point.azimuth), elevation: finite(point.elevation) }))
    .filter((point) => point.azimuth !== null && point.elevation !== null && point.azimuth >= 0 && point.azimuth <= 360)
    .sort((a, b) => a.azimuth - b.azimuth);
  const sun = readBodyPosition(data, 'sun');
  const earth = readBodyPosition(data, 'earth');
  const elevations = [...samples.map((point) => point.elevation), sun.elevation, earth.elevation].filter((value) => value !== null);
  const rawMin = elevations.length ? Math.min(...elevations, 0) : -5;
  const rawMax = elevations.length ? Math.max(...elevations, 0) : 5;
  const padding = Math.max((rawMax - rawMin) * 0.16, 1);
  const minElevation = rawMin - padding;
  const maxElevation = rawMax + padding;

  const width = 760;
  const height = 330;
  const left = 54;
  const right = 18;
  const top = 24;
  const bottom = 45;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xFor = (azimuth) => left + (azimuth / 360) * plotWidth;
  const yFor = (elevation) => top + ((maxElevation - elevation) / (maxElevation - minElevation)) * plotHeight;
  const points = samples.map((point) => `${xFor(point.azimuth)},${yFor(point.elevation)}`).join(' ');
  const baseline = yFor(0);
  const area = samples.length > 1
    ? `M ${xFor(samples[0].azimuth)} ${baseline} L ${samples.map((point) => `${xFor(point.azimuth)} ${yFor(point.elevation)}`).join(' L ')} L ${xFor(samples[samples.length - 1].azimuth)} ${baseline} Z`
    : '';
  const yTicks = Array.from({ length: 5 }, (_, index) => maxElevation - ((maxElevation - minElevation) * index) / 4);
  const xTicks = [0, 90, 180, 270, 360];
  const plotBottom = top + plotHeight;
  const plotRight = left + plotWidth;
  const sunX = sun.azimuth === null ? null : xFor(sun.azimuth);
  const sunY = sun.elevation === null ? null : yFor(sun.elevation);
  const earthX = earth.azimuth === null ? null : xFor(earth.azimuth);
  const earthY = earth.elevation === null ? null : yFor(earth.elevation);

  return (
    <section className="horizon-chart-panel" aria-labelledby="horizon-chart-title">
      <div className="horizon-chart-header">
        <div>
          <span className="telemetry-kicker">TOPOGRAPHY / 360° SWEEP</span>
          <h2 id="horizon-chart-title">HORIZON PROFILE</h2>
        </div>
        <span className="sample-count">{samples.length} AZIMUTH SAMPLES</span>
      </div>

      {samples.length > 1 ? (
        <>
          <div className="horizon-chart-wrap">
            <svg className="horizon-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Perfil topográfico del horizonte por azimut">
              <defs>
                <linearGradient id="terrain-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#69b9cf" stopOpacity=".26" />
                  <stop offset="100%" stopColor="#69b9cf" stopOpacity=".015" />
                </linearGradient>
              </defs>

              {yTicks.map((tick, index) => (
                <g key={`y-${index}`}>
                  <line x1={left} x2={plotRight} y1={yFor(tick)} y2={yFor(tick)} className="chart-gridline" />
                  <text x={left - 9} y={yFor(tick) + 4} textAnchor="end" className="chart-axis-label">{tick.toFixed(1)}°</text>
                </g>
              ))}
              {xTicks.map((tick) => (
                <g key={`x-${tick}`}>
                  <line x1={xFor(tick)} x2={xFor(tick)} y1={top} y2={plotBottom} className="chart-gridline chart-gridline-vertical" />
                  <text x={xFor(tick)} y={plotBottom + 22} textAnchor="middle" className="chart-axis-label">{tick}°</text>
                </g>
              ))}

              <line x1={left} x2={plotRight} y1={baseline} y2={baseline} className="chart-horizon-line" />
              <path d={area} className="chart-terrain-area" />
              <polyline points={points} className="chart-terrain-line" />

              {sun.elevation !== null && <line x1={left} x2={plotRight} y1={sunY} y2={sunY} className="chart-sun-elevation" />}
              {sun.azimuth !== null && <line x1={sunX} x2={sunX} y1={top} y2={plotBottom} className="chart-sun-azimuth" />}
              {sun.azimuth !== null && sun.elevation !== null && <circle cx={sunX} cy={sunY} r="5" className="chart-sun-point" />}

              {earth.elevation !== null && <line x1={left} x2={plotRight} y1={earthY} y2={earthY} className="chart-earth-elevation" />}
              {earth.azimuth !== null && <line x1={earthX} x2={earthX} y1={top} y2={plotBottom} className="chart-earth-azimuth" />}
              {earth.azimuth !== null && earth.elevation !== null && <circle cx={earthX} cy={earthY} r="5" className="chart-earth-point" />}

              <text x={left} y={height - 5} className="chart-axis-title">AZIMUTH</text>
              <text x="12" y={top - 8} className="chart-axis-title">ELEVATION</text>
            </svg>
          </div>
          <div className="horizon-chart-legend">
            <span><i className="legend-terrain" /> TERRAIN PROFILE</span>
            <span><i className="legend-sun" /> SUN · {sun.azimuth === null ? 'AZ N/A' : `${sun.azimuth.toFixed(1)}° AZ`}{sun.elevation === null ? '' : ` / ${sun.elevation.toFixed(1)}° EL`}</span>
            <span><i className="legend-earth" /> EARTH · {earth.azimuth === null ? 'AZ N/A' : `${earth.azimuth.toFixed(1)}° AZ`}{earth.elevation === null ? '' : ` / ${earth.elevation.toFixed(1)}° EL`}</span>
          </div>
        </>
      ) : (
        <p className="horizon-chart-empty">No hay suficientes muestras de elevación para trazar el perfil.</p>
      )}
    </section>
  );
}
