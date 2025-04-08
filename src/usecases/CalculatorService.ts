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
      if(base.endsWith('%') && !endsWithOperatorAndSpace) {
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
    // Handle special cases
    if (isResultDisplayed || currentExpression === "Error") {
      return "0.";
    }
    
    // Check for the case where the expression ends with an operator
    const trimmedExpr = currentExpression.trimEnd();
    
    // Case 1: If expression ends with a space (which usually comes after an operator)
    if (trimmedExpr.endsWith(' ')) {
      // Get the last non-space character
      const lastChar = trimmedExpr.slice(0, -1).trim().slice(-1);
      
      // If the last character is an operator, add 0.
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        return currentExpression + '0.';
      }
    }
    
    // Case 2: If expression ends directly with an operator (no space)
    if (trimmedExpr.endsWith('+') || 
        trimmedExpr.endsWith('-') || 
        trimmedExpr.endsWith('×') || 
        trimmedExpr.endsWith('÷')) {
      return currentExpression + ' 0.';
    }
    
    // Case 3: Check for operators followed by a space in last part
    const parts = currentExpression.split(' ');
    const lastPart = parts[parts.length - 1];
    
    // If last part is empty (means we have an operator followed by space at the end)
    if (lastPart === '' && parts.length > 1) {
      const operatorPart = parts[parts.length - 2];
      if (['+', '-', '×', '÷'].includes(operatorPart)) {
        return currentExpression + '0.';
      }
    }
    
    // Normal case: just add a decimal point if it doesn't already exist
    if (!lastPart.includes('.')) {
      return currentExpression + '.';
    }
    
    // If we already have a decimal in the current number, do nothing
    return currentExpression;
  }
}