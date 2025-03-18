import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    inject,
    Input,
    Optional,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepicker, MatCalendar } from '@angular/material/datepicker';
import { CustomDatepickerHeaderComponent } from '../../datePicker/custom-datepicker-header/custom-datepicker-header.component';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatDateFormats
} from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import moment from 'moment';
import { Subscription } from 'rxjs';

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'DD MM YYYY' },
  display: {
      dateInput: 'DD MMM yyyy',
      monthYearLabel: 'MMM yyyy',
      dateA11yLabel: 'DD MMM YYYY',
      monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
  providers: [
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
      { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class EmployeeFormComponent {
  @ViewChild('fromPicker') fromPicker!: MatDatepicker<Date>;
  @ViewChild('toPicker') toPicker!: MatDatepicker<Date>;

  customHeader = CustomDatepickerHeaderComponent;
  minDate = new Date();
  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  employeeId: string = '';
  dateSubscription: Subscription = new Subscription;

  constructor(
      private fb: FormBuilder,
      private employeeService: EmployeeService,
      private router: Router,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      @Optional() @Inject(MatCalendar) public calendar: MatCalendar<Date>
  ) {
      this.initializeDateSubscription();

      this.initializeEmployeeForm();

      this.checkForEditMode();
  }

  private initializeDateSubscription(): void {
      this.dateSubscription = this.employeeService.getDate().subscribe(data => {
          if (data?.date && data?.open) {
              this.updateDateFields(data.date);
          }

          if (data?.open === false) {
              this.fromPicker.close();
              this.toPicker.close();
          }
      });
  }

  private initializeEmployeeForm(): void {
      this.employeeForm = this.fb.group({
          id: [],
          name: ['', Validators.required],
          role: ['', Validators.required],
          fromDate: [new Date(), [Validators.required]],
          toDate: [null, [Validators.required]]
      });
  }

  private checkForEditMode(): void {
      this.route.paramMap.subscribe(params => {
          this.employeeId = params.get('id') || '';
          if (this.employeeId) {
              this.isEditMode = true;
              this.loadEmployeeData();
          }
      });
  }

  private async loadEmployeeData(): Promise<void> {
      let employee = await this.employeeService.getEmployeeById(this.employeeId);
      this.employeeForm.patchValue({
          id: employee?.id,
          name: employee?.name,
          role: employee?.role,
          fromDate: employee?.fromDate || null,
          toDate: employee?.toDate || null
      });
  }

  private updateDateFields(selectedDate: Date): void {
      if (this.fromPicker?.opened) {
          this.employeeForm.get('fromDate')?.setValue(selectedDate);
          this.fromPicker.close();
      } else if (this.toPicker?.opened) {
          this.employeeForm.get('toDate')?.setValue(selectedDate);
          this.toPicker.close();
      }
  }

  async submitEmployeeForm(): Promise<void> {
      let formData = { ...this.employeeForm.value };

      if (this.employeeForm.valid) {
          formData.fromDate = moment(formData.fromDate).toDate();
          formData.toDate = moment(formData.toDate).toDate();

          if (this.isEditMode) {
              await this.employeeService.updateEmployee(formData);
          } else {
              formData.id = this.generateUniqueEmployeeId(formData.name);
              await this.employeeService.addEmployee(formData);
          }

          this.router.navigate(['/employee/list']);
          this.employeeForm.reset();
      } else {
          alert('Please fill in all required fields.');
      }
  }

  private generateUniqueEmployeeId(employeeName: string): string {
      const formattedName = employeeName.replace(/\s+/g, '').toUpperCase();
      return `EMP_${formattedName}`;
  }
  delete(){
      this.employeeService.deleteEmployee( this.employeeId);

      this.router.navigate(['/employee/list']);
  }
}
