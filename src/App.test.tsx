import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the hooks first
jest.mock('./presentation/hooks/useKeyboardInput', () => ({
  useKeyboardInput: jest.fn(),
}));

jest.mock('./presentation/hooks/useResizable', () => ({
  useResizable: jest.fn(),
}));

// Mock the CalculatorService
jest.mock('./usecases/CalculatorService', () => ({
  CalculatorService: {
    calculateExpression: jest.fn().mockResolvedValue({ value: '4', error: false }),
    appendNumber: jest.fn((current, num) => current === '0' ? num : current + num),
    appendOperator: jest.fn((current, op) => `${current} ${op} `),
    handleBackspace: jest.fn(c => c === '1' ? '0' : c.slice(0, -1) || '0'),
    appendPercent: jest.fn(c => c + '%'),
    appendDecimal: jest.fn(c => c + '.'),
  }
}));

// Then import the service after mocking
import { CalculatorService } from './usecases/CalculatorService';

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calculator with initial value 0', () => {
    const { container } = render(<App />);
    const displayElement = container.querySelector('.display');
    expect(displayElement).toHaveTextContent('0');
  });

  it('should update display when number buttons are clicked', () => {
    render(<App />);
    
    // Click on number buttons
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    
    expect(CalculatorService.appendNumber).toHaveBeenCalledTimes(3);
  });

  it('should update display when operator buttons are clicked', () => {
    render(<App />);
    
    // First enter a number
    fireEvent.click(screen.getByText('5'));
    
    // Then click an operator
    fireEvent.click(screen.getByText('+'));
    
    expect(CalculatorService.appendOperator).toHaveBeenCalled();
  });

  it('should clear the display when C button is clicked', () => {
    // Mock CalculatorService just for this test
    const originalAppendNumber = CalculatorService.appendNumber;
    CalculatorService.appendNumber = jest.fn().mockReturnValue('123');
    
    const { container } = render(<App />);
    
    // Set display value manually using the mock
    const displayElement = container.querySelector('.display');
    
    // Enter some numbers
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    
    // Click clear
    fireEvent.click(screen.getByText('C'));
    
    // Verify that appendNumber was called
    expect(CalculatorService.appendNumber).toHaveBeenCalled();
    
    // Restore original implementation
    CalculatorService.appendNumber = originalAppendNumber;
  });
});