// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Define the globals for Jest
import { jest } from '@jest/globals';

// Mock Tauri API
jest.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: jest.fn().mockReturnValue({
    minimize: jest.fn().mockResolvedValue(undefined),
    toggleMaximize: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    startResizeDragging: jest.fn().mockResolvedValue(undefined),
  }),
  Window: jest.fn(),
}));

jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn().mockImplementation((cmd, args) => {
    if (cmd === 'calculate_result') {
      const { expression } = args;
      if (expression === '2 + 2') return Promise.resolve('4');
      if (expression === '3 × 3') return Promise.resolve('9');
      if (expression === '10 ÷ 2') return Promise.resolve('5');
      if (expression === 'error') return Promise.reject('Error');
      // Add more test cases as needed
      // Using Function to avoid eval (which is not allowed in ESM)
      try {
        const calcFn = new Function('return ' + expression.replace('×', '*').replace('÷', '/'));
        return Promise.resolve(String(calcFn()));
      } catch (e) {
        return Promise.reject('Error');
      }
    }
    return Promise.resolve();
  }),
}));

jest.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  readText: jest.fn().mockImplementation(() => {
    return Promise.resolve('123.45');
  }),
  writeText: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));