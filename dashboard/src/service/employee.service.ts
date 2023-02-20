import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  combineLatest,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  take,
  tap,
  zip,
} from 'rxjs';

import { Employee } from '../model/employee';
import { EmployeeWithShifts } from '../model/employee-with-shifts';
import { Shift } from '../model/shift';
import { DAY_MS, TimeUtil } from '../util/time-util';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  employeesWithShifts: Observable<Map<string, EmployeeWithShifts>>;
  employees: Observable<Map<string, EmployeeWithShifts>>;
  shifts: Observable<Shift[]>;

  private _employeesUpdate = new Subject<Map<string, EmployeeWithShifts>>();
  private _shiftsUpdate = new Subject<Shift[]>();

  constructor(private http: HttpClient) {
    const employees = this.getEmployees().pipe(
      map(employeesList => {
        const map = new Map<string, EmployeeWithShifts>();
        employeesList.forEach(employee => {
          map.set(employee.id, new EmployeeWithShifts(employee));
        });
        return map;
      }),
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );
    const shifts = this.getShifts().pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );
    this.employees = merge(employees, this._employeesUpdate).pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );
    this.shifts = merge(shifts, this._shiftsUpdate).pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );

    this.employeesWithShifts = combineLatest([
      this.employees,
      this.shifts,
    ]).pipe(
      map(([employeesMap, shifts]) => {
        employeesMap.forEach(value => {
          value.dailyShifts = new Map();
          value.originalShifts = [];
        });
        shifts.forEach(shift => {
          const employee = employeesMap.get(shift.employeeId);
          if (employee) {
            if (!employee.originalShifts) {
              employee.originalShifts = [];
            }
            employee.originalShifts.push(shift);
            const shiftStart = TimeUtil.getDayStart(shift.clockIn);
            const shiftEnd = TimeUtil.getDayStart(shift.clockOut);
            for (let i = shiftStart; i <= shiftEnd; i = i + DAY_MS) {
              let dayShifts = employee.dailyShifts.get(i);
              if (dayShifts === null || dayShifts === undefined) {
                dayShifts = [];
                employee.dailyShifts.set(i, dayShifts);
              }
              dayShifts.push({
                clockIn: i > shift.clockIn ? i : shift.clockIn,
                clockOut:
                  i + DAY_MS > shift.clockOut ? shift.clockOut : i + DAY_MS,
                employeeId: shift.employeeId,
                id: shift.id,
              });
            }
          }
        });
        return employeesMap;
      }),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      })
    );
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('api/employees');
  }

  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>('api/shifts');
  }

  updateEmployees(employees: Employee[]) {
    const updates = employees.map(employee => {
      return this.http.patch(`api/employees/${employee.id}`, {
        email: employee.email,
        hourlyRate: employee.hourlyRate,
        hourlyRateOvertime: employee.hourlyRateOvertime,
        id: employee.id,
        name: employee.name,
      });
    });
    this.employees
      .pipe(
        take(1),
        switchMap(employees => {
          return zip(...updates).pipe(
            tap((result: any[]) => {
              result.forEach(newEmployee => {
                employees.set(
                  newEmployee.id,
                  new EmployeeWithShifts(newEmployee)
                );
              });
              this._employeesUpdate.next(new Map(employees));
            })
          );
        })
      )
      .subscribe();
  }

  updateShifts(shifts: Shift[]) {
    const updates = shifts.map(shift => {
      return this.http.patch(`api/shifts/${shift.id}`, shift);
    });
    this.shifts
      .pipe(
        take(1),
        switchMap(shifts => {
          return zip(...updates).pipe(
            tap((result: any[]) => {
              result.forEach(newShift => {
                const oldShiftIndex = shifts.findIndex(
                  _ => _.id === newShift.id
                );
                if (oldShiftIndex >= 0) {
                  shifts[oldShiftIndex] = newShift;
                }
              });
              this._shiftsUpdate.next([...shifts]);
            })
          );
        })
      )
      .subscribe();
  }
}
