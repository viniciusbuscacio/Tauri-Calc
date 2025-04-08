# Tauri Calc

A clean, modern, and cross-platform calculator application built with Tauri, React, and Rust following Clean Architecture principles.


## About The Project

This project is a desktop calculator application built with Tauri, created for study purposes. The idea is to understand how Tauri works, and the interaction with Rust, React, Typescript, and also operational systems (Windows 11, MAC OS, Ubuntu Linux).

Also, the application is structured following Clean Architecture principles, making it maintainable, testable, and adaptable.

The calculator features a modern UI with custom window chrome, providing a native-feeling experience across platforms. All calculations are performed safely within the Rust backend, utilizing the meval parsing library for expression evaluation.

## Features

* Standard arithmetic operations: Addition (+), Subtraction (-), Multiplication (×), Division (÷)
* Percentage (%) calculations
* Decimal point input with automatic "0" prefixing (e.g., "5/.3" becomes "5/0.3")
* Arbitrary precision for large integer operations (using BigInt)
* Precise floating-point handling (e.g., "0.1 + 0.2" correctly yields "0.3")
* Proper error handling for division by zero with specific error message
* Clear (C) and Backspace functionality
* Responsive display with dynamic font sizing based on actual text width
* Complete keyboard support, including Numpad and function keys
* Visual feedback for keyboard input
* Custom title bar with window controls (Minimize, Maximize/Restore, Close)
* Window dragging via the title bar
* Window resizing via edge dragging
* Clipboard integration (Copy/Paste)
* Right-click context menu
* Cross-platform compatibility (Windows, macOS, Linux)

## Architecture

The application follows Clean Architecture principles, with clear separation of concerns:

* **Domain Layer**: Core business logic and entities
* **Use Cases Layer**: Application-specific business rules
* **Infrastructure Layer**: External interfaces and technical implementations
* **Presentation Layer**: UI components and user interaction

## Tech Stack

* **Framework**: [Tauri (v2)](https://tauri.app/) - Cross-platform desktop application framework
* **Backend**:
  * **Language**: [Rust](https://www.rust-lang.org/)
  * **Expression Evaluation**: [meval](https://crates.io/crates/meval) crate
  * **Arbitrary Precision**: [num-bigint](https://crates.io/crates/num-bigint) crate
* **Frontend**:
  * **Framework**: [React](https://reactjs.org/)
  * **Build Tool**: [Vite](https://vitejs.dev/)
  * **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Testing**:
  * **Frontend**: Jest + Testing Library
  * **Backend**: Rust's native testing framework

## Platform Support

Built with Tauri, this application runs natively on:

* **Windows** 10/11
* **macOS** (Intel & Apple Silicon via Universal Binary)
* **Linux** (Debian/Ubuntu-based distributions)

## Development Setup

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Rust & Cargo](https://www.rust-lang.org/tools/install) (2021 edition)
* Platform-specific dependencies:
  * **Windows**: Microsoft Visual C++ Build Tools, WebView2
  * **macOS**: Xcode Command Line Tools
  * **Linux**: WebKitGTK, standard build tools

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/viniciusbuscacio/Tauri-Calc.git
   cd Tauri-Calc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run tauri dev
   ```

## Building for Production

To create distributable application bundles:

```bash
npm run tauri build
```

This command generates platform-specific installers in `src-tauri/target/release/bundle/`:
* Windows: `.msi` installer
* macOS: `.dmg` and `.app` bundle
* Linux: `.deb` and `.AppImage`

**Note:** For macOS distribution, code signing and notarization via an Apple Developer account are required to avoid security warnings.

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage reporting:

```bash
npm run test:coverage
```

## License

Distributed under the MIT License. See `LICENSE` file for more information.

