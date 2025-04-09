import { jest } from '@jest/globals';
import { Expression } from './CalculatorModel';

describe('Expression', () => {
  describe('isOperator', () => {
    it('should return true for valid operators', () => {
      expect(Expression.isOperator('+')).toBe(true);
      expect(Expression.isOperator('-')).toBe(true);
      expect(Expression.isOperator('×')).toBe(true);
      expect(Expression.isOperator('÷')).toBe(true);
    });

    it('should return false for non-operators', () => {
      expect(Expression.isOperator('1')).toBe(false);
      expect(Expression.isOperator('a')).toBe(false);
      expect(Expression.isOperator(' ')).toBe(false);
      expect(Expression.isOperator('*')).toBe(false); // Not using * but ×
    });
  });

  describe('endsWithOperator', () => {
    it('should detect if an expression ends with an operator', () => {
      expect(new Expression('2 + ').endsWithOperator()).toBe(true);
      expect(new Expression('2 - ').endsWithOperator()).toBe(true);
      expect(new Expression('2 × ').endsWithOperator()).toBe(true);
      expect(new Expression('2 ÷ ').endsWithOperator()).toBe(true);
      expect(new Expression('2+').endsWithOperator()).toBe(true);
    });

    it('should return false if expression does not end with an operator', () => {
      expect(new Expression('2 + 2').endsWithOperator()).toBe(false);
      expect(new Expression('123').endsWithOperator()).toBe(false);
      expect(new Expression('').endsWithOperator()).toBe(false);
    });
  });

  describe('endsWithPercent', () => {
    it('should detect if an expression ends with percent symbol', () => {
      expect(new Expression('50%').endsWithPercent()).toBe(true);
      expect(new Expression('100 + 50%').endsWithPercent()).toBe(true);
    });

    it('should return false if expression does not end with percent', () => {
      expect(new Expression('50').endsWithPercent()).toBe(false);
      expect(new Expression('50% + 2').endsWithPercent()).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should detect if an expression is empty', () => {
      expect(new Expression('').isEmpty()).toBe(true);
      expect(new Expression('  ').isEmpty()).toBe(true);
    });

    it('should return false if expression is not empty', () => {
      expect(new Expression('123').isEmpty()).toBe(false);
      expect(new Expression('0').isEmpty()).toBe(false);
    });
  });

  describe('isError', () => {
    it('should detect if an expression has an error', () => {
      expect(new Expression('Error').isError()).toBe(true);
    });

    it('should return false if expression is not an error', () => {
      expect(new Expression('123').isError()).toBe(false);
      expect(new Expression('').isError()).toBe(false);
    });
  });
});