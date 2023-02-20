export const DAY_MS = 1000 * 60 * 60 * 24;
export const HOUR_MS = 1000 * 60 * 60;

export class TimeUtil {
  public static millisecondToHumanFormat(milliSeconds: number): string {
    const weeks = Math.trunc(milliSeconds / (DAY_MS * 7));
    milliSeconds = milliSeconds - DAY_MS * 7 * weeks;
    const days = Math.trunc(milliSeconds / DAY_MS);
    milliSeconds = milliSeconds - DAY_MS * days;
    const hours = Math.trunc(milliSeconds / HOUR_MS);
    milliSeconds = milliSeconds - HOUR_MS * hours;
    const minutes = Math.trunc(milliSeconds / 60000);
    milliSeconds = milliSeconds - 60000 * minutes;
    const seconds = Math.trunc(milliSeconds / 1000);
    let result = '';
    if (seconds) {
      result = `${seconds}s `;
    }
    if (minutes) {
      result = `${minutes}m ${result}`;
    }
    if (hours) {
      result = `${hours}h ${result}`;
    }
    if (days) {
      result = `${days}d ${result}`;
    }
    if (weeks) {
      result = `${weeks}w ${result}`;
    }
    return result.trim();
  }

  static getDayStart(timestamp: number) {
    const fullDays = Math.trunc(timestamp / DAY_MS);
    return fullDays * DAY_MS;
  }
}
