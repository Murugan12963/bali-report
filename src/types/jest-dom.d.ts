/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInTheDocument(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeVisible(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAccessibleDescription(expectedDescription?: string | RegExp): R;
      toHaveAccessibleName(expectedName?: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string | RegExp): R;
      toHaveClass(...classNames: string[]): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveErrorMessage(text: string | RegExp): R;
    }
  }
}
