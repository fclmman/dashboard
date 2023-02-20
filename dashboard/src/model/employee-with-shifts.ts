import { HOUR_MS } from '../util/time-util';
import { Employee } from './employee';
import { Shift } from './shift';

export class EmployeeWithShifts implements Employee {
  email?: string;
  hourlyRate: number;
  hourlyRateOvertime: number;
  id: string;
  name?: string;
  dailyShifts: Map<number, Shift[]> = new Map<number, Shift[]>();
  originalShifts: Shift[];
  dirty = false;

  constructor(
    options?: Employee & {
      dailyShifts?: Map<number, Shift[]>;
      originalShifts?: Shift[];
    }
  ) {
    this.email = options?.email;
    this.hourlyRate = options?.hourlyRate ?? 0;
    this.hourlyRateOvertime = options?.hourlyRateOvertime ?? 0;
    this.id = options?.id ?? '';
    this.name = options?.name;
    this.dailyShifts = options?.dailyShifts ?? new Map<number, Shift[]>();
    this.originalShifts = options?.originalShifts ?? [];
  }

  getTotalTime(): number {
    let result = 0;
    this.dailyShifts.forEach((shifts, day) => {
      shifts.forEach(shift => {
        result += shift.clockOut - shift.clockIn;
      });
    });
    return result;
  }

  getRegularTime(): number {
    let result = 0;
    this.dailyShifts.forEach((shifts, day) => {
      const daySum = shifts.reduce((prev, curr) => {
        return prev + curr.clockOut - curr.clockIn;
      }, 0);
      if (daySum > HOUR_MS * 8) {
        result += HOUR_MS * 8;
      } else {
        result += daySum;
      }
    });
    return result;
  }

  getOvertime(): number {
    let result = 0;
    this.dailyShifts.forEach((shifts, day) => {
      const daySum = shifts.reduce((prev, curr) => {
        return prev + curr.clockOut - curr.clockIn;
      }, 0);
      if (daySum > HOUR_MS * 8) {
        result += daySum - HOUR_MS * 8;
      }
    });
    return result;
  }

  getPaidRegular(): number {
    return (this.getRegularTime() / HOUR_MS) * this.hourlyRate;
  }

  getPaidOvertime(): number {
    return (this.getOvertime() / HOUR_MS) * this.hourlyRateOvertime;
  }
}
