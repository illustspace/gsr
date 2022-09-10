import { BigNumber } from "@ethersproject/bignumber";

/**
 * Yup transformer to parse a possible BigNumber into an integer
 * @warning could cause an overflow if the number is too large
 */
export const transformBigNumberToInteger = (value: any, originalValue: any) => {
  if (Number.isInteger(value)) return value;
  return BigNumber.from(originalValue).toNumber();
};

/**
 * Yup transformer to parse a possible BigNumber into decimal string
 */
export const transformBigNumberToDecimalString = (
  _value: any,
  originalValue: any
) => {
  return BigNumber.from(originalValue).toString();
};
