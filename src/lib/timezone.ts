export interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

export function getLocalDateParts(date: Date, timeZone: string): LocalDateParts & {
  hour: number;
  minute: number;
} {
  const parts = new Map(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return {
    year: Number(parts.get('year')),
    month: Number(parts.get('month')),
    day: Number(parts.get('day')),
    hour: Number(parts.get('hour')),
    minute: Number(parts.get('minute')),
  };
}

export function zonedDateTimeToUtc(
  { year, month, day }: LocalDateParts,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const targetLocalAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = targetLocalAsUtc;

  for (let attempt = 0; attempt < 3; attempt++) {
    const observed = getLocalDateParts(new Date(timestamp), timeZone);
    const observedLocalAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
    );
    const correction = targetLocalAsUtc - observedLocalAsUtc;

    timestamp += correction;
    if (correction === 0) break;
  }

  return new Date(timestamp);
}

export function getLocalDayBounds(date: Date, timeZone: string): {
  start: Date;
  end: Date;
} {
  const localDate = getLocalDateParts(date, timeZone);
  const nextDate = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day + 1));
  const nextLocalDate = {
    year: nextDate.getUTCFullYear(),
    month: nextDate.getUTCMonth() + 1,
    day: nextDate.getUTCDate(),
  };

  return {
    start: zonedDateTimeToUtc(localDate, 0, 0, timeZone),
    end: zonedDateTimeToUtc(nextLocalDate, 0, 0, timeZone),
  };
}
