import { jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalculatorDisplay } from './CalculatorDisplay';

describe.skip('CalculatorDisplay', () => {
  // Mock the DOM API for testing
  beforeEach(() => {
    // Mock Element.clientWidth and other DOM APIs
    // that are needed for the width measurement
    const mockElement = {
      clientWidth: 300,
      style: {},
      innerHTML: '',
    };

    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation(() => {
      return {
        ...mockElement,
        style: {},
      };
    });

    // Mock adding and removing elements from DOM
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    // Mock Element.clientWidth on the ref
    Object.defineProperty(HTMLDivElement.prototype, 'clientWidth', {
      configurable: true,
      value: 300,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render display with the given value', () => {
    const { container } = render(<CalculatorDisplay value="123.45" />);
    
    // Use container query to target the specific element
    const displayElement = container.querySelector('#display');
    expect(displayElement).toHaveTextContent('123.45');
  });

  // Test font class application
  it('should render with the display class', () => {
    const { container } = render(<CalculatorDisplay value="123" />);
    
    // With any content, should have the display class
    const displayElement = container.querySelector('#display');
    expect(displayElement).toHaveClass('display');
  });

  // Test error class application
  it('should apply error class for "Error" value', () => {
    const { container } = render(<CalculatorDisplay value="Error" />);
    
    const displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-error');
  });

  // Test the fallback to character count method when DOM measurement fails
  it('should fall back to character count method if measurement fails', () => {
    // Force an error in the try/catch block by making appendChild throw
    document.body.appendChild = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    const { container } = render(<CalculatorDisplay value="123456789012345" />);
    
    // With 15 characters, should have display-font-step2 class
    const displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-font-step2');
  });

  // Test different font sizes based on simulated width ratios
  it('should apply font size classes based on calculated width ratio', () => {
    // Create a mock implementation for createElement that returns
    // elements with different clientWidth values
    const mockCreateElement = (width) => {
      document.createElement = jest.fn().mockImplementation(() => ({
        style: {},
        clientWidth: width,
      }));
    };

    // Test with small content that fits in the container (ratio < 1)
    mockCreateElement(200); // Container is 300px, text is 200px (ratio = 0.66)
    const { container, rerender } = render(<CalculatorDisplay value="123" />);
    let displayElement = container.querySelector('.display');
    // Should use default font size (no extra class)
    expect(displayElement).not.toHaveClass('display-font-step1');
    expect(displayElement).not.toHaveClass('display-font-step2');
    expect(displayElement).not.toHaveClass('display-font-step3');
    
    // Test with medium content (ratio > 1)
    mockCreateElement(330); // Container is 300px, text is 330px (ratio = 1.1)
    rerender(<CalculatorDisplay value="12345678901" />);
    displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-font-step1');
    
    // Test with larger content (ratio > 1.2)
    mockCreateElement(400); // Container is 300px, text is 400px (ratio = 1.33)
    rerender(<CalculatorDisplay value="1234567890123456" />);
    displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-font-step2');
    
    // Test with very large content (ratio > 1.5)
    mockCreateElement(500); // Container is 300px, text is 500px (ratio = 1.66)
    rerender(<CalculatorDisplay value="123456789012345678901" />);
    displayElement = container.querySelector('.display');
    expect(displayElement).toHaveClass('display-font-step3');
  });
});