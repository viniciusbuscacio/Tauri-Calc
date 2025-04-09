import { useEffect } from 'react';
import { WindowService } from '../../infrastructure/WindowService';

export const useResizable = (containerRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-tauri-drag-region]') || target.closest('.window-controls')) {
        return;
      }
      
      const element = containerRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const borderSensitivity = 10;
      
      const onRightEdge = Math.abs(event.clientX - rect.right) < borderSensitivity;
      const onBottomEdge = Math.abs(event.clientY - rect.bottom) < borderSensitivity;
      const onLeftEdge = Math.abs(event.clientX - rect.left) < borderSensitivity;
      const onTopEdge = Math.abs(event.clientY - rect.top) < borderSensitivity;
      
      let resizeDirection: string | null = null;
      
      if (onRightEdge && onBottomEdge) resizeDirection = 'SouthEast';
      else if (onLeftEdge && onBottomEdge) resizeDirection = 'SouthWest';
      else if (onLeftEdge && onTopEdge) resizeDirection = 'NorthWest';
      else if (onRightEdge && onTopEdge) resizeDirection = 'NorthEast';
      else if (onRightEdge) resizeDirection = 'East';
      else if (onBottomEdge) resizeDirection = 'South';
      else if (onLeftEdge) resizeDirection = 'West';
      else if (onTopEdge) resizeDirection = 'North';
      
      if (resizeDirection) {
        event.preventDefault();
        WindowService.startResizeDragging(resizeDirection)
          .catch(err => console.error(err));
      }
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef]);
};
