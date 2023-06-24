import { Precision, Timedelta } from "../domain/dates";
import { describe, expect, it } from "vitest";

const MILLISECOND = 1;
const SECOND = MILLISECOND * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function buildDelta({
  d,
  h,
  m,
  s,
  ms,
}: {
  d?: number;
  h?: number;
  m?: number;
  s?: number;
  ms?: number;
}): Timedelta {
  const delta = new Timedelta({
    ms:
      (d || 0) * DAY +
      (h || 0) * HOUR +
      (m || 0) * MINUTE +
      (s || 0) * SECOND +
      (ms || 0) * MILLISECOND,
  });
  return delta;
}

describe(`${Timedelta.name}`, () => {
  describe(`by default formats with a precision of seconds`, () => {
    it("day h m s", () => {
      const delta = buildDelta({ d: 1, h: 2, m: 3, s: 4, ms: 5 });
      expect(delta.toString()).toEqual("1 day 2h 3m 4s");
    });

    it("days h m s", () => {
      const delta = buildDelta({ d: 2, h: 2, m: 3, s: 4, ms: 5 });
      expect(delta.toString()).toEqual("2 days 2h 3m 4s");
    });

    it("h m s", () => {
      const delta = buildDelta({ h: 2, m: 3, s: 4, ms: 5 });
      expect(delta.toString()).toEqual("2h 3m 4s");
    });

    it("h s", () => {
      const delta = buildDelta({ h: 2, s: 4, ms: 5 });
      expect(delta.toString()).toEqual("2h 4s");
    });

    it("m s", () => {
      const delta = buildDelta({ m: 3, s: 4, ms: 5 });
      expect(delta.toString()).toEqual("3m 4s");
    });

    it("s", () => {
      const delta = buildDelta({ s: 4, ms: 5 });
      expect(delta.toString()).toEqual("4s");
    });
  });

  describe(`formats with millisecond precision`, () => {
    it("day h m s ms", () => {
      const delta = buildDelta({ d: 1, h: 2, m: 3, s: 4, ms: 5 });
      expect(delta.toString({ precision: Precision.milliseconds })).toEqual(
        "1 day 2h 3m 4s 5ms"
      );
    });

    it("day ms", () => {
      const delta = buildDelta({ d: 1, ms: 5 });
      expect(delta.toString({ precision: Precision.milliseconds })).toEqual(
        "1 day 5ms"
      );
    });

    it("nothing", () => {
      const delta = buildDelta({});
      expect(delta.toString({ precision: Precision.milliseconds })).toEqual(
        "0ms"
      );
    });
  });
});
