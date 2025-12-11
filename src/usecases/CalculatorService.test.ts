
import { CalculatorService } from './CalculatorService';

// Mock Tauri invoke
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

describe('CalculatorService', () => {
  describe('appendDecimal', () => {
    test('should add decimal to simple number', () => {
      expect(CalculatorService.appendDecimal('1', false)).toBe('1.');
      expect(CalculatorService.appendDecimal('0', false)).toBe('0.');
    });

    test('should not add decimal if already present', () => {
      expect(CalculatorService.appendDecimal('1.2', false)).toBe('1.2');
      expect(CalculatorService.appendDecimal('0.5', false)).toBe('0.5');
    });

    test('should add 0. if expression ends with operator', () => {
      expect(CalculatorService.appendDecimal('1 +', false)).toBe('1 + 0.');
      expect(CalculatorService.appendDecimal('1 + ', false)).toBe('1 + 0.'); // With space
      // Note: original implementation might fail or behave differently for "1+" without space.
      // We will adjust expectations or code based on this run.
    });

    test('should add decimal to second number in expression', () => {
      expect(CalculatorService.appendDecimal('1 + 2', false)).toBe('1 + 2.');
    });

    test('should not add decimal if second number already has one', () => {
      expect(CalculatorService.appendDecimal('1 + 2.5', false)).toBe('1 + 2.5');
    });

    test('should handle result displayed state', () => {
        expect(CalculatorService.appendDecimal('15', true)).toBe('0.');
    });

    test('should handle Error state', () => {
        expect(CalculatorService.appendDecimal('Error', false)).toBe('0.');
    });
  });
});