import { jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useCalculator } from './useCalculator';
import { CalculatorService } from '../../usecases/CalculatorService';

jest.mock('../../usecases/CalculatorService', () => ({
  CalculatorService: {
    calculateExpression: jest.fn(),
    appendNumber: jest.fn(),
    appendOperator: jest.fn(),
    handleBackspace: jest.fn(),
    appendPercent: jest.fn(),
    appendDecimal: jest.fn(),
  }
}));

describe('useCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default implementations for the mocks
    (CalculatorService.appendNumber as jest.Mock).mockImplementation((current, num) => current + num);
    (CalculatorService.appendOperator as jest.Mock).mockImplementation((current, op) => current + ` ${op} `);
    (CalculatorService.handleBackspace as jest.Mock).mockImplementation(current => current.slice(0, -1) || '0');
    (CalculatorService.appendPercent as jest.Mock).mockImplementation(current => current + '%');
    (CalculatorService.appendDecimal as jest.Mock).mockImplementation(current => current + '.');
    (CalculatorService.calculateExpression as jest.Mock).mockResolvedValue({ value: '42', error: false });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCalculator());
    
    expect(result.current.displayValue).toBe('0');
    expect(result.current.displayValueRef.current).toBe('0');
  });

  it('should handle number clicks', () => {
    (CalculatorService.appendNumber as jest.Mock).mockReturnValue('5');
    
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.handleNumberClick('5');
    });
    
    expect(CalculatorService.appendNumber).toHaveBeenCalledWith('0', '5', false);
    expect(result.current.displayValue).toBe('5');
  });

  it('should handle operator clicks', () => {
    (CalculatorService.appendOperator as jest.Mock).mockReturnValue('0 + ');
    
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.handleOperatorClick('+');
    });
    
    expect(CalculatorService.appendOperator).toHaveBeenCalledWith('0', '+');
    expect(result.current.displayValue).toBe('0 + ');
  });

  it('should handle clear action', () => {
    const { result } = renderHook(() => useCalculator());
    
    // First set some value
    act(() => {
      result.current.setDisplayValue('123');
    });
    
    // Then clear it
    act(() => {
      result.current.handleActionClick('clear');
    });
    
    expect(result.current.displayValue).toBe('0');
  });

  it('should handle backspace action', () => {
    (CalculatorService.handleBackspace as jest.Mock).mockReturnValue('12');
    
    const { result } = renderHook(() => useCalculator());
    
    // First set some value
    act(() => {
      result.current.setDisplayValue('123');
    });
    
    // Then press backspace
    act(() => {
      result.current.handleActionClick('backspace');
    });
    
    expect(CalculatorService.handleBackspace).toHaveBeenCalledWith('123');
    expect(result.current.displayValue).toBe('12');
  });

  it('should handle percent action', () => {
    (CalculatorService.appendPercent as jest.Mock).mockReturnValue('50%');
    
    const { result } = renderHook(() => useCalculator());
    
    // First set some value
    act(() => {
      result.current.setDisplayValue('50');
    });
    
    // Then add percent
    act(() => {
      result.current.handleActionClick('percent');
    });
    
    expect(CalculatorService.appendPercent).toHaveBeenCalledWith('50');
    expect(result.current.displayValue).toBe('50%');
  });

  it('should handle decimal action', () => {
    (CalculatorService.appendDecimal as jest.Mock).mockReturnValue('123.');
    
    const { result } = renderHook(() => useCalculator());
    
    // First set some value
    act(() => {
      result.current.setDisplayValue('123');
    });
    
    // Then add decimal
    act(() => {
      result.current.handleActionClick('decimal');
    });
    
    expect(CalculatorService.appendDecimal).toHaveBeenCalledWith('123', false);
    expect(result.current.displayValue).toBe('123.');
  });

  it('should handle calculate action', async () => {
    (CalculatorService.calculateExpression as jest.Mock).mockResolvedValue({ value: '4', error: false });
    
    const { result } = renderHook(() => useCalculator());
    
    // First set some expression
    act(() => {
      result.current.setDisplayValue('2 + 2');
    });
    
    // Then calculate
    await act(async () => {
      await result.current.handleActionClick('calculate');
    });
    
    expect(CalculatorService.calculateExpression).toHaveBeenCalled();
    expect(result.current.displayValue).toBe('4');
  });

  it('should flash button when called', () => {
    // Mock DOM methods
    const mockAddClass = jest.fn();
    const mockRemoveClass = jest.fn();
    const mockQuerySelector = jest.spyOn(document, 'querySelector').mockReturnValue({
      classList: {
        add: mockAddClass,
        remove: mockRemoveClass
      }
    } as unknown as Element);
    
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.flashButton('.test-button');
    });
    
    expect(mockQuerySelector).toHaveBeenCalledWith('.test-button');
    expect(mockAddClass).toHaveBeenCalledWith('btn-key-active');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(mockRemoveClass).toHaveBeenCalledWith('btn-key-active');
    
    // Cleanup
    jest.useRealTimers();
    mockQuerySelector.mockRestore();
  });
});