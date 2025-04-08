import { jest } from '@jest/globals';
import { ClipboardService } from './ClipboardService';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

jest.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  readText: jest.fn(),
  writeText: jest.fn(),
}));

describe('ClipboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      (writeText as jest.Mock).mockResolvedValueOnce(undefined);
      
      const result = await ClipboardService.copyToClipboard('123.45');
      
      expect(writeText).toHaveBeenCalledWith('123.45');
      expect(result).toBe(true);
    });

    it('should not copy "Error" text', async () => {
      const result = await ClipboardService.copyToClipboard('Error');
      
      expect(writeText).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors', async () => {
      (writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard error'));
      
      const result = await ClipboardService.copyToClipboard('123.45');
      
      expect(writeText).toHaveBeenCalledWith('123.45');
      expect(result).toBe(false);
    });
  });

  describe('pasteFromClipboard', () => {
    it('should paste valid number from clipboard', async () => {
      (readText as jest.Mock).mockResolvedValueOnce('123.45');
      
      const result = await ClipboardService.pasteFromClipboard();
      
      expect(readText).toHaveBeenCalled();
      expect(result).toBe('123.45');
    });

    it('should extract number from text with non-numeric characters', async () => {
      (readText as jest.Mock).mockResolvedValueOnce('abc123.45xyz');
      
      const result = await ClipboardService.pasteFromClipboard();
      
      expect(result).toBe('123.45');
    });

    it('should return null for non-numeric text', async () => {
      (readText as jest.Mock).mockResolvedValueOnce('abc');
      
      const result = await ClipboardService.pasteFromClipboard();
      
      expect(result).toBe(null);
    });

    it('should handle empty clipboard', async () => {
      (readText as jest.Mock).mockResolvedValueOnce('');
      
      const result = await ClipboardService.pasteFromClipboard();
      
      expect(result).toBe(null);
    });

    it('should handle errors', async () => {
      (readText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard error'));
      
      const result = await ClipboardService.pasteFromClipboard();
      
      expect(result).toBe(null);
    });
  });
});