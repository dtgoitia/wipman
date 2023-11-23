export function setsAreEqual<T>(
  a: Set<T> | undefined,
  b: Set<T> | undefined
): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;

  if (a.size !== b.size) return false;

  for (const element_a of a) {
    if (b.has(element_a) === false) {
      return false;
    }
  }

  return true;
}

/**
 * Compute the set intersection between `a` and `b`, or in layman words, find
 * elements that `a` and `b` have in common and return them in a new set.
 * @param a one set
 * @param b another set
 * @returns the intersection between `a` and `b`
 */
export function intersect<T>(
  a: Set<T> | undefined,
  b: Set<T> | undefined
): Set<T> {
  const common = new Set<T>();
  if (a === undefined || b === undefined) return common;

  for (const element_a of a) {
    if (b.has(element_a)) {
      common.add(element_a);
    }
  }

  return common;
}

/**
 * Determine if `a` and `b` intersect.
 * @param a one set
 * @param b another set
 * @returns `true` if sets `a` and `b` have elements in common
 */
export function is_intersection<T>(
  a: Set<T> | undefined,
  b: Set<T> | undefined
): boolean {
  if (a === undefined || b === undefined) return false;

  const [smallest, _largest] = a.size < b.size ? [a, b] : [b, a];

  for (const element of _largest) {
    if (smallest.has(element)) {
      // exit early: as soon as the first element in common is found
      return true;
    }
  }

  return false;
}

/**
 * Compute the set difference between `a` and `b`, or in layman words, substract
 * `b` to `a` and return the result.
 * @param a reference set
 * @param b set to substract from reference set
 * @returns reference set after substraction
 */
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const in_a_not_b = new Set<T>();

  for (const element_a of a) {
    if (b.has(element_a) === false) {
      in_a_not_b.add(element_a);
    }
  }

  return in_a_not_b;
}

/**
 * Compute the set union between `a` and `b`, or in layman words, add `a` and
 * `b` together
 * @param a set A
 * @param b set B
 * @returns reference resulting union
 */
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a, ...b]);
}

/**
 * Add item to a set without mutating the original set
 */
export function addToSet<T>(set: Set<T>, item: T): Set<T> {
  return new Set<T>([...set, item]);
}
