import {
  Precision,
  Timedelta,
  dateToLocale,
  now,
  parseDate,
} from "../domain/dates";
import { ISODatetimeString } from "../domain/types";
import { assertNever } from "../exhaustive-match";
import { useEffect, useState } from "react";

const REFRESH_RATE_IN_MS = 500;

enum Mode {
  date = "date",
  longTimedelta = "long-timedelta",
}

interface Props {
  date: ISODatetimeString;
}

export function LastUpdated({ date: strDate }: Props) {
  const date = parseDate(strDate);

  const [mode, setMode] = useState<Mode>(Mode.longTimedelta);
  const [lastUpdated, setLastUpdated] = useState<string>(
    formatLastUpdated(mode, date)
  );

  function refresh(): void {
    setLastUpdated(formatLastUpdated(mode, date));
  }

  useEffect(() => {
    const interval = setInterval(() => refresh(), REFRESH_RATE_IN_MS);

    return () => {
      clearInterval(interval);
    };
  });

  function handleClick(): void {
    switch (mode) {
      case Mode.date:
        setMode(Mode.longTimedelta);
        return refresh();
      case Mode.longTimedelta:
        setMode(Mode.date);
        return refresh();
      default:
        assertNever(mode, `Unsupported Show variant: ${mode}`);
    }
  }

  return (
    <div onClick={() => handleClick()}>
      <div>Last updated: {lastUpdated}</div>
    </div>
  );
}

function formatLastUpdated(show: Mode, date: Date): string {
  switch (show) {
    case Mode.date: {
      return dateToLocale(date);
    }

    case Mode.longTimedelta: {
      const delta = new Timedelta({ ms: now().getTime() - date.getTime() });
      return delta.toString({ precision: Precision.seconds });
    }

    default:
      assertNever(show, `Unsupported Show variant: ${show}`);
  }
}
