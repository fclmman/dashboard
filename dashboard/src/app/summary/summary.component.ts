import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';

import { EmployeeService } from '../../service/employee.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  count: Observable<number>;
  time: Observable<number>;
  regular: Observable<number>;
  overtime: Observable<number>;

  constructor(private svc: EmployeeService) {
    this.count = this.svc.employees.pipe(
      map(employees => employees?.size ?? 0)
    );
    this.time = this.svc.shifts.pipe(
      map(shifts => {
        return (
          shifts?.reduce((prev, curr) => {
            return prev + (curr.clockOut - curr.clockIn);
          }, 0) ?? 0
        );
      })
    );
    this.regular = this.svc.employeesWithShifts.pipe(
      map(employees => {
        let sum = 0;
        employees.forEach(employee => {
          sum += employee.getPaidRegular();
        });
        return sum;
      })
    );
    this.overtime = this.svc.employeesWithShifts.pipe(
      map(employees => {
        let sum = 0;
        employees.forEach(employee => {
          sum += employee.getPaidOvertime();
        });
        return sum;
      })
    );
  }
}
