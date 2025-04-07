# Tauri Calc 🧮

A clean, modern, and cross-platform calculator application built with the power of Tauri, React, and Rust.



## About The Project

This project is a desktop calculator application demonstrating the use of Tauri for building lightweight, secure, and cross-platform apps with web technologies for the frontend and Rust for the backend.

It aims to provide a familiar calculator experience with a custom, native-feeling interface. Calculations are handled efficiently and safely on the Rust backend.

## Features 

*   Standard arithmetic operations: Addition (+), Subtraction (-), Multiplication (×), Division (÷)
*   Percentage (%) calculations (basic frontend implementation)
*   Decimal point (.) input
*   Clear (C / Escape) and Backspace (⌫ / Backspace key) functionality
*   Responsive display with dynamic font sizing for longer numbers
*   Full keyboard support, including Numpad keys and Enter for calculation
*   Visual feedback (button flash) for keyboard input
*   Custom title bar with native-like window controls (Minimize, Maximize/Restore, Close)
*   Window dragging via the title bar
*   Manual window resizing by dragging the edges

## Tech Stack 

*   **Framework:** [Tauri (v2)](https://tauri.app/) - Building cross-platform desktop apps with web frontends.
*   **Backend Logic:** [Rust](https://www.rust-lang.org/)
    *   **Expression Evaluation:** [meval](https://crates.io/crates/meval) crate
*   **Frontend UI:** [React](https://reactjs.org/) (using [Vite](https://vitejs.dev/))
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## Platform Support 

Built with Tauri, this application runs natively on:

*   ✅ **Windows**
*   ✅ **macOS** (Intel & Apple Silicon via Universal Binary)
*   ✅ **Linux**

## Getting Started (Development)

To run this project locally for development:

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) & npm (or yarn/pnpm)
    *   [Rust & Cargo](https://www.rust-lang.org/tools/install)
    *   [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) (Ensure WebView2 for Windows, WebKitGtk for Linux, Xcode Tools for macOS are set up)
2.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```
3.  **Install frontend dependencies:**
    ```bash
    npm install
    # or yarn install / pnpm install
    ```
4.  **Run the development server:**
    ```bash
    npm run tauri dev
    # or yarn tauri dev / pnpm tauri dev
    ```

## Building for Production 🚀

To create distributable application bundles for different platforms:

```bash
npm run tauri build
# or yarn tauri build / pnpm tauri build

This command will generate installers (.msi, .app, .dmg, .deb, .AppImage) in the src-tauri/target/release/bundle/ directory.

Note: For distributing macOS apps without security warnings, code signing and notarization through an Apple Developer account are required.

License
Distributed under the MIT License. See LICENSE file for more information.

