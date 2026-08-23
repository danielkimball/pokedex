import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isPokedexBackSwipeStart, resolvePokedexShellSwipe } from '../../utils/pokedex-gestures';
import '../../styles/pokedex-device.css';

export interface PokedexShellContext {
  activePanel: number;
  setActivePanel: (panel: number) => void;
  setSidePanel: (panel: ReactNode | null) => void;
}

export function PokedexShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDexEntry = /^\/dex\/\d+/.test(location.pathname);
  const [activePanel, setActivePanel] = useState(0);
  const [sidePanel, setSidePanel] = useState<ReactNode | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const gestureLockRef = useRef<'h' | 'v' | null>(null);
  const canSwipeBackRef = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!trackRef.current) return;
      trackRef.current.style.transition = 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)';
      trackRef.current.style.transform = isDexEntry && sidePanel ? `translateX(-${activePanel * 100}%)` : 'translateX(0%)';
    });
  }, [activePanel, isDexEntry, sidePanel]);

  // Live values for the native (non-passive) touch handlers, avoiding stale closures.
  const viewportRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef(activePanel);
  const enabledRef = useRef(isDexEntry && !!sidePanel);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);
  useEffect(() => { enabledRef.current = isDexEntry && !!sidePanel; }, [isDexEntry, sidePanel]);

  // Non-passive touch binding so a horizontal panel swipe can preventDefault()
  // the page's vertical scroll — same seamlessness fix as the card carousel.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (!enabledRef.current || e.touches.length !== 1) return;
      const target = e.target;
      const screen = target instanceof Element ? target.closest('.pokedex-screen') : null;
      const surfaceLeft = screen?.getBoundingClientRect().left ?? el.getBoundingClientRect().left;
      const startsAtBackEdge = activePanelRef.current === 0
        && isPokedexBackSwipeStart(e.touches[0].clientX, surfaceLeft);
      const isCardCarousel = target instanceof Element
        && !!target.closest('[data-card-carousel="true"]');

      // The carousel owns normal card swipes. A swipe from the screen's left edge
      // passes through to the shell so returning to the list also works over a card.
      if (isCardCarousel && !startsAtBackEdge) {
        draggingRef.current = false;
        return;
      }
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      draggingRef.current = true;
      gestureLockRef.current = null;
      canSwipeBackRef.current = activePanelRef.current === 0
        && (!isCardCarousel || startsAtBackEdge);
    };
    const onMove = (e: TouchEvent) => {
      if (!draggingRef.current || !trackRef.current || !enabledRef.current) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const dy = e.touches[0].clientY - startYRef.current;
      if (gestureLockRef.current === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        gestureLockRef.current = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v';
        if (gestureLockRef.current === 'h') trackRef.current.style.transition = 'none';
      }
      if (gestureLockRef.current !== 'h') return;
      e.preventDefault();
      const ap = activePanelRef.current;
      const isBackDrag = ap === 0 && canSwipeBackRef.current && dx > 0;
      const blockedAtStart = ap === 0 && dx > 0 && !isBackDrag;
      const blockedAtEnd = ap === 1 && dx < 0;
      const resistedDx = blockedAtStart || blockedAtEnd ? dx * 0.22 : dx;
      trackRef.current.style.transform = `translateX(calc(-${ap * 100}% + ${resistedDx}px))`;
    };

    const snapToPanel = (panel: number) => {
      const track = trackRef.current;
      if (!track) return;
      track.style.transition = 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)';
      track.style.transform = `translateX(-${panel * 100}%)`;
      if (panel !== activePanelRef.current) {
        activePanelRef.current = panel;
        setActivePanel(panel);
      }
    };

    const animateBackToList = () => {
      const track = trackRef.current;
      if (!track) {
        navigate('/dex');
        return;
      }

      track.style.transition = 'transform 0.24s cubic-bezier(0.22, 0.61, 0.36, 1)';
      track.style.transform = 'translateX(100%)';

      let fallbackId = 0;
      const finish = () => {
        track.removeEventListener('transitionend', finish);
        window.clearTimeout(fallbackId);
        navigate('/dex');
      };
      track.addEventListener('transitionend', finish, { once: true });
      fallbackId = window.setTimeout(finish, 320);
    };

    const finishGesture = (e: TouchEvent, cancelled: boolean) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (gestureLockRef.current !== 'h') return;
      const endTouch = e.changedTouches[0];
      const dx = cancelled || !endTouch ? 0 : endTouch.clientX - startXRef.current;
      const ap = activePanelRef.current;
      const action = resolvePokedexShellSwipe(ap, dx, canSwipeBackRef.current);

      if (action === 'back-to-list') animateBackToList();
      else if (action === 'show-data') snapToPanel(1);
      else if (action === 'show-main') snapToPanel(0);
      else snapToPanel(ap);
    };
    const onEnd = (e: TouchEvent) => finishGesture(e, false);
    const onCancel = (e: TouchEvent) => finishGesture(e, true);

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [navigate, setActivePanel]);

  const outlet = <Outlet context={{ activePanel, setActivePanel, setSidePanel } satisfies PokedexShellContext} />;

  return (
    <div className="pokedex-shell-viewport" ref={viewportRef}>
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
