export function toEpoch(date: Date | string): number {
  if (typeof date === 'string') {
    return new Date(date).getTime();
  }

  return date.getTime();
}

export function formatYearMonth(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 7);
}

export function monthBuckets(startIso: string, endIso: string): string[] {
  const start = new Date(startIso);
  const end = new Date(endIso);

  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(1);
  end.setUTCHours(0, 0, 0, 0);

  const buckets: string[] = [];

  while (start <= end) {
    const year = start.getUTCFullYear();
    const month = String(start.getUTCMonth() + 1).padStart(2, '0');
    buckets.push(`${year}-${month}`);

    start.setUTCMonth(start.getUTCMonth() + 1);
  }

  return buckets;
}
