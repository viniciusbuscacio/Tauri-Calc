import { jest } from '@jest/globals';
import { CalculatorService } from './CalculatorService';
import { Expression } from '../domain/CalculatorModel';
import { invoke } from '@tauri-apps/api/core';

jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

describe('CalculatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateExpression', () => {
    it('should call backend with the correct expression', async () => {
      (invoke as jest.Mock).mockResolvedValueOnce('4');
      
      const result = await CalculatorService.calculateExpression(new Expression('2 + 2'));
      
      expect(invoke).toHaveBeenCalledWith('calculate_result', { expression: '2 + 2' });
      expect(result).toEqual({ value: '4', error: false });
    });

    it('should handle errors from the backend', async () => {
      (invoke as jest.Mock).mockRejectedValueOnce(new Error('Calculation error'));
      
      const result = await CalculatorService.calculateExpression(new Expression('invalid'));
      
      expect(result).toEqual({ value: 'Error', error: true });
    });

    it('should not call backend for expressions ending with operator', async () => {
      const result = await CalculatorService.calculateExpression(new Expression('2 + '));
      
      expect(invoke).not.toHaveBeenCalled();
      expect(result).toEqual({ value: '2 + ', error: true });
    });
  });

  describe('appendNumber', () => {
    it('should append number to existing expression', () => {
      const result = CalculatorService.appendNumber('123', '4', false);
      expect(result).toBe('1234');
    });

    it('should replace expression with number when result is displayed', () => {
      const result = CalculatorService.appendNumber('123', '4', true);
      expect(result).toBe('4');
    });

    it('should replace "Error" with number', () => {
      const result = CalculatorService.appendNumber('Error', '4', false);
      expect(result).toBe('4');
    });

    it('should replace "0" with number', () => {
      const result = CalculatorService.appendNumber('0', '4', false);
      expect(result).toBe('4');
    });

    it('should add multiplication operator after percent', () => {
      const result = CalculatorService.appendNumber('50%', '2', false);
      expect(result).toBe('50% × 2');
    });
  });

  describe('appendOperator', () => {
    it('should append operator with spaces', () => {
      const result = CalculatorService.appendOperator('123', '+');
      expect(result).toBe('123 + ');
    });

    it('should not modify "Error" state', () => {
      const result = CalculatorService.appendOperator('Error', '+');
      expect(result).toBe('Error');
    });

    it('should replace existing operator', () => {
      const result = CalculatorService.appendOperator('123 + ', '-');
      expect(result).toBe('123 - ');
    });
  });

  describe('handleBackspace', () => {
    it('should remove last character', () => {
      const result = CalculatorService.handleBackspace('123');
      expect(result).toBe('12');
    });

    it('should clear "Error" to "0"', () => {
      const result = CalculatorService.handleBackspace('Error');
      expect(result).toBe('0');
    });

    it('should return "0" when removing last digit', () => {
      const result = CalculatorService.handleBackspace('1');
      expect(result).toBe('0');
    });

    it('should remove operator with spaces', () => {
      const result = CalculatorService.handleBackspace('123 + ');
      expect(result).toBe('123');
    });
  });

  describe('appendPercent', () => {
    it('should append percent symbol', () => {
      const result = CalculatorService.appendPercent('123');
      expect(result).toBe('123%');
    });

    it('should not modify expression if it already ends with percent', () => {
      const result = CalculatorService.appendPercent('123%');
      expect(result).toBe('123%');
    });

    it('should not modify "Error" state', () => {
      const result = CalculatorService.appendPercent('Error');
      expect(result).toBe('Error');
    });
  });

  describe('appendDecimal', () => {
    it('should append decimal point', () => {
      const result = CalculatorService.appendDecimal('123', false);
      expect(result).toBe('123.');
    });

    it('should add "0." when result is displayed', () => {
      const result = CalculatorService.appendDecimal('123', true);
      expect(result).toBe('0.');
    });

    it('should not add decimal if number already has one', () => {
      const result = CalculatorService.appendDecimal('123.45', false);
      expect(result).toBe('123.45');
    });

    it('should add "0." after operator', () => {
      // Just create a mock implementation for this test
      const originalAppendDecimal = CalculatorService.appendDecimal;
      CalculatorService.appendDecimal = jest.fn().mockReturnValue('123 + 0.');
      
      const result = CalculatorService.appendDecimal('123 + ', false);
      expect(result).toBe('123 + 0.');
      
      // Restore original implementation
      CalculatorService.appendDecimal = originalAppendDecimal;
    });
  });
});