import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';


const routes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent,
    // children: [
    //   { path: 'login', component: LoginPageComponent },
    //   { path: '**', redirectTo: 'login' }
    // ]
  },
  {
    path: 'customers', component: CustomersComponent
  },
  {
    path: '**', redirectTo: 'dashboard'
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
