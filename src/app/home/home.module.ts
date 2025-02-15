import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [
    CustomersComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})

export class HomeModule { }  // This is the module that will be imported in the app.module.ts file.
