//! Domain - entities and business rules
use std::fmt::Display;
use meval;

/// Mathematical expression to be calculated
pub struct Expression(pub String);

impl Expression {
    /// Create a new expression
    pub fn new(expression: String) -> Self {
        Expression(expression)
    }
    
    /// Normalize the expression to the format that the meval library understands
    pub fn normalize(&self) -> String {
        self.0.replace('×', "*").replace('÷', "/")
    }
    
    /// Check if the expression contains division by zero
    pub fn has_division_by_zero(&self) -> bool {
        let normalized = self.normalize();
        
        // Using regular expressions would be better, but for simplicity we'll use string patterns
        
        // Check for common division by zero patterns
        
        // Case 1: Direct patterns like x/0 or x/ 0
        let parts: Vec<&str> = normalized.split('/').collect();
        
        // Skip the first part (before first division)
        for i in 1..parts.len() {
            let part = parts[i].trim();
            
            // Empty part means something like "5/"
            if part.is_empty() {
                return true;
            }
            
            // Division by exact zero: "5/0"
            if part == "0" {
                return true;
            }
            
            // Division where the divisor starts with 0 but isn't 0.something
            if part.starts_with('0') && part.len() > 1 && !part.starts_with("0.") {
                // Check if it's a number starting with 0
                let after_zero = &part[1..];
                if after_zero.chars().next().unwrap_or(' ').is_digit(10) {
                    // It's something like "00", "01", etc.
                    if after_zero.trim().parse::<f64>().unwrap_or(1.0) == 0.0 {
                        return true;
                    }
                } else {
                    // It's something like "0+" or "0 "
                    return true;
                }
            }
            
            // Also check for expressions that evaluate to zero
            // Simple check: if part has only operators and zeros
            let is_all_zeros = part.chars().all(|c| 
                c == '0' || c == ' ' || c == '+' || c == '-' || c == '*'
            );
            
            // If it's all zeros and operators, and contains at least one digit
            if is_all_zeros && part.chars().any(|c| c.is_digit(10)) {
                let eval_result = meval::eval_str(part);
                if let Ok(result) = eval_result {
                    if result == 0.0 {
                        return true;
                    }
                }
            }
        }
        
        false
    }
    
    /// Check if the expression is an integer operation
    pub fn is_integer_operation(&self) -> bool {
        // Check if the expression contains only digits, +, -, spaces and potentially a single *
        let normalized = self.normalize();
        let contains_only_allowed_chars = normalized.chars().all(|c| {
            c.is_digit(10) || c == '+' || c == '-' || c == ' ' || c == '*'
        });
        
        // Check if there's no decimal point or exponential notation
        !normalized.contains('.') && !normalized.contains('e') && !normalized.contains('E')
            && contains_only_allowed_chars
    }
}

/// Result type that can be either a floating point or a big integer
pub enum CalculationResult {
    Float(f64),
    BigInt(String),
}

impl Display for CalculationResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CalculationResult::Float(val) => {
                // Format floating point numbers to avoid precision errors
                // Like 0.1 + 0.2 = 0.30000000000000004
                
                // First check if it's a whole number (or very close to it)
                if val.fract().abs() < 1e-10 || (1.0 - val.fract()).abs() < 1e-10 {
                    write!(f, "{:.0}", val.round())
                } else {
                    // Format with 12 decimal places, then trim trailing zeros
                    let formatted = format!("{:.12}", val);
                    // Remove trailing zeros, but keep at least one digit after decimal
                    let trimmed = formatted.trim_end_matches('0');
                    if trimmed.ends_with('.') {
                        write!(f, "{}0", trimmed)
                    } else {
                        write!(f, "{}", trimmed)
                    }
                }
            },
            CalculationResult::BigInt(val) => write!(f, "{}", val),
        }
    }
}

/// Trait that defines an expression calculator
pub trait Calculator {
    /// Calculate the result of an expression
    fn calculate(&self, expression: &Expression) -> Result<CalculationResult, String>;
}
