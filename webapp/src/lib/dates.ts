function getDateFromDatetime(d: Date): Date {
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function datesAreEqual({ a, b }: { a: Date; b: Date }): boolean {
  return datetimesAreEqual({
    a: getDateFromDatetime(a),
    b: getDateFromDatetime(b),
  });
}

export function datetimesAreEqual({ a, b }: { a: Date; b: Date }): boolean {
  return a.getTime() === b.getTime();
}
