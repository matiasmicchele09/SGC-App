import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { authGuard } from '../auth/guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';


const routes: Routes = [
  {
    path:'',
    component: LayoutComponent,
    canActivate: [authGuard],
    children:[
      {path: 'dashboard', component: DashboardComponent},
      {path: 'customers', component: CustomersComponent},
      {path: 'my-profile', component: ProfileComponent},
      {path: '**', redirectTo: 'dashboard'}]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
