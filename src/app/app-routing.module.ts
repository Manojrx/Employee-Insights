import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [

  { path: 'employee', loadChildren: () => import('./employees/employee.module').then(m => m.EmployeeModule) },
  { path: '**', redirectTo: 'employee' } // Wildcard route for invalid URLs
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
