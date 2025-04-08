//! Infrastructure - technical implementations and adapters

use crate::domain::{Calculator, Expression};
use tauri::menu::{AboutMetadata, MenuBuilder, PredefinedMenuItem, SubmenuBuilder};

/// Implementation of the calculator using the meval library
pub struct MevalCalculator;

impl Calculator for MevalCalculator {
    fn calculate(&self, expression: &Expression) -> Result<f64, String> {
        let normalized = expression.normalize();
        meval::eval_str(&normalized).map_err(|_| "Error".to_string())
    }
}

/// Setup the Tauri application menu
pub fn setup_menu(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
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
}
