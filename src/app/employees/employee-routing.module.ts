import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'list',  pathMatch: 'full' }, // Redirect empty 'auth/' to 'auth/login'
  { path: 'list', component: EmployeeListComponent },
  { path: 'employee-detail', component: EmployeeFormComponent },
  { path: 'employee-detail/:id', component: EmployeeFormComponent },
  { path: '**', redirectTo: 'list' } // Handle unknown routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
