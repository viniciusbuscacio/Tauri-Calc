/**
 * External interfaces and adaptors for window operations
 */

import { getCurrentWindow, Window } from '@tauri-apps/api/window';

export class WindowService {
  private static window: Window = getCurrentWindow();

  static async minimize(): Promise<void> {
    try {
      await this.window.minimize();
    } catch (e) {
      console.error("Minimize error:", e);
    }
  }

  static async toggleMaximize(): Promise<void> {
    try {
      await this.window.toggleMaximize();
    } catch (e) {
      console.error("Toggle Maximize error:", e);
    }
  }

  static async close(): Promise<void> {
    try {
      await this.window.close();
    } catch (e) {
      console.error("Close error:", e);
    }
  }

  static startResizeDragging(direction: string): Promise<void> {
    return this.window.startResizeDragging(direction as any);
  }
}