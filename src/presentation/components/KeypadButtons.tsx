import React from 'react';

interface KeypadButtonsProps {
  onNumberClick: (number: string) => void;
  onOperatorClick: (operator: string) => void;
  onActionClick: (action: string) => void;
}

export const KeypadButtons: React.FC<KeypadButtonsProps> = ({ 
  onNumberClick, 
  onOperatorClick, 
  onActionClick 
}) => {
  return (
    <div className="buttons">
      <button data-action="clear" className="btn clear" onClick={() => onActionClick('clear')}>C</button>
      <button data-action="backspace" className="btn backspace" onClick={() => onActionClick('backspace')}>⌫</button>
      <button data-action="percent" className="btn percent" onClick={() => onActionClick('percent')}>%</button>
      <button data-action="operator" data-operator="/" className="btn operator" onClick={() => onOperatorClick('÷')}>÷</button>
      
      <button data-action="number" data-number="7" className="btn" onClick={() => onNumberClick('7')}>7</button>
      <button data-action="number" data-number="8" className="btn" onClick={() => onNumberClick('8')}>8</button>
      <button data-action="number" data-number="9" className="btn" onClick={() => onNumberClick('9')}>9</button>
      <button data-action="operator" data-operator="*" className="btn operator" onClick={() => onOperatorClick('×')}>×</button>
      
      <button data-action="number" data-number="4" className="btn" onClick={() => onNumberClick('4')}>4</button>
      <button data-action="number" data-number="5" className="btn" onClick={() => onNumberClick('5')}>5</button>
      <button data-action="number" data-number="6" className="btn" onClick={() => onNumberClick('6')}>6</button>
      <button data-action="operator" data-operator="-" className="btn operator" onClick={() => onOperatorClick('-')}>−</button>
      
      <button data-action="number" data-number="1" className="btn" onClick={() => onNumberClick('1')}>1</button>
      <button data-action="number" data-number="2" className="btn" onClick={() => onNumberClick('2')}>2</button>
      <button data-action="number" data-number="3" className="btn" onClick={() => onNumberClick('3')}>3</button>
      <button data-action="operator" data-operator="+" className="btn operator" onClick={() => onOperatorClick('+')}>+</button>
      
      <button data-action="number" data-number="0" className="btn zero" onClick={() => onNumberClick('0')}>0</button>
      <button data-action="decimal" className="btn" onClick={() => onActionClick('decimal')}>.</button>
      <button data-action="calculate" className="btn equals" onClick={() => onActionClick('calculate')}>=</button>
    </div>
  );
};
