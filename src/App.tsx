import { useRef } from 'react';
import './App.css';

// Components
import { TitleBar } from './presentation/components/TitleBar';
import { CalculatorDisplay } from './presentation/components/CalculatorDisplay';
import { KeypadButtons } from './presentation/components/KeypadButtons';
import { ContextMenu } from './presentation/components/ContextMenu';

// Hooks
import { useCalculator } from './presentation/hooks/useCalculator';
import { useContextMenu } from './presentation/hooks/useContextMenu';
import { useKeyboardInput } from './presentation/hooks/useKeyboardInput';
import { useResizable } from './presentation/hooks/useResizable';

function App() {
  // Container ref for resize and context menu
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculator state and handlers
  const {
    displayValue,
    displayValueRef,
    setDisplayValue,
    setIsResultDisplayed,
    handleNumberClick,
    handleOperatorClick,
    handleActionClick,
    flashButton
  } = useCalculator();
  
  // Context menu state and handlers
  const {
    menuVisible,
    menuPosition,
    contextMenuRef,
    handleCopy,
    handlePaste
  } = useContextMenu(
    containerRef, 
    displayValueRef, 
    setDisplayValue, 
    setIsResultDisplayed
  );
  
  // Setup keyboard input handling
  useKeyboardInput(
    handleNumberClick,
    handleOperatorClick,
    handleActionClick,
    handleCopy,
    handlePaste,
    flashButton
  );
  
  // Setup window resizing
  useResizable(containerRef);

  return (
    <div className="container" ref={containerRef}>
      <div className="calculator">
        <TitleBar />
        <CalculatorDisplay value={displayValue} />
        <KeypadButtons 
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onActionClick={handleActionClick}
        />
      </div>
      
      <ContextMenu 
        visible={menuVisible}
        position={menuPosition}
        onCopy={handleCopy}
        onPaste={handlePaste}
        contextMenuRef={contextMenuRef}
      />
    </div>
  );
}

export default App;