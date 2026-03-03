import { Outlet } from 'react-router-dom';
import '../../styles/pokedex-device.css';

export function PokedexShell() {
  return (
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
          <Outlet />
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
  );
}
