/**
 * Core business entities and rules of the calculator
 */

export interface CalculationResult {
  value: string;
  error: boolean;
}

export class Expression {
  constructor(public readonly value: string) {}

  static isOperator(char: string): boolean {
    return ["+", "-", "×", "÷"].includes(char);
  }

  endsWithOperator(): boolean {
    return /[+\-×÷]\s$/.test(this.value) || /[+\-×÷]$/.test(this.value.trim());
  }

  endsWithPercent(): boolean {
    return this.value.endsWith("%");
  }

  isEmpty(): boolean {
    return this.value.trim() === "";
  }

  isError(): boolean {
    return this.value === "Error";
  }
}