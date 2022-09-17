/** Try turning an error message into something human-readable. */
export const getErrorMessage = (error: any): string =>
  error.response?.data || error.message || error.toString();
