//! Domain - entities and business rules

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
}

/// Trait that defines an expression calculator
pub trait Calculator {
    /// Calculate the result of an expression
    fn calculate(&self, expression: &Expression) -> Result<f64, String>;
}
