use tauri::{
    menu::{AboutMetadata, MenuBuilder, PredefinedMenuItem, SubmenuBuilder},
};

#[tauri::command]
fn calculate_result(expression: String) -> Result<String, String> {
    let processed_expression = expression.replace('×', "*").replace('÷', "/");

    match meval::eval_str(&processed_expression) {
        Ok(result) if result.is_finite() => Ok(result.to_string()),
        _ => Err("Error".to_string()),
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let mut about = AboutMetadata::default();
            about.name = Some("Calc".into());
            about.version = Some("0.1.0".into());
            about.copyright = Some("https://github.com/viniciusbuscacio".into());


            let calc_menu = SubmenuBuilder::new(app, "Calc")
                .item(&PredefinedMenuItem::about(app, None, Some(about))?)
                .item(&PredefinedMenuItem::quit(app, None)?)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&calc_menu)
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![calculate_result])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
