import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeypadButtons } from './KeypadButtons';

describe('KeypadButtons', () => {
  const mockNumberClick = jest.fn();
  const mockOperatorClick = jest.fn();
  const mockActionClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all calculator buttons', () => {
    render(
      <KeypadButtons
        onNumberClick={mockNumberClick}
        onOperatorClick={mockOperatorClick}
        onActionClick={mockActionClick}
      />
    );
    
    // Check if number buttons are rendered
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
    
    // Check if operator buttons are rendered
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
    expect(screen.getByText('÷')).toBeInTheDocument();
    
    // Check if action buttons are rendered
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('.')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });

  it('should call onNumberClick when number buttons are clicked', () => {
    render(
      <KeypadButtons
        onNumberClick={mockNumberClick}
        onOperatorClick={mockOperatorClick}
        onActionClick={mockActionClick}
      />
    );
    
    fireEvent.click(screen.getByText('5'));
    expect(mockNumberClick).toHaveBeenCalledWith('5');
    
    fireEvent.click(screen.getByText('0'));
    expect(mockNumberClick).toHaveBeenCalledWith('0');
  });

  it('should call onOperatorClick when operator buttons are clicked', () => {
    render(
      <KeypadButtons
        onNumberClick={mockNumberClick}
        onOperatorClick={mockOperatorClick}
        onActionClick={mockActionClick}
      />
    );
    
    fireEvent.click(screen.getByText('+'));
    expect(mockOperatorClick).toHaveBeenCalledWith('+');
    
    fireEvent.click(screen.getByText('−'));
    expect(mockOperatorClick).toHaveBeenCalledWith('-');
    
    fireEvent.click(screen.getByText('×'));
    expect(mockOperatorClick).toHaveBeenCalledWith('×');
    
    fireEvent.click(screen.getByText('÷'));
    expect(mockOperatorClick).toHaveBeenCalledWith('÷');
  });

  it('should call onActionClick when action buttons are clicked', () => {
    render(
      <KeypadButtons
        onNumberClick={mockNumberClick}
        onOperatorClick={mockOperatorClick}
        onActionClick={mockActionClick}
      />
    );
    
    fireEvent.click(screen.getByText('C'));
    expect(mockActionClick).toHaveBeenCalledWith('clear');
    
    fireEvent.click(screen.getByText('⌫'));
    expect(mockActionClick).toHaveBeenCalledWith('backspace');
    
    fireEvent.click(screen.getByText('%'));
    expect(mockActionClick).toHaveBeenCalledWith('percent');
    
    fireEvent.click(screen.getByText('.'));
    expect(mockActionClick).toHaveBeenCalledWith('decimal');
    
    fireEvent.click(screen.getByText('='));
    expect(mockActionClick).toHaveBeenCalledWith('calculate');
  });
});