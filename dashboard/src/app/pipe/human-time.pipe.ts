import { Pipe, PipeTransform } from '@angular/core';

import { HOUR_MS, TimeUtil } from '../../util/time-util';

@Pipe({
  name: 'humanTime',
})
export class HumanTimePipe implements PipeTransform {
  transform(value: number | null, ...args: unknown[]): string {
    if (value === null || value === undefined) {
      return '0';
    }
    return TimeUtil.millisecondToHumanFormat(value);
  }
}

@Pipe({
  name: 'msToHrs',
})
export class MillisecondsToHours implements PipeTransform {
  transform(value: number | null, ...args: unknown[]): string {
    if (value === null || value === undefined) {
      return '0';
    }
    return (value / HOUR_MS).toString();
  }
}
