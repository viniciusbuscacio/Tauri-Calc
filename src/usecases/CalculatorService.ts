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
    
    const endsWithOperatorAndSpace = /[+\-×÷]\s$/.test(currentExpression);
    const endsWithAnyOperator = /[+\-×÷%]$/.test(currentExpression.trim());
    
    if (endsWithOperatorAndSpace || endsWithAnyOperator) {
      const trimmed = currentExpression.trimEnd();
      const base = endsWithOperatorAndSpace ? trimmed.slice(0, -1).trimEnd() : trimmed.trimEnd();
      if(base.endsWith('%') && !endsWithOperatorAndSpace) return currentExpression;
      return base + ` ${operator} `;
    } else {
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
    
    if (currentExpression.trimEnd().endsWith(' ')) {
      return currentExpression + '0.';
    }
    
    const parts = currentExpression.split(' ');
    const currentNumber = parts[parts.length - 1];
    
    if (!currentNumber.includes('.')) {
      return currentExpression + '.';
    }
    
    return currentExpression;
  }
}