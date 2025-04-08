import { jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalculatorDisplay } from './CalculatorDisplay';

describe('CalculatorDisplay', () => {
  it('should render display with the given value', () => {
    const { container } = render(<CalculatorDisplay value="123.45" />);
    
    // Use container query to target the specific element
    const displayElement = container.querySelector('#display');
    expect(displayElement).toHaveTextContent('123.45');
  });

  // Test font class application based on content length
  it('should apply different font classes based on content length', () => {
    const { container, rerender } = render(<CalculatorDisplay value="123" />);
    
    // With short content, should have normal size (no extra class)
    const displayElement = container.querySelector('.display');
    expect(displayElement).not.toHaveClass('display-font-step1');
    expect(displayElement).not.toHaveClass('display-font-step2');
    expect(displayElement).not.toHaveClass('display-font-step3');
    
    // Test medium length content (> 10 chars)
    rerender(<CalculatorDisplay value="12345678901" />);
    expect(container.querySelector('.display')).toHaveClass('display-font-step1');
    
    // Test longer content (> 15 chars)
    rerender(<CalculatorDisplay value="1234567890123456" />);
    expect(container.querySelector('.display')).toHaveClass('display-font-step2');
    
    // Test very long content (> 20 chars)
    rerender(<CalculatorDisplay value="123456789012345678901" />);
    expect(container.querySelector('.display')).toHaveClass('display-font-step3');
  });

  it('should apply error class for "Error" value', () => {
    const { container } = render(<CalculatorDisplay value="Error" />);
    
    const displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-error');
  });
});