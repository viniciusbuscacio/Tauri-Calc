import React, { useRef, useEffect, useState } from 'react';

interface CalculatorDisplayProps {
  value: string;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ value }) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const [fontClass, setFontClass] = useState('');
  
  // Detect content length and set appropriate font class
  useEffect(() => {
    if (value === "Error") {
      // No font reduction for error messages
      setFontClass('');
      return;
    }
    
    // Remove spaces for accurate character count
    const cleanLength = value.replace(/\s/g, '').length;
    
    // Use discrete steps based on character count
    if (cleanLength > 20) {
      setFontClass('display-font-step3');
    } else if (cleanLength > 15) {
      setFontClass('display-font-step2');
    } else if (cleanLength > 10) {
      setFontClass('display-font-step1');
    } else {
      setFontClass('');
    }
  }, [value]);

  // Combine base class with font size class
  let displayClassName = 'display';
  if (fontClass) {
    displayClassName += ' ' + fontClass;
  }
  if (value === "Error") {
    displayClassName += ' display-error';
  }

  return (
    <div 
      id="display" 
      ref={displayRef} 
      className={displayClassName}
    >
      {value}
    </div>
  );
};
