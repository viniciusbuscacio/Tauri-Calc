import React from 'react';
import { WindowService } from '../../infrastructure/WindowService';

export const TitleBar: React.FC = () => {
  // Use arrow functions to preserve the 'this' binding
  const handleMinimize = () => WindowService.minimize();
  const handleToggleMaximize = () => WindowService.toggleMaximize();
  const handleClose = () => WindowService.close();

  return (
    <div className="title-bar" data-tauri-drag-region>
      <span className="title" data-tauri-drag-region>Calc</span>
      <div className="window-controls">
        <button id="minimize-btn" className="minimize-btn" onClick={handleMinimize}>−</button>
        <button id="fullscreen-btn" className="fullscreen-btn" onClick={handleToggleMaximize}>⛶</button>
        <button id="close-btn" className="close-btn" onClick={handleClose}>×</button>
      </div>
    </div>
  );
};
