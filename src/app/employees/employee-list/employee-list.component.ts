import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  currentEmployees: any[] = [];
  previousEmployees: any[] = [];
  today: Date = new Date();
  swipeThreshold = 80; // Distance to trigger delete
  draggingEmployee: any | null = null;
  startX = 0;
  moved = false;
  isSwiping = false;
  constructor(
    public employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }


  async ngOnInit() {
    await this.employeeService.loadEmployees();
    this.updateEmployeeLists();
  }

  updateEmployeeLists() {
    const employees = this.employeeService.employees();

    this.currentEmployees = employees.filter(emp =>
      !emp.toDate || new Date(emp.toDate) >= this.today
    );

    this.previousEmployees = employees.filter(emp =>
      emp.toDate && new Date(emp.toDate) < this.today
    );
  }


  editEmployee(id: number, event: any) {
    if (this.isSwiping) {
      this.isSwiping = false;
      return;
    }
    this.employeeService.setEmployee(event)
    this.router.navigate(['/employee/employee-detail', id]);
  }

  addEmployee() {
    this.router.navigate(['/employee/employee-detail']);
  }

  deleteEmployee(id: string) {
    const deletedEmployee = this.currentEmployees.find(emp => emp.id === id) ||
      this.previousEmployees.find(emp => emp.id === id);

    if (!deletedEmployee) return;
    this.currentEmployees = this.currentEmployees.filter(emp => emp.id !== id);
    this.previousEmployees = this.previousEmployees.filter(emp => emp.id !== id);
    const snackBarRef = this.snackBar.open('Employee data has been deleted', 'Undo', { duration: 3000 });

    let isUndone = false;

    snackBarRef.onAction().subscribe(async () => {
      isUndone = true;
      this.employeeService.addEmployee(deletedEmployee);
      await this.employeeService.loadEmployees();
      this.updateEmployeeLists();
    });

    setTimeout(() => {
      if (!isUndone) {
        this.employeeService.deleteEmployee(id);
      }
    }, 3000);
  }

  onSwipeStart(event: MouseEvent | TouchEvent, employee: any) {
    if (!employee || typeof employee !== 'object') return;

    this.draggingEmployee = employee;
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.isSwiping = false;
  }

  onSwipeMove(event: MouseEvent | TouchEvent, employee: any) {
    if (!this.draggingEmployee || typeof employee !== 'object') return;

    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const deltaX = currentX - this.startX;

    if (Math.abs(deltaX) > 10) {
      this.isSwiping = true;
    }

    employee.swipeOffset = Math.min(0, deltaX);
  }

  onSwipeEnd(employee: any) {
    if (!this.draggingEmployee) return;
    if (employee.swipeOffset < -this.swipeThreshold) {
      this.deleteEmployee(employee.id);
    } else {
      employee.swipeOffset = 0;
    }
    this.draggingEmployee = null;
  }

  onSwipeCancel(employee: any) {
    if (this.draggingEmployee) {
      employee.swipeOffset = 0;
      this.draggingEmployee = null;
    }
  }

}