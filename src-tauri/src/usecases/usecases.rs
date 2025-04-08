//! Use cases - application rules

use crate::domain::{Calculator, Expression, CalculationResult};

/// Use case for calculating mathematical expressions
pub struct CalculateExpressionUseCase<T: Calculator> {
    calculator: T,
}

impl<T: Calculator> CalculateExpressionUseCase<T> {
    /// Creates a new use case with the provided calculator
    pub fn new(calculator: T) -> Self {
        Self { calculator }
    }
    
    /// Executes the calculation of the expression and returns the result as a string
    pub fn execute(&self, expression_str: String) -> Result<String, String> {
        let expression = Expression::new(expression_str);
        match self.calculator.calculate(&expression) {
            Ok(CalculationResult::Float(result)) if result.is_finite() => Ok(result.to_string()),
            Ok(CalculationResult::BigInt(result)) => Ok(result),
            _ => Err("Error".to_string()),
        }
    }
}
