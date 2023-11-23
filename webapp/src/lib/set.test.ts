import {
  addToSet,
  assessSetOverlap,
  deleteFromSet,
  difference,
  intersect,
  is_intersection,
  union,
} from "./set";
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

describe("addToSet", () => {
  const original = new Set([1, 2, 3]);
  it("when item does not exists in set", () => {
    const result = addToSet(original, 4);
    expect(result).toEqual(new Set([1, 2, 3, 4]));
    expect(result).not.toBe(original);
  });

  it("when item already exists in set", () => {
    const result = addToSet(original, 1);
    expect(result).toEqual(original);
    expect(result).not.toBe(original);
  });
});

describe("deleteFromSet", () => {
  const original = new Set([1, 2, 3]);

  it("when item does not exists in set", () => {
    const result = deleteFromSet(original, 4);
    expect(result).toEqual(original);
    expect(result).not.toBe(original);
  });

  it("when item exists in set", () => {
    const result = deleteFromSet(original, 1);
    expect(result).toEqual(new Set([2, 3]));
    expect(result).not.toBe(original);
  });
});

describe("assessSetOverlap", () => {
  it("when A and B are equal", () => {
    const a = new Set([1, 2]);
    const b = new Set([1, 2]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inAButNotInB).toEqual(new Set());
    expect(inBButNotInA).toEqual(new Set());

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([1, 2]));
  });

  it("when A is a subset of B", () => {
    const a = new Set([1, 2]);
    const b = new Set([1, 2, 3]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inAButNotInB).toEqual(new Set());
    expect(inBButNotInA).toEqual(new Set([3]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([1, 2, 3]));
  });

  it("when B is a subset of A", () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([1, 2]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inAButNotInB).toEqual(new Set([3]));
    expect(inBButNotInA).toEqual(new Set());

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2, 3]));
    expect(b).toEqual(new Set([1, 2]));
  });

  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
  it("when A and B do not overlap", () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);

    const { inAButNotInB, inBButNotInA } = assessSetOverlap({ a, b });
    expect(inBButNotInA).toEqual(new Set([3, 4]));
    expect(inAButNotInB).toEqual(new Set([1, 2]));

    // a and b should remain unchanged
    expect(a).toEqual(new Set([1, 2]));
    expect(b).toEqual(new Set([3, 4]));
  });
});
