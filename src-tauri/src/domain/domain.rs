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
        let mut result = self.0.replace('×', "*").replace('÷', "/");
        
        // Convert percentage: "X%" becomes "(X/100)"
        // Handle cases like "100 * 50%" -> "100 * (50/100)"
        while let Some(pos) = result.find('%') {
            // Find the start of the number before %
            let before = &result[..pos];
            let mut num_start = pos;
            let mut num_end = pos;
            
            // Walk backwards, skipping spaces first, then finding the number
            let mut found_digit = false;
            for (i, c) in before.chars().rev().enumerate() {
                if c.is_digit(10) || c == '.' {
                    if !found_digit {
                        num_end = pos - i;
                        found_digit = true;
                    }
                    num_start = pos - i - 1;
                } else if found_digit {
                    // We found a non-digit after finding digits, stop here
                    break;
                }
                // Skip spaces before the number
            }
            
            // Extract the number (trim any spaces)
            let number = result[num_start..num_end].trim();
            
            if number.is_empty() {
                // No number found, just remove the %
                result = format!("{}{}", &result[..pos], &result[pos+1..]);
            } else {
                // Replace "X%" or "X %" with "(X/100)"
                let replacement = format!("({}/100)", number);
                result = format!("{}{}{}", &result[..num_start], replacement, &result[pos+1..]);
            }
        }
        
        result
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
    
    /// Check if the expression is an integer operation that can be safely computed with BigInt
    /// Only returns true for simple operations without mixed precedence
    pub fn is_integer_operation(&self) -> bool {
        let normalized = self.normalize();
        
        // Check if there's no decimal point or exponential notation
        if normalized.contains('.') || normalized.contains('e') || normalized.contains('E') {
            return false;
        }
        
        // Check if the expression contains only digits and allowed operators
        let contains_only_allowed_chars = normalized.chars().all(|c| {
            c.is_digit(10) || c == '+' || c == '-' || c == ' ' || c == '*'
        });
        
        if !contains_only_allowed_chars {
            return false;
        }
        
        // Don't use BigInt if there's mixed precedence (+ or - with *)
        // This ensures we use meval which respects operator precedence
        let has_add_sub = normalized.contains('+') || normalized.chars().enumerate().any(|(i, c)| {
            // Check for minus that's not at the start (to allow negative numbers)
            c == '-' && i > 0 && normalized.chars().nth(i-1).map(|prev| prev.is_digit(10) || prev == ' ').unwrap_or(false)
        });
        let has_mul = normalized.contains('*');
        
        // Only use BigInt for pure addition/subtraction OR pure multiplication, not mixed
        !(has_add_sub && has_mul)
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
