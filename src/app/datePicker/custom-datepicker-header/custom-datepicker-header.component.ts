import { ChangeDetectorRef, Component, inject, OnDestroy, signal } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { startWith, Subject, Subscription, takeUntil } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import moment from 'moment';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-datepicker-header',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './custom-datepicker-header.component.html',
  styleUrl: './custom-datepicker-header.component.scss'
})
export class CustomDatepickerHeaderComponent<D> implements OnDestroy {
  public _calendar = inject(MatCalendar<D>);
  private _dateAdapter = inject(DateAdapter<D>);
  private _dateFormats = inject(MAT_DATE_FORMATS);

  private _destroyed = new Subject<void>();

  readonly periodLabel = signal('');
  selectedDate: any;
  previousDate: any;
  dateSubscription: Subscription;
  todaySelected: boolean = false;
  weekSelected: boolean = false;
  mondaySelected: boolean = false;
  tuesdaySelected: boolean = false;

  constructor(private employeeService: EmployeeService, private cd: ChangeDetectorRef) {
    this._calendar.stateChanges.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      this.periodLabel.set(
        this._dateAdapter
          .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
          .toUpperCase(),
      );
    });
    this.dateSubscription = this.employeeService.getDate().subscribe(data => {
      this.selectedDate = moment(data).toDate() || null;
      this.previousDate = moment(data).toDate() || null;
      if (this.selectedDate) {
        this.updateSelectionStatus();
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
    this.todaySelected = this.mondaySelected = this.tuesdaySelected = this.weekSelected = false;
    this.cd.markForCheck();
  }

  updateSelectionStatus() {
    const today = this._dateAdapter.today();
    const day = this._dateAdapter.getDayOfWeek(today);

    const dateMap = {
      today: moment(today).toDate(),
      monday: moment(this._dateAdapter.addCalendarDays(today, ((8 - day) % 7) || 7)).toDate(),
      tuesday: moment(this._dateAdapter.addCalendarDays(today, ((9 - day) % 7) || 7)).toDate(),
      week: moment(this._dateAdapter.addCalendarDays(today, 7)).toDate(),
    };
    this.todaySelected = this.mondaySelected = this.tuesdaySelected = this.weekSelected = false;

    const selectedDateString = this.selectedDate?.toDateString();
    switch (selectedDateString) {
      case dateMap.today?.toDateString():
        this.todaySelected = true;
        break;
      case dateMap.monday?.toDateString():
        this.mondaySelected = true;
        break;
      case dateMap.tuesday?.toDateString():
        this.tuesdaySelected = true;
        break;
      case dateMap.week?.toDateString():
        this.weekSelected = true;
        break;
    }

    this.cd.detectChanges();
  }

  selectToday() {
    const today = this._dateAdapter.today();
    this._calendar.activeDate = today;
    this._calendar.selected = today;
    this.updateSelectionStatus();
  }

  selectNextMonday() {
    let date = this._dateAdapter.today();
    let day = this._dateAdapter.getDayOfWeek(date);
    let nextMonday = this._dateAdapter.addCalendarDays(date, ((8 - day) % 7) || 7);
    this._calendar.activeDate = nextMonday;
    this._calendar.selected = nextMonday;
    this.updateSelectionStatus();
  }

  selectNextTuesday() {
    let date = this._dateAdapter.today();
    let day = this._dateAdapter.getDayOfWeek(date);
    let nextTuesday = this._dateAdapter.addCalendarDays(date, ((9 - day) % 7) || 7);
    this._calendar.activeDate = nextTuesday;
    this._calendar.selected = nextTuesday;
    this.updateSelectionStatus();
  }

  selectAfterOneWeek() {
    let nextWeek = this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 7);
    this._calendar.activeDate = nextWeek;
    this._calendar.selected = nextWeek;
    this.updateSelectionStatus();
  }

  getFormattedMonthYear(): string {
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toUpperCase();
  }

  goToPreviousMonth() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1);
  }

  goToNextMonth() {
    this._calendar.activeDate = this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1);
  }

  confirmDateSelection() {
    this.employeeService.setDate({ date: this._calendar.selected, open: true });
  }

  dismissDateSelection() {
    this.employeeService.setDate({ date: this._calendar.selected, open: false });
  }

  retrieveSelectedDate(): Date | null {
    const selected = this._calendar.selected;
    if (moment.isMoment(selected)) {
      this.selectedDate = selected.toDate();
      if (this.selectedDate && (!this.previousDate || this.selectedDate.toDateString() !== this.previousDate.toDateString())) {
        this.previousDate = this.selectedDate;
        this.updateSelectionStatus();
      }
      return selected.toDate();
    } else if (selected instanceof Date) {
      return selected;
    } else {
      return null;
    }
  }
}
