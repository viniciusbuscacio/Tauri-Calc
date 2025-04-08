import React, { useRef, useEffect, useState } from 'react';

interface CalculatorDisplayProps {
  value: string;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({ value }) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const [fontClass, setFontClass] = useState('');
  
  // Calculate available space and set appropriate font class
  useEffect(() => {
    if (value === "Error") {
      // No font reduction for error messages
      setFontClass('');
      return;
    }
    
    if (!displayRef.current) return;
    
    let ratio = 0;
    
    try {
      // Create a hidden test element to measure text width
      const testEl = document.createElement('div');
      testEl.style.position = 'absolute';
      testEl.style.visibility = 'hidden';
      testEl.style.height = 'auto';
      testEl.style.width = 'auto';
      testEl.style.whiteSpace = 'nowrap';
      testEl.style.fontSize = '2.8rem'; // Default font size
      testEl.style.fontWeight = '300';
      testEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
      testEl.innerHTML = value;
      document.body.appendChild(testEl);
      
      // Get container and test element dimensions
      // Use a default value of 300px for the container width in test environments
      const containerWidth = (displayRef.current.clientWidth || 300) - 40; // Subtract padding (20px on each side)
      const textWidth = testEl.clientWidth || 0;
      
      // Remove the test element
      document.body.removeChild(testEl);
      
      // Calculate the ratio of text width to container width
      ratio = textWidth / containerWidth;
    } catch (error) {
      // In test environment, fallback to character count method
      const cleanLength = value.replace(/\s/g, '').length;
      if (cleanLength > 14) {
        setFontClass('display-font-step3');
        return;
      } else if (cleanLength > 11) {
        setFontClass('display-font-step2');
        return;
      } else if (cleanLength > 9) {
        setFontClass('display-font-step1');
        return;
      } else {
        setFontClass('');
        return;
      }
    }
    
    // Set font class based on available space
    if (ratio > 1.5) {
      setFontClass('display-font-step3');
    } else if (ratio > 1.2) {
      setFontClass('display-font-step2');
    } else if (ratio > 1) {
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