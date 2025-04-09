import { useState, useRef, useEffect } from 'react';
import { ClipboardService } from '../../infrastructure/ClipboardService';

export const useContextMenu = (containerRef: React.RefObject<HTMLDivElement>, displayValueRef: React.RefObject<string>, setDisplayValue: (value: string) => void, setIsResultDisplayed: (value: boolean) => void) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (displayValueRef.current) {
      await ClipboardService.copyToClipboard(displayValueRef.current);
    }
    setMenuVisible(false);
  };

  const handlePaste = async () => {
    const pastedText = await ClipboardService.pasteFromClipboard();
    if (pastedText !== null) {
      setDisplayValue(pastedText);
      setIsResultDisplayed(false);
    }
    setMenuVisible(false);
  };

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setMenuVisible(true);
      } else {
        setMenuVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuVisible && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };

    const currentContainerRef = containerRef.current;
    if (currentContainerRef) {
      currentContainerRef.addEventListener('contextmenu', handleContextMenu);
    }
    
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      if (currentContainerRef) {
        currentContainerRef.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('click', handleClickOutside);
    };
  }, [menuVisible, containerRef]);

  return {
    menuVisible,
    menuPosition,
    contextMenuRef,
    handleCopy,
    handlePaste
  };
};
