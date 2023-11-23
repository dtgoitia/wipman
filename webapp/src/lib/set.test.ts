import { difference, intersect, is_intersection, union } from "./set";
import { describe, expect, it } from "vitest";

describe("intersect", () => {
  it("when sets are identical", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2, 3]);
    expect(intersect(a, b)).toEqual(new Set([1, 2, 3]));
  });

  it("when sets are different but overlap", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    expect(intersect(a, b)).toEqual(new Set([2, 3]));
  });

  it("when sets are different and do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);
    expect(intersect(a, b)).toEqual(new Set());
  });
});

describe("is_intersection", () => {
  it("when sets are identical", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2, 3]);
    expect(is_intersection(a, b)).toBe(true);
  });

  it("when sets are different but overlap", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    expect(is_intersection(a, b)).toBe(true);
  });

  it("when sets are different and do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);
    expect(is_intersection(a, b)).toBe(false);
  });
});

describe("difference", () => {
  it("when sets are identical", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2, 3]);
    expect(difference(a, b)).toEqual(new Set());
  });

  it("when sets are different but overlap", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([2, 3, 4]);
    expect(difference(a, b)).toEqual(new Set([1]));
  });

  it("when sets are different and do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);
    expect(difference(a, b)).toEqual(a);
  });
});

describe("union", () => {
  it("when sets are identical", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2, 3]);
    expect(union(a, b)).toEqual(a);
    expect(union(a, b)).toEqual(b);
  });

  it("when one set is a superset of the other set", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2]);
    expect(union(a, b)).toEqual(a);
  });

  it("when sets have at least one item not-in-common", () => {
    const a = new Set([1, 2]);
    const b = new Set([2, 3]);
    expect(union(a, b)).toEqual(new Set([1, 2, 3]));
  });
});
