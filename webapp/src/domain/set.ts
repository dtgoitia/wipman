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
