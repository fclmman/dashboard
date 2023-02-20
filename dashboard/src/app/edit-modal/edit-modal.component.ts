import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { EmployeeService } from '../../service/employee.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeWithShifts } from '../../model/employee-with-shifts';
import { DAY_MS, HOUR_MS, TimeUtil } from '../../util/time-util';
import { Shift } from '../../model/shift';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditModalComponent {
  date = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: EmployeeWithShifts[],
    private dialogRef: MatDialogRef<EditModalComponent>,
    private svc: EmployeeService
  ) {}

  getShifts(employee: EmployeeWithShifts, date: Date) {
    const dayStart = TimeUtil.getDayStart(date.getTime());
    const dayEnd = dayStart + DAY_MS;
    return employee.originalShifts
      .filter(shift => {
        return shift.clockIn <= dayEnd && shift.clockOut >= dayStart;
      })
      .sort((a, b) => a.clockIn - b.clockIn);
  }

  inChanged(shift: Shift, time: string) {
    const dt = new Date(shift.clockIn);
    const [hours, minutes] = time.split(':');
    dt.setHours(Number(hours));
    dt.setMinutes(Number(minutes));
    shift.clockIn = dt.getTime();
    shift.dirty = true;
  }

  outChanged(shift: Shift, time: string) {
    const dt = new Date(shift.clockOut);
    const [hours, minutes] = time.split(':');
    dt.setHours(Number(hours));
    dt.setMinutes(Number(minutes));
    shift.clockOut = dt.getTime();
    shift.dirty = true;
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    const dirtyEmployee = this.data.filter(_ => _.dirty);
    if (dirtyEmployee) {
      this.svc.updateEmployees(dirtyEmployee);
    }
    const dirtyShifts = this.data.reduce((prev: Shift[], curr) => {
      prev.push(...curr.originalShifts.filter(_ => _.dirty));
      return prev;
    }, []);
    if (dirtyShifts) {
      this.svc.updateShifts(dirtyShifts);
    }
    this.dialogRef.close();
  }
}
