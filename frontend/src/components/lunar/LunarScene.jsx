// frontend/src/components/lunar/LunarScene.jsx
import { useCallback, useEffect } from 'react';
import LunarGlobe from './LunarGlobe';
import LandingSiteSelector from './LandingSiteSelector';
import SiteCoordinates from './SiteCoordinates';

function slotOf(i, active, n) {
  if (i === active) return 'active';
  if (n === 2) return 'next';
  if ((i - active + n) % n === 1) return 'next';
  if ((active - i + n) % n === 1) return 'prev';
  return 'hidden';
}

const Tri = ({ flip }) => (
  <svg viewBox="0 0 12 14" width="12" height="14" style={{ transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
    <path d="M1 1l10 6-10 6z" fill="currentColor" />
  </svg>
);

export default function LunarScene({ sites, activeIndex, onChange, onExplore }) {
  const n = sites.length;
  const go = useCallback((d) => onChange((activeIndex + d + n) % n), [activeIndex, n, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  if (!n) return null;
  const site = sites[activeIndex];
  const prev = n > 2 ? sites[(activeIndex - 1 + n) % n] : null;
  const next = n > 1 ? sites[(activeIndex + 1) % n] : null;

  return (
    <section className="scene" aria-label="Selector de sitios de aterrizaje">
      <div className="stage">
        <svg className="orbit" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="500" cy="200" rx="540" ry="78" vectorEffect="non-scaling-stroke" />
        </svg>

        {sites.map((s, i) => {
          const slot = slotOf(i, activeIndex, n);
          const variant = slot === 'active' ? 'hero' : slot === 'prev' ? 'dim' : 'far';
          const side = slot !== 'active';
          return (
            <div
              key={s.id}
              className={`slide is-${slot}`}
              onClick={side ? () => onChange(i) : undefined}
              role={side ? 'button' : undefined}
              tabIndex={side ? 0 : -1}
              aria-label={side ? `Ver ${s.name}` : undefined}
              onKeyDown={(e) => { if (side && e.key === 'Enter') onChange(i); }}
            >
              <LunarGlobe lat={s.lat ?? -89.5} lon={s.lon ?? 0} variant={variant} />
              <LandingSiteSelector markers={s.markers} />
            </div>
          );
        })}

        {n > 1 && (
          <>
            <button className="arrow arrow-left" onClick={() => go(-1)} aria-label="Sitio anterior"><Tri flip /></button>
            <button className="arrow arrow-right" onClick={() => go(1)} aria-label="Sitio siguiente"><Tri /></button>
          </>
        )}
      </div>

      <div className="captions">
        <button className="caption caption-side" onClick={() => go(-1)} disabled={!prev} tabIndex={prev ? 0 : -1}>
          {prev && (<><strong>{prev.name}</strong><SiteCoordinates site={prev} /></>)}
        </button>

        <div className="caption caption-main" aria-live="polite">
          <h2>{site.name}</h2>
          <SiteCoordinates site={site} />
          <button className="cta" onClick={() => onExplore?.(site)}>EXPLORAR HORIZONTE 360°</button>
        </div>

        <button className="caption caption-side is-right" onClick={() => go(1)} disabled={!next} tabIndex={next ? 0 : -1}>
          {next && (<><strong>{next.name}</strong><SiteCoordinates site={next} /></>)}
        </button>
      </div>
    </section>
  );
}
