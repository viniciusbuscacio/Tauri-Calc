import React from 'react';

interface ContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onCopy: () => void;
  onPaste: () => void;
  contextMenuRef: React.RefObject<HTMLDivElement>;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  visible, 
  position, 
  onCopy, 
  onPaste, 
  contextMenuRef 
}) => {
  if (!visible) return null;

  return (
    <div 
      ref={contextMenuRef} 
      style={{ 
        position: 'absolute', 
        top: `${position.y}px`, 
        left: `${position.x}px`, 
        backgroundColor: '#4f4f4f', 
        border: '1px solid #666', 
        borderRadius: '4px', 
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.5)', 
        padding: '5px 0', 
        zIndex: 1000, 
        color: 'white', 
        minWidth: '100px', 
        fontSize: '14px'
      }}
    >
      <div 
        onClick={onCopy} 
        style={{ padding: '6px 15px', cursor: 'default' }} 
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a6a6a')} 
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Copy
      </div>
      <div 
        onClick={onPaste} 
        style={{ padding: '6px 15px', cursor: 'default' }} 
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a6a6a')} 
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Paste
      </div>
    </div>
  );
};
