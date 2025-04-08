import { useEffect } from 'react';

export const useKeyboardInput = (
  handleNumberClick: (number: string) => void,
  handleOperatorClick: (operator: string) => void,
  handleActionClick: (action: string) => void,
  handleCopy: () => void,
  handlePaste: () => void,
  flashButton: (selector: string) => void
) => {
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
            handleNumberClick(event.key);
            break;
            
          case '+': case '-': case '*': case '/':
            if (event.key === '+') buttonSelector = 'button[data-operator="+"]';
            else if (event.key === '-') buttonSelector = 'button[data-operator="-"]';
            else if (event.key === '*') buttonSelector = 'button[data-operator="*"]';
            else if (event.key === '/') buttonSelector = 'button[data-operator="/"]';
            
            handleOperatorClick(event.key === '*' ? '×' : event.key === '/' ? '÷' : event.key);
            break;
            
          case '.':
            buttonSelector = 'button[data-action="decimal"]';
            handleActionClick('decimal');
            break;
            
          case '%':
            buttonSelector = 'button[data-action="percent"]';
            handleActionClick('percent');
            break;
            
          case 'Backspace':
            buttonSelector = 'button[data-action="backspace"]';
            handleActionClick('backspace');
            break;
            
          case 'Escape': case 'c': case 'C':
            buttonSelector = 'button[data-action="clear"]';
            handleActionClick('clear');
            break;
            
          default:
            handled = false;
            break;
        }
      }
      
      if (handled && buttonSelector) {
        flashButton(buttonSelector);
      }
      
      if (handled) {
        event.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNumberClick, handleOperatorClick, handleActionClick, handleCopy, handlePaste, flashButton]);
};
