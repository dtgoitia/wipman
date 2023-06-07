// In React, controled inputs always are a string. If the value is
// undefined then it's an uncontroled input.
type ControledInputValue = string;

const NO_TEXT: string = "";

export function isNoText(value: string | undefined | null): boolean {
  return value === "" || value === undefined || value === null;
}

/**
 * Convert a domain value to an input value.
 *
 * In this case, _input value_ refers to the value of a controled input. In React, the
 * value of a controled input must always be a string. If the value is `undefined`, then
 * it's an uncontroled input.
 *
 * A _domain value_ can take any value, including `undefined` and `null`.
 */
export function toInputValue(
  domainValue: string | undefined
): ControledInputValue {
  return isNoText(domainValue) ? NO_TEXT : (domainValue as string);
}

/**
 * Convert an input value to a domain value.
 *
 * In this case, _input value_ refers to the value of a controled input. In React, the
 * value of a controled input must always be a string. If the value is `undefined`, then
 * it's an uncontroled input.
 *
 * A _domain value_ can take any value, including `undefined` and `null`.
 */
export function toDomainValue(
  inputValue: ControledInputValue
): string | undefined {
  return inputValue === NO_TEXT ? undefined : inputValue;
}
