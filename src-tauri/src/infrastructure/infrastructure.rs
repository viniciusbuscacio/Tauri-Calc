//! Infrastructure - technical implementations and adapters

use crate::domain::{Calculator, Expression, CalculationResult};
use num_bigint::BigInt;
use std::str::FromStr;
use tauri::menu::{AboutMetadata, MenuBuilder, PredefinedMenuItem, SubmenuBuilder};

/// Implementation of the calculator using the meval library
pub struct MevalCalculator;

impl Calculator for MevalCalculator {
    fn calculate(&self, expression: &Expression) -> Result<CalculationResult, String> {
        let normalized = expression.normalize();
        
        // Check if this is an integer operation that might benefit from BigInt
        if expression.is_integer_operation() {
            // Try to compute with BigInt for precise integer arithmetic
            return match calculate_with_bigint(&normalized) {
                Ok(result) => Ok(CalculationResult::BigInt(result)),
                Err(_) => {
                    // Fall back to floating point if BigInt calculation fails
                    meval::eval_str(&normalized)
                        .map(CalculationResult::Float)
                        .map_err(|_| "Error".to_string())
                }
            };
        }
        
        // Use standard floating-point for other calculations
        meval::eval_str(&normalized)
            .map(CalculationResult::Float)
            .map_err(|_| "Error".to_string())
    }
}

/// Calculate an integer expression using BigInt for arbitrary precision
fn calculate_with_bigint(expression: &str) -> Result<String, String> {
    // Simple tokenization for basic operations
    let mut tokens = Vec::new();
    let mut current_number = String::new();
    
    // Parse expression into tokens (numbers and operators)
    for c in expression.chars() {
        if c.is_digit(10) {
            current_number.push(c);
        } else if c == '+' || c == '-' || c == '*' {
            if !current_number.is_empty() {
                tokens.push(current_number.clone());
                current_number.clear();
            }
            tokens.push(c.to_string());
        } else if !c.is_whitespace() {
            return Err(format!("Unsupported character in integer expression: {}", c));
        }
    }
    
    // Push the last number if there is one
    if !current_number.is_empty() {
        tokens.push(current_number);
    }
    
    // Handle single number case
    if tokens.len() == 1 {
        return Ok(tokens[0].clone());
    }
    
    // Simple evaluation for basic operations
    let mut result = BigInt::from_str(&tokens[0])
        .map_err(|_| "Invalid number format".to_string())?;
    
    let mut i = 1;
    while i < tokens.len() {
        let op = &tokens[i];
        i += 1;
        
        if i >= tokens.len() {
            return Err("Unexpected end of expression".to_string());
        }
        
        let num = BigInt::from_str(&tokens[i])
            .map_err(|_| "Invalid number format".to_string())?;
        
        match op.as_str() {
            "+" => result += num,
            "-" => result -= num,
            "*" => result *= num,
            _ => return Err(format!("Unsupported operation: {}", op)),
        }
        
        i += 1;
    }
    
    Ok(result.to_string())
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
