import { BigNumber } from "@ethersproject/bignumber";

/**
 * Yup transformer to parse a possible BigNumber into an integer
 * @warning could cause an overflow if the number is too large
 */
export const transformBigNumberToInteger = (value: any, originalValue: any) => {
  if (originalValue === undefined || originalValue === "") return undefined;
  if (Number.isInteger(value)) return value;
  try {
    return BigNumber.from(originalValue).toNumber();
  } catch (e) {
    return originalValue;
  }
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

/**
 * Yup transformer to parse a possible BigNumber into hex string
 */
export const transformBigNumberToHexString = (
  _value: any,
  originalValue: any
) => {
  return BigNumber.from(originalValue).toHexString();
};
