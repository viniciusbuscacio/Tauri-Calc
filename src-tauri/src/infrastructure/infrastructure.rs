//! Infrastructure - technical implementations and adapters

use crate::domain::{Calculator, Expression, CalculationResult};
use num_bigint::BigInt;
use std::str::FromStr;
use tauri::menu::{AboutMetadata, MenuBuilder, PredefinedMenuItem, SubmenuBuilder};

/// Implementation of the calculator using the meval library
pub struct MevalCalculator;

impl Calculator for MevalCalculator {
    fn calculate(&self, expression: &Expression) -> Result<CalculationResult, String> {
        // First check for division by zero
        if expression.has_division_by_zero() {
            return Err("Cannot divide by zero".to_string());
        }
        
        let normalized = expression.normalize();
        
        // Check if this is an integer operation that might benefit from BigInt
        if expression.is_integer_operation() {
            // Try to compute with BigInt for precise integer arithmetic
            return match calculate_with_bigint(&normalized) {
                Ok(result) => Ok(CalculationResult::BigInt(result)),
                Err(_) => {
                    // Fall back to floating point if BigInt calculation fails
                    match meval::eval_str(&normalized) {
                        Ok(result) => Ok(CalculationResult::Float(result)),
                        Err(_) => {
                            // Double check if this is a division by zero that our detector missed
                            if normalized.contains('/') {
                                Err("Cannot divide by zero".to_string())
                            } else {
                                Err("Error".to_string())
                            }
                        }
                    }
                }
            };
        }
        
        // Use standard floating-point for other calculations with special handling for decimal precision
        match meval::eval_str(&normalized) {
            Ok(result) => {
                // Check for infinity which usually means division by zero
                if !result.is_finite() {
                    return Err("Cannot divide by zero".to_string());
                }
                
                // If this could be a decimal precision issue (like 0.1 + 0.2 = 0.30000000000000004)
                // apply special handling
                if has_decimal_operation(&normalized) {
                    // Round to 12 decimal places to eliminate floating point errors
                    let rounded = round_float_result(result);
                    Ok(CalculationResult::Float(rounded))
                } else {
                    Ok(CalculationResult::Float(result))
                }
            },
            Err(_) => {
                // Try to determine if this was likely a division by zero
                if normalized.contains('/') {
                    Err("Cannot divide by zero".to_string())
                } else {
                    Err("Error".to_string())
                }
            }
        }
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
        } else if c == '+' || c == '-' || c == '*' || c == '/' {
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
            "/" => {
                // Check for division by zero
                if num == BigInt::from(0) {
                    return Err("Cannot divide by zero".to_string());
                }
                // For simplicity in this implementation, we'll just reject division in BigInt mode
                // since division can produce fractional results and we'd need to handle that properly
                return Err("Integer division not supported".to_string());
            },
            _ => return Err(format!("Unsupported operation: {}", op)),
        }
        
        i += 1;
    }
    
    Ok(result.to_string())
}

/// Detect if an expression involves decimal operations, which might suffer from floating point precision issues
fn has_decimal_operation(expression: &str) -> bool {
    // Check if the expression contains a decimal point
    expression.contains('.')
}

/// Round a floating point result to eliminate precision errors
fn round_float_result(result: f64) -> f64 {
    // Special case for common problematic values
    // Check if the result is very close to a simple decimal
    // This handles cases like 0.1 + 0.2 = 0.30000000000000004
    let epsilon = 1e-10;
    
    // Test special cases for common operations that often have precision issues
    if (result - 0.3).abs() < epsilon {
        return 0.3;
    } else if (result - 0.7).abs() < epsilon {
        return 0.7;
    } else if (result - 0.9).abs() < epsilon {
        return 0.9;
    } else if (result - 0.1).abs() < epsilon {
        return 0.1;
    } else if (result - 0.2).abs() < epsilon {
        return 0.2;
    } else if (result - 0.4).abs() < epsilon {
        return 0.4;
    } else if (result - 0.5).abs() < epsilon {
        return 0.5;
    } else if (result - 0.6).abs() < epsilon {
        return 0.6;
    } else if (result - 0.8).abs() < epsilon {
        return 0.8;
    }
    
    // Handle common fractions like 1/3, 2/3
    if (result - 1.0/3.0).abs() < epsilon {
        return 1.0/3.0;
    } else if (result - 2.0/3.0).abs() < epsilon {
        return 2.0/3.0;
    }
    
    // For other decimal results, round to avoid floating point errors
    // Calculate rounding factor based on value size
    let scale = 10f64.powi(12);
    (result * scale).round() / scale
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
