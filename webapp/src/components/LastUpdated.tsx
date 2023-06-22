import { Timedelta, dateToLocale, now, parseDate } from "../domain/dates";
import { ISODatetimeString } from "../domain/types";

interface Props {
  date: ISODatetimeString;
}
export function LastUpdated({ date: strDate }: Props) {
  const date = parseDate(strDate);
  const fmtDate = dateToLocale(date);
  const delta = new Timedelta({ ms: now().getTime() - date.getTime() });

  console.log(">>>", delta);
  console.log(">>>", delta.toString());

  return (
    <div>
      <div>Last updated: {fmtDate}</div>
      <div>ago: {delta.toString()}</div>
    </div>
  );
}
