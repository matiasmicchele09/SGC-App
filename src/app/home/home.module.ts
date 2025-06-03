import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { HomeRoutingModule } from './home-routing.module';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './pages/profile/profile.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    CustomersComponent,
    DashboardComponent,
    SidebarComponent,
    LayoutComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    NgChartsModule
  ]
})

export class HomeModule { }  // This is the module that will be imported in the app.module.ts file.
