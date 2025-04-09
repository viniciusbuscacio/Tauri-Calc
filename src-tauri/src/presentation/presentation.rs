//! Presentation - user interface

/// Commands exposed to the frontend
pub mod commands {
    use crate::usecases::CalculateExpressionUseCase;
    use crate::infrastructure::MevalCalculator;
    
    /// Command to calculate the result of a mathematical expression
    #[tauri::command]
    pub fn calculate_result(expression: String) -> Result<String, String> {
        let calculator = MevalCalculator;
        let use_case = CalculateExpressionUseCase::new(calculator);
        use_case.execute(expression)
    }
}
