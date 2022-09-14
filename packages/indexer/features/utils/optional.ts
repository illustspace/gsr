export type Optional<T> = T | undefined | null;

/** A type predicate for filtering out null/undefined */
export const isDefined = <T>(x: Optional<T>): x is T => {
  return x !== null && x !== undefined;
};

/** A type predicate for filtering out null/undefined/emptyString */
export const hasValue = <T>(x: Optional<T> | ""): x is T => {
  return x !== null && x !== undefined && x !== "";
};
