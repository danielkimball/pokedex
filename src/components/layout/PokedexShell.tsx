import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import '../../styles/pokedex-device.css';

export interface PokedexShellContext {
  activePanel: number;
  setActivePanel: (panel: number) => void;
  setSidePanel: (panel: ReactNode | null) => void;
}

export function PokedexShell() {
  const location = useLocation();
  const isDexEntry = /^\/dex\/\d+/.test(location.pathname);
  const [activePanel, setActivePanel] = useState(0);
  const [sidePanel, setSidePanel] = useState<ReactNode | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const gestureLockRef = useRef<'h' | 'v' | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!trackRef.current) return;
      trackRef.current.style.transition = 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)';
      trackRef.current.style.transform = isDexEntry && sidePanel ? `translateX(-${activePanel * 100}%)` : 'translateX(0%)';
    });
  }, [activePanel, isDexEntry, sidePanel]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isDexEntry || !sidePanel) return;

    const target = e.target;
    if (target instanceof Element && target.closest('[data-card-carousel="true"]')) {
      draggingRef.current = false;
      return;
    }

    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
    gestureLockRef.current = null;
  }, [isDexEntry, sidePanel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current || !trackRef.current || !isDexEntry || !sidePanel) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    if (gestureLockRef.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      gestureLockRef.current = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v';
      if (gestureLockRef.current === 'h') {
        trackRef.current.style.transition = 'none';
      }
    }

    if (gestureLockRef.current !== 'h') return;
    const blockedAtStart = activePanel === 0 && dx > 0;
    const blockedAtEnd = activePanel === 1 && dx < 0;
    const resistedDx = blockedAtStart || blockedAtEnd ? dx * 0.22 : dx;
    trackRef.current.style.transform = `translateX(calc(-${activePanel * 100}% + ${resistedDx}px))`;
  }, [activePanel, isDexEntry, sidePanel]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (gestureLockRef.current !== 'h') return;
    const dx = e.changedTouches[0].clientX - startXRef.current;
    const nextPanel = dx < -70 ? 1 : dx > 70 ? 0 : activePanel;
    setActivePanel(nextPanel);
  }, [activePanel]);

  const outlet = <Outlet context={{ activePanel, setActivePanel, setSidePanel } satisfies PokedexShellContext} />;

  return (
    <div
      className="pokedex-shell-viewport"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={trackRef} className="pokedex-shell-track">
        <div className="pokedex-shell">
          {/* Header — styled like the actual Pokédex top panel */}
          <div className="pokedex-header">
            <div className="pokedex-header-left">
              <div className="led-large" />
            </div>
            <div className="pokedex-header-right">
              <div className="led-small led-red" />
              <div className="led-small led-yellow" />
              <div className="led-small led-green" />
            </div>
          </div>
          {/* Ridge/hinge between top panel and screen */}
          <div className="pokedex-hinge" />

          {/* Main screen */}
          <div className="pokedex-screen-container">
            <div className="pokedex-screen">
              {outlet}
            </div>
          </div>

          {/* Bottom controls (decorative) */}
          <div className="pokedex-controls">
            <div className="dpad">
              <div className="dpad-h" />
              <div className="dpad-v" />
              <div className="dpad-center" />
            </div>
            <div className="action-buttons">
              <button className="btn-round btn-a" aria-label="A button" />
              <button className="btn-round btn-b" aria-label="B button" />
            </div>
          </div>
        </div>

        {isDexEntry && sidePanel && (
          <div className="pokedex-shell pokedex-shell-side">
            <div className="pokedex-fold-spine" aria-hidden="true">
              <div className="pokedex-spine-cap pokedex-spine-cap-top" />
              <div className="pokedex-spine-rail" />
              <div className="pokedex-spine-cap pokedex-spine-cap-mid" />
              <div className="pokedex-spine-rail" />
              <div className="pokedex-spine-cap pokedex-spine-cap-bottom" />
            </div>
            <div className="pokedex-header pokedex-header-side">
              <div className="pokedex-side-notch" aria-hidden="true" />
              <div className="pokedex-side-title">POKEDEX DATA</div>
              <div className="pokedex-header-right">
                <div className="led-small led-red" />
                <div className="led-small led-yellow" />
                <div className="led-small led-green" />
              </div>
            </div>
            <div className="pokedex-hinge" />

            <div className="pokedex-screen-container pokedex-screen-container-side">
              <div className="pokedex-screen pokedex-screen-side">
                {sidePanel}
              </div>
            </div>

            <div className="pokedex-controls">
              <div className="pokedex-side-keys">
                <div className="pokedex-side-key" />
                <div className="pokedex-side-key" />
              </div>
              <div className="action-buttons">
                <button className="btn-round btn-a" aria-label="A button" />
                <button className="btn-round btn-b" aria-label="B button" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
