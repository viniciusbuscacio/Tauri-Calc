//! Domain - entities and business rules
use std::fmt::Display;

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
            CalculationResult::Float(val) => write!(f, "{}", val),
            CalculationResult::BigInt(val) => write!(f, "{}", val),
        }
    }
}

/// Trait that defines an expression calculator
pub trait Calculator {
    /// Calculate the result of an expression
    fn calculate(&self, expression: &Expression) -> Result<CalculationResult, String>;
}
