/**
 * External interfaces and adaptors for clipboard operations
 */

import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

export class ClipboardService {
  static async copyToClipboard(text: string): Promise<boolean> {
    if (text === "Error") return false;
    
    try {
      await writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy text:", err);
      return false;
    }
  }

  static async pasteFromClipboard(): Promise<string | null> {
    try {
      const textToPaste = await readText();
      if (textToPaste !== null && textToPaste.trim() !== "") {
        const potentialNumber = textToPaste.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(potentialNumber);
        if (!isNaN(parsed)) {
          return String(parsed);
        } else {
          console.warn("Pasted text not valid number:", textToPaste);
        }
      }
      return null;
    } catch (err) {
      console.error("Failed to read clipboard text:", err);
      return null;
    }
  }
}