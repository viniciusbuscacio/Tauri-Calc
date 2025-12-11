/**
 * Application-specific business rules for the calculator
 */

import { invoke } from '@tauri-apps/api/core';
import { CalculationResult, Expression } from '../domain/CalculatorModel';

export class CalculatorService {
  private static RUST_CMD = {
    CALCULATE: 'calculate_result'
  };

  static async calculateExpression(expression: Expression): Promise<CalculationResult> {
    if (expression.isError() || expression.isEmpty() || expression.endsWithOperator()) {
      return { value: expression.value, error: true };
    }

    try {
      const result = await invoke<string>(this.RUST_CMD.CALCULATE, { expression: expression.value });
      return { value: result, error: false };
    } catch (error) {
      console.error(`Error invoking ${this.RUST_CMD.CALCULATE}:`, error);

      // Check if the error is about division by zero
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("divide by zero") ||
        errorMessage.includes("division by zero") ||
        errorMessage === "Cannot divide by zero") {
        return { value: "Cannot divide by zero", error: true };
      }

      return { value: "Error", error: true };
    }
  }

  static appendNumber(currentExpression: string, number: string, isResultDisplayed: boolean): string {
    if (isResultDisplayed) {
      return number;
    } else {
      if (currentExpression === "0" || currentExpression === "Error") {
        return number;
      }
      if (currentExpression.endsWith('%')) {
        return currentExpression + ` × ${number}`;
      }
      return currentExpression + number;
    }
  }

  static appendOperator(currentExpression: string, operator: string): string {
    if (currentExpression === "Error") return currentExpression;

    // Handle operators after expression that ends with a space (likely already has an operator)
    const endsWithOperatorAndSpace = /[+\-×÷]\s$/.test(currentExpression);

    // Check if the expression ends with any operator without a space
    const endsWithAnyOperator = /[+\-×÷%]$/.test(currentExpression.trim());

    if (endsWithOperatorAndSpace || endsWithAnyOperator) {
      // Trim any trailing spaces first
      const trimmed = currentExpression.trimEnd();

      // If ends with operator + space, remove the operator too
      // Otherwise, just use the trimmed version
      const base = endsWithOperatorAndSpace ? trimmed.slice(0, -1).trimEnd() : trimmed;

      // Special case: don't replace operator if expression ends with %
      if (base.endsWith('%') && !endsWithOperatorAndSpace) {
        return currentExpression + ` ${operator} `;
      }

      // Return with properly formatted operator
      return base + ` ${operator} `;
    } else {
      // Normal case - just append the operator with spaces
      return currentExpression + ` ${operator} `;
    }
  }

  static handleBackspace(currentExpression: string): string {
    if (currentExpression === "Error") {
      return "0";
    }

    if (currentExpression.endsWith(' ')) {
      return currentExpression.slice(0, -3); // Remove operator + spaces
    } else if (currentExpression.length > 1) {
      return currentExpression.slice(0, -1); // Remove last character
    } else {
      return "0"; // Return to zero if only one character remains
    }
  }

  static appendPercent(currentExpression: string): string {
    if (currentExpression === "Error" ||
      /[+\-×÷]\s$/.test(currentExpression) ||
      currentExpression.endsWith('%')) {
      return currentExpression;
    }
    return currentExpression + '%';
  }

  static appendDecimal(currentExpression: string, isResultDisplayed: boolean): string {
    if (isResultDisplayed || currentExpression === "Error") {
      return "0.";
    }

    const trimmed = currentExpression.trimEnd();

    // Split by operators to get the last number segment
    // We treat operators as separators. 
    // Example: "1 + 2" -> ["1 ", " 2"]
    const parts = currentExpression.split(/[+\-×÷]/);
    const lastPart = parts[parts.length - 1];

    // Check if the validation needs to happen on the trimmed expression or raw
    // If expression ends with an operator (detected by checking if trimmed ends with one)
    if (/[+\-×÷]$/.test(trimmed)) {
      return currentExpression + (currentExpression.endsWith(" ") ? "0." : " 0.");
    }

    // If the last number segment already has a decimal, do nothing
    if (lastPart.includes('.')) {
      return currentExpression;
    }

    return currentExpression + '.';
  }
}