import { Timedelta } from "../domain/dates";
import { describe, expect, it } from "vitest";

const MILLISECOND = 1;
const SECOND = MILLISECOND * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

describe(`${Timedelta.name}`, () => {
  it("formats correctly d h m s", () => {
    const delta = new Timedelta({
      ms: 1 * DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND + 5 * MILLISECOND,
    });
    expect(delta.toString()).toEqual("1 day 2h 3m 4s");
  });

  // no days
  // days in plural
  // no hours but days
  // no hours
  // no minutes
  // no minutes but hours
  // no seconds
  // no seconds but minutes
});
