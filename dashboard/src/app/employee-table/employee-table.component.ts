import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';

import { EmployeeWithShifts } from '../../model/employee-with-shifts';
import { EmployeeService } from '../../service/employee.service';
import { EditModalComponent } from '../edit-modal/edit-modal.component';

@Component({
  selector: 'app-employee-table',
  templateUrl: './employee-table.component.html',
  styleUrls: ['./employee-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeTableComponent {
  selected: EmployeeWithShifts[] = [];
  displayedColumns: string[] = [
    'index',
    'name',
    'email',
    'totalTime',
    'paidRegularTime',
    'paidOvertime',
  ];
  employees: Observable<EmployeeWithShifts[]>;
  count: Observable<number>;

  constructor(private svc: EmployeeService, private dialog: MatDialog) {
    this.employees = this.svc.employeesWithShifts.pipe(
      map(map => {
        return Array.from(map.values());
      })
    );
    this.count = this.employees.pipe(map(employees => employees?.length ?? 0));
  }

  update(value: boolean, employee: EmployeeWithShifts) {
    if (value) {
      this.selected = [...this.selected, employee];
    } else {
      this.selected = this.selected.filter(item => item !== employee);
    }
  }

  edit(selected: EmployeeWithShifts[]) {
    this.dialog
      .open(EditModalComponent, {
        data: selected,
      })
      .afterClosed()
      .subscribe(() => {
        this.selected = [];
      });
  }
}
