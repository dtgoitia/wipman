import { ISODatetimeString } from "./types";

export function now(): Date {
  return new Date();
}

export function nowIsoString(): ISODatetimeString {
  return now().toISOString();
}
