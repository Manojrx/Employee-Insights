import { Injectable, signal } from '@angular/core';
import { getDB, initDB } from '../utils/db';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  // Signal to store the list of employees
  employees = signal<any[]>([]);

  constructor() {
    initDB();
    this.loadEmployees(); // Load employees when the service is initialized
  }

  // Load all employees from IndexedDB
  async loadEmployees() {
    const db = await getDB();
    const allEmployees = await db.getAll('employees');
    this.employees.set(allEmployees); // Update the signal with the fetched data
  }

  // Add a new employee
  async addEmployee(employee: any) {
    console.log(employee)
    const db = await getDB();
    await db.add('employees', employee);
    this.loadEmployees(); // Refresh the list of employees
  }

  // Update an existing employee
  async updateEmployee(employee: any) {
    const db = await getDB();
    await db.put('employees', employee);
    this.loadEmployees(); // Refresh the list of employees
  }

  // Delete an employee by ID
  async deleteEmployee(id: string) {
    const db = await getDB();
    await db.delete('employees', id);
    this.loadEmployees(); // Refresh the list of employees
  }
  async getEmployeeById(id: string) {
    const db = await getDB();
    const employee = await db.get('employees', id);
    
    if (!employee) {
      console.warn(`Employee with ID ${id} not found.`);
      return null; // Explicitly returning null instead of undefined
    }
    console.log(employee)
    return employee;
  }
  

  private employeeData: any;
  private dateValue = new BehaviorSubject<Date | null>(null);
  setEmployee(employee: any) {
    this.employeeData = employee;
  }

  getEmployee() {
    return this.employeeData;
  }

  getDate(): Observable<any> {
    return this.dateValue.asObservable();
  }

  setDate(data: any) {
    this.dateValue.next(data);
  }
}