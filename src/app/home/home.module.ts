import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { HomeRoutingModule } from './home-routing.module';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { LayoutComponent } from './pages/layout/layout.component';

@NgModule({
  declarations: [
    CustomersComponent,
    DashboardComponent,
    SidebarComponent,
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
  ]
})

export class HomeModule { }  // This is the module that will be imported in the app.module.ts file.
