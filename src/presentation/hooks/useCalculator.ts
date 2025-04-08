import { useState, useRef, useEffect } from 'react';
import { Expression } from '../../domain/CalculatorModel';
import { CalculatorService } from '../../usecases/CalculatorService';

export const useCalculator = () => {
  const [displayValue, setDisplayValue] = useState("0");
  const [isResultDisplayed, setIsResultDisplayed] = useState(false);
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  const performCalculation = async () => {
    const expression = new Expression(displayValueRef.current);
    const result = await CalculatorService.calculateExpression(expression);
    
    setDisplayValue(result.value);
    setIsResultDisplayed(!result.error);
  };

  const handleNumberClick = (number: string) => {
    const newValue = CalculatorService.appendNumber(displayValue, number, isResultDisplayed);
    setDisplayValue(newValue);
    if (isResultDisplayed) setIsResultDisplayed(false);
  };

  const handleOperatorClick = (operator: string) => {
    const newValue = CalculatorService.appendOperator(displayValue, operator);
    setDisplayValue(newValue);
    setIsResultDisplayed(false);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'clear':
        setDisplayValue("0");
        setIsResultDisplayed(false);
        break;

      case 'backspace':
        const newBackspaceValue = CalculatorService.handleBackspace(displayValueRef.current);
        setDisplayValue(newBackspaceValue);
        setIsResultDisplayed(false);
        break;

      case 'percent':
        const newPercentValue = CalculatorService.appendPercent(displayValueRef.current);
        setDisplayValue(newPercentValue);
        setIsResultDisplayed(false);
        break;

      case 'decimal':
        const newDecimalValue = CalculatorService.appendDecimal(displayValue, isResultDisplayed);
        setDisplayValue(newDecimalValue);
        if (isResultDisplayed) setIsResultDisplayed(false);
        break;

      case 'calculate':
        performCalculation();
        break;
    }
  };

  // Utility to flash buttons when pressed
  const flashButton = (selector: string) => {
    const button = document.querySelector(selector) as HTMLButtonElement | null;
    if (button) {
      button.classList.add('btn-key-active');
      setTimeout(() => { button.classList.remove('btn-key-active'); }, 150);
    }
  };

  return {
    displayValue,
    isResultDisplayed,
    displayValueRef,
    setDisplayValue,
    setIsResultDisplayed,
    handleNumberClick,
    handleOperatorClick,
    handleActionClick,
    performCalculation,
    flashButton
  };
};
