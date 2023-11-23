import { datesAreEqual, datetimesAreEqual } from "./dates";
import { describe, expect, it } from "vitest";

describe("dates", () => {
  describe("datesAreEqual", () => {
    it("return true when dates are equal even if times are not", () => {
      expect(
        datesAreEqual({
          a: new Date("2023-11-23T00:00:00+00:00"),
          b: new Date("2023-11-23T00:00:12+00:00"),
          //           ^^^^^^^^^^       ^^
        })
      ).toBe(true);
    });
    it("return false when dates are not equal", () => {
      expect(
        datesAreEqual({
          a: new Date("2023-11-01T00:00:00+00:00"),
          b: new Date("2023-11-02T00:00:00+00:00"),
          //           ^^^^^^^^^^
        })
      ).toBe(false);
    });
  });

  describe("datetimesAreEqual", () => {
    it("return true when dates and times are equal", () => {
      expect(
        datetimesAreEqual({
          a: new Date("2023-11-23T00:00:00+00:00"),
          b: new Date("2023-11-23T00:00:00+00:00"),
        })
      ).toBe(true);
    });
    it("return false when dates are not equal", () => {
      expect(
        datetimesAreEqual({
          a: new Date("2023-11-01T00:00:00+00:00"),
          b: new Date("2023-11-02T00:00:00+00:00"),
          //                   ^^
        })
      ).toBe(false);
    });
    it("return false when times are not equal", () => {
      expect(
        datetimesAreEqual({
          a: new Date("2023-11-01T00:00:00+00:00"),
          b: new Date("2023-11-01T00:01:00+00:00"),
          //                         ^^
        })
      ).toBe(false);
    });
  });
});
