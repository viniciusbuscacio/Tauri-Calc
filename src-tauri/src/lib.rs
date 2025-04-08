//! Calculator implementation using Tauri
//! Following Clean Architecture principles

// Include modules directly (not as submodules of lib)
pub mod domain;
pub mod usecases;
pub mod infrastructure;
pub mod presentation;

// Specific imports for use
#[cfg(not(target_os = "linux"))]
use infrastructure::setup_menu;
use presentation::commands::calculate_result;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    
    // Only set up menu on non-Linux platforms
    #[cfg(not(target_os = "linux"))]
    let builder = builder.setup(|app| {
        setup_menu(app)?;
        Ok(())
    });
    
    // For all platforms, continue with the rest of the setup
    builder
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate_result])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}