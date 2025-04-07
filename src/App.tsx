import { useState, useEffect, useRef } from 'react'; // Removido ReactMouseEvent
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
// --- IMPORT CORRETO DO PLUGIN CLIPBOARD ---
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
// ----------------------------------------
import './App.css';

const currentWindow: Window = getCurrentWindow();

const RUST_CMD = {
  CALCULATE: 'calculate_result'
};

const FONT_THRESHOLD_1 = 9;
const FONT_THRESHOLD_2 = 12;
const FONT_THRESHOLD_3 = 14;

const flashButton = (selector: string) => {
  const button = document.querySelector(selector) as HTMLButtonElement | null;
  if (button) {
    button.classList.add('btn-key-active');
    setTimeout(() => { button.classList.remove('btn-key-active'); }, 150);
  }
};

function App() {
  const [displayValue, setDisplayValue] = useState("0");
  const [isResultDisplayed, setIsResultDisplayed] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  // --- Funções de Controle da Janela ---
  const handleMinimize = async () => { try { await currentWindow.minimize(); } catch(e) { console.error("Minimize error:", e); } };
  const handleToggleMaximize = async () => { try { await currentWindow.toggleMaximize(); } catch(e) { console.error("Toggle Maximize error:", e); } };
  const handleClose = async () => { try { await currentWindow.close(); } catch(e) { console.error("Close error:", e); } };
  // -----------------------------

  // --- Função Centralizada de Cálculo ---
  const performCalculation = async () => {
    const expressionToSend = displayValueRef.current;
    const endsWithOperatorAndSpace = /[+\-×÷]\s$/.test(expressionToSend);
    const endsWithJustOperator = /[+\-×÷]$/.test(expressionToSend.trim());
    if (expressionToSend === "Error" || expressionToSend.trim() === "" || endsWithOperatorAndSpace || endsWithJustOperator) { return; }
    try {
      const result = await invoke<string>(RUST_CMD.CALCULATE, { expression: expressionToSend });
      setDisplayValue(result);
      setIsResultDisplayed(true);
    } catch (error) {
      console.error(`Erro ao invocar ${RUST_CMD.CALCULATE}:`, error);
      setDisplayValue("Error");
      setIsResultDisplayed(false);
    }
  };
  // ------------------------------------

  // --- Funções de Copiar/Colar ---
  const handleCopy = async () => {
    const textToCopy = displayValueRef.current;
    if (textToCopy === "Error") return;
    try { await writeText(textToCopy); } catch (err) { console.error("Failed to copy text (plugin):", err); }
    setMenuVisible(false);
  };
  const handlePaste = async () => {
    try {
      const textToPaste = await readText();
      if (textToPaste !== null && textToPaste.trim() !== "") {
        const potentialNumber = textToPaste.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(potentialNumber);
        if (!isNaN(parsed)) {
          setDisplayValue(String(parsed));
          setIsResultDisplayed(false);
        } else { console.warn("Pasted text not valid number:", textToPaste); }
      }
    } catch (err) { console.error("Failed to read clipboard text (plugin):", err); }
    setMenuVisible(false);
  };
  // -----------------------------

  // --- Lógica da Calculadora ---
   const handleNumberClick = (number: string) => {
    setDisplayValue(prevDisplayValue => {
      if (isResultDisplayed) {
        setIsResultDisplayed(false);
        return number;
      } else {
        if (prevDisplayValue === "0" || prevDisplayValue === "Error") { return number; }
        if (prevDisplayValue.endsWith('%')) { return prevDisplayValue + ` × ${number}`; }
        return prevDisplayValue + number;
      }
    });
   };

  const handleOperatorClick = (operator: string) => {
     setIsResultDisplayed(false);
     setDisplayValue(prev => {
       if (prev === "Error") return prev;
       const endsWithOperatorAndSpace = /[+\-×÷]\s$/.test(prev);
       const endsWithAnyOperator = /[+\-×÷%]$/.test(prev.trim());
       if (endsWithOperatorAndSpace || endsWithAnyOperator) {
           const trimmed = prev.trimEnd();
           const base = endsWithOperatorAndSpace ? trimmed.slice(0, -1).trimEnd() : trimmed.trimEnd();
           if(base.endsWith('%') && !endsWithOperatorAndSpace) return prev;
           return base + ` ${operator} `;
       } else {
           return prev + ` ${operator} `;
       }
     });
   };

  // --- handleActionClick (Refatorado para corrigir erros TS2345) ---
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'clear':
        setDisplayValue("0");
        setIsResultDisplayed(false);
        break;

      case 'backspace':
        // Calcula o novo valor ANTES de chamar setDisplayValue
        const currentValBackspace = displayValueRef.current; // Usa ref para valor síncrono
        let nextValBackspace = currentValBackspace;
        if (currentValBackspace !== "Error") {
            if (currentValBackspace.endsWith(' ')) {
                nextValBackspace = currentValBackspace.slice(0, -3); // Remove operador + espaço
            } else if (currentValBackspace.length > 1) {
                nextValBackspace = currentValBackspace.slice(0, -1); // Remove último char
            } else {
                nextValBackspace = "0"; // Volta a zero se só tinha 1 char
            }
        } else {
            nextValBackspace = "0"; // Limpa "Error" para "0"
        }
        // Define o novo valor diretamente
        setDisplayValue(nextValBackspace);
        setIsResultDisplayed(false); // Sempre reseta flag
        break;

      case 'percent':
        // Calcula o novo valor ANTES de chamar setDisplayValue
        const currentValPercent = displayValueRef.current;
        let nextValPercent = currentValPercent;
        if(currentValPercent !== "Error" && !(/[+\-×÷]\s$/.test(currentValPercent)) && !currentValPercent.endsWith('%')) {
           nextValPercent = currentValPercent + '%';
        }
        // Define o novo valor diretamente
        setDisplayValue(nextValPercent);
        setIsResultDisplayed(false); // Sempre reseta flag
        break;

      case 'decimal':
         // Ainda precisa do callback pois depende do estado isResultDisplayed
         setDisplayValue(prev => {
           if (isResultDisplayed) {
             setIsResultDisplayed(false);
             return "0.";
           }
           if (prev === "Error") return "0.";
           if (prev.trimEnd().endsWith(' ')) {
               return prev + '0.';
           }
           const parts = prev.split(' ');
           const currentNumber = parts[parts.length - 1];
           if (!currentNumber.includes('.')) {
               return prev + '.';
           }
           return prev; // Retorna o estado anterior se não houver mudança
         });
         // Flag gerenciada no callback
         break;

      case 'calculate':
        performCalculation();
        break;
      default: console.warn("Unhandled action:", action); break;
    }
  };
  // -----------------------------

  // --- useEffect Redimensionamento (CORRIGIDO para usar event) ---
  useEffect(() => {
     const handleMouseDown = (event: MouseEvent) => { // event declarado
        const target = event.target as HTMLElement; // event USADO
        if (target.closest('[data-tauri-drag-region]') || target.closest('.window-controls')) { return; }
        const element = containerRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const borderSensitivity = 10;
        // event USADO
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
            event.preventDefault(); // event USADO
            currentWindow.startResizeDragging(resizeDirection as any).catch(err => console.error(err));
        }
     };
     window.addEventListener('mousedown', handleMouseDown);
     return () => { window.removeEventListener('mousedown', handleMouseDown); };
  }, []); // Array vazio está correto

   // --- useEffect Teclado ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let handled = true;
      let buttonSelector: string | null = null;

      // Cmd+C / Ctrl+C
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') {
          handleCopy();
      }
      // Cmd+V / Ctrl+V
      else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v') {
          handlePaste();
      }
      // Enter ou =
      else if (event.key === 'Enter' || event.key === '=') {
          buttonSelector = 'button[data-action="calculate"]';
          handleActionClick('calculate');
      } else {
        // Outras teclas
        switch (event.key) {
          case '0': case '1': case '2': case '3': case '4':
          case '5': case '6': case '7': case '8': case '9':
            buttonSelector = `button[data-number="${event.key}"]`;
            handleNumberClick(event.key); break;
          case '+': case '-': case '*': case '/':
             if (event.key === '+') buttonSelector = 'button[data-operator="+"]';
             else if (event.key === '-') buttonSelector = 'button[data-operator="-"]';
             else if (event.key === '*') buttonSelector = 'button[data-operator="*"]';
             else if (event.key === '/') buttonSelector = 'button[data-operator="/"]';
             handleOperatorClick(event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key); break;
          case '.':
            buttonSelector = 'button[data-action="decimal"]';
            handleActionClick('decimal'); break;
          case '%':
            buttonSelector = 'button[data-action="percent"]';
            handleActionClick('percent'); break;
          case 'Backspace':
             buttonSelector = 'button[data-action="backspace"]';
             handleActionClick('backspace'); break;
          case 'Escape': case 'c': case 'C':
            buttonSelector = 'button[data-action="clear"]';
            handleActionClick('clear'); break;
          default:
            handled = false; break;
        }
      }
      if (handled && buttonSelector) { flashButton(buttonSelector); }
      if (handled) { event.preventDefault(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, []); // Array vazio aqui
  // -----------------------------

  // --- useEffect para Menu de Contexto ---
  useEffect(() => {
    const handleContextMenu = (event: globalThis.MouseEvent) => {
        event.preventDefault();
        if (containerRef.current && containerRef.current.contains(event.target as Node)) {
            setMenuPosition({ x: event.clientX, y: event.clientY });
            setMenuVisible(true);
        } else { setMenuVisible(false); }
    };
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuVisible && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };
    const currentContainerRef = containerRef.current;
    if (currentContainerRef) { currentContainerRef.addEventListener('contextmenu', handleContextMenu); }
    window.addEventListener('click', handleClickOutside);
    return () => {
      if (currentContainerRef) { currentContainerRef.removeEventListener('contextmenu', handleContextMenu); }
      window.removeEventListener('click', handleClickOutside);
    };
  }, [menuVisible]);
  // -----------------------------------

  // --- Calcula className dinâmico ---
  let displayClassName = 'display';
  const len = displayValue.replace(/ /g, '').length;
  if (displayValue !== "Error") {
    if (len > FONT_THRESHOLD_3) { displayClassName += ' display-font-step3'; }
    else if (len > FONT_THRESHOLD_2) { displayClassName += ' display-font-step2'; }
    else if (len > FONT_THRESHOLD_1) { displayClassName += ' display-font-step1'; }
  }
  // ------------------------------------

  return (
    <div className="container" ref={containerRef}>
      <div className="calculator">
        {/* Title Bar */}
        <div className="title-bar" data-tauri-drag-region>
          <span className="title" data-tauri-drag-region>Calc</span>
          <div className="window-controls">
                <button id="minimize-btn" className="minimize-btn" onClick={handleMinimize}>−</button>
                <button id="fullscreen-btn" className="fullscreen-btn" onClick={handleToggleMaximize}>⛶</button>
                <button id="close-btn" className="close-btn" onClick={handleClose}>×</button>
          </div>
        </div>
        {/* Display */}
        <div id="display" className={displayClassName}>{displayValue}</div>
        {/* Buttons */}
        <div className="buttons">
              <button data-action="clear" className="btn clear" onClick={() => handleActionClick('clear')}>C</button>
              <button data-action="backspace" className="btn backspace" onClick={() => handleActionClick('backspace')}>⌫</button>
              <button data-action="percent" className="btn percent" onClick={() => handleActionClick('percent')}>%</button>
              <button data-action="operator" data-operator="/" className="btn operator" onClick={() => handleOperatorClick('÷')}>÷</button>
              <button data-action="number" data-number="7" className="btn" onClick={() => handleNumberClick('7')}>7</button>
              <button data-action="number" data-number="8" className="btn" onClick={() => handleNumberClick('8')}>8</button>
              <button data-action="number" data-number="9" className="btn" onClick={() => handleNumberClick('9')}>9</button>
              <button data-action="operator" data-operator="*" className="btn operator" onClick={() => handleOperatorClick('×')}>×</button>
              <button data-action="number" data-number="4" className="btn" onClick={() => handleNumberClick('4')}>4</button>
              <button data-action="number" data-number="5" className="btn" onClick={() => handleNumberClick('5')}>5</button>
              <button data-action="number" data-number="6" className="btn" onClick={() => handleNumberClick('6')}>6</button>
              <button data-action="operator" data-operator="-" className="btn operator" onClick={() => handleOperatorClick('-')}>−</button>
              <button data-action="number" data-number="1" className="btn" onClick={() => handleNumberClick('1')}>1</button>
              <button data-action="number" data-number="2" className="btn" onClick={() => handleNumberClick('2')}>2</button>
              <button data-action="number" data-number="3" className="btn" onClick={() => handleNumberClick('3')}>3</button>
              <button data-action="operator" data-operator="+" className="btn operator" onClick={() => handleOperatorClick('+')}>+</button>
              <button data-action="number" data-number="0" className="btn zero" onClick={() => handleNumberClick('0')}>0</button>
              <button data-action="decimal" className="btn" onClick={() => handleActionClick('decimal')}>.</button>
              <button data-action="calculate" className="btn equals" onClick={() => handleActionClick('calculate')}>=</button>
        </div>
      </div>

      {/* --- Menu de Contexto --- */}
      {menuVisible && (
        <div ref={contextMenuRef} style={{ position: 'absolute', top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, backgroundColor: '#4f4f4f', border: '1px solid #666', borderRadius: '4px', boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.5)', padding: '5px 0', zIndex: 1000, color: 'white', minWidth: '100px', fontSize: '14px', }} >
          <div onClick={handleCopy} style={{ padding: '6px 15px', cursor: 'default' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a6a6a')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')} >Copy</div>
          <div onClick={handlePaste} style={{ padding: '6px 15px', cursor: 'default' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a6a6a')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')} >Paste</div>
        </div>
      )}
      {/* --------------------- */}
    </div>
  );
}

export default App;