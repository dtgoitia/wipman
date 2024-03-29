import { ISODatetimeString } from "./types";

export function now(): Date {
  return new Date();
}

export function nowIsoString(): ISODatetimeString {
  return now().toISOString();
}

export function parseDate(strDate: ISODatetimeString): Date {
  return new Date(strDate);
}

// https://devhints.io/wip/intl-datetime
const LANGUAGE_SIMILAR_TO_ISO8601 = "sv-SE";

export const isoDateTimeFormatter = new Intl.DateTimeFormat(
  LANGUAGE_SIMILAR_TO_ISO8601,
  {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }
).format;

function getLocalTimezoneFormatted(): string {
  const offset = new Date().getTimezoneOffset(); // in minutes

  const sign = offset <= 0 ? "+" : "-";

  const m = offset % 60;
  const h = (offset - m) / 60;

  const fmt = (n: number) => String(Math.abs(n)).padStart(2, "0");

  return `${sign}${fmt(h)}:${fmt(m)}`;
}

/**
 * Produces a date like `2023-05-22 16:08:27 +01:00`.
 */
export function dateToLocale(date: Date): string {
  const naive: string = isoDateTimeFormatter(date);
  const tz = getLocalTimezoneFormatted();
  return `${naive} ${tz}`;
}

export class Timedelta {
  /**
   * Total amount of seconds in the delta.
   */
  // public totalSeconds: number;

  public milliseconds: number;
  /**
   * Amount of seconds, substracting the rest of the time units, e.g.:
   * ```
   * const delta = new Timedelta(122 * 1000);
   * delta.seconds()  // 2
   * delta.totalSeconds()  // 122
   * ```
   */
  public seconds: number;
  public minutes: number;
  public hours: number;
  public days: number;

  private total: number;

  constructor({ ms: totalMs }: { ms: number }) {
    this.total = totalMs;

    const ms = this.total % 1000;
    const secondsLeft = Math.floor(this.total / 1000);

    const s = secondsLeft % 60;
    const minutesLeft = Math.floor(secondsLeft / 60);

    const m = minutesLeft % 60;
    const hoursLeft = Math.floor(minutesLeft / 60);

    const h = hoursLeft % 24;
    const days = Math.floor(hoursLeft / 24);

    this.milliseconds = ms;
    this.seconds = s;
    this.minutes = m;
    this.hours = h;
    this.days = days;
  }

  public toString(args?: { precision?: Precision }): string {
    let precision = Precision.seconds;
    if (args) {
      const maybePrecision = args.precision;
      precision = maybePrecision !== undefined ? maybePrecision : precision;
    }

    let chunks: string[] = [];

    if (precision <= Precision.days && this.days > 0) {
      chunks.push(`${this.days} ${this.days === 1 ? "day" : "days"}`);
    }

    if (precision <= Precision.hours && this.hours > 0) {
      chunks.push(`${this.hours}h`);
    }

    if (precision <= Precision.minutes && this.minutes > 0) {
      chunks.push(`${this.minutes}m`);
    }

    if (precision <= Precision.seconds && this.seconds > 0) {
      chunks.push(`${this.seconds}s`);
    }

    if (precision <= Precision.milliseconds && this.milliseconds > 0) {
      chunks.push(`${this.milliseconds}ms`);
    }

    if (chunks.length === 0) {
      switch (precision) {
        case Precision.days:
          return "0 days";
        case Precision.hours:
          return "0h";
        case Precision.minutes:
          return "0m";
        case Precision.seconds:
          return "0s";
        case Precision.milliseconds:
          return "0ms";
      }
    }

    return chunks.join(" ");
  }
}

export enum Precision {
  milliseconds = 0,
  seconds = 1,
  minutes = 2,
  hours = 3,
  days = 4,
}
