import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NgbPaginationModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { HomeRoutingModule } from './home-routing.module';
import { CustomerModalComponent } from './pages/customers/customer-modal/customer-modal.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FeesComponent } from './pages/fees/fees.component';
@NgModule({
  declarations: [
    CustomersComponent,
    DashboardComponent,
    SidebarComponent,
    LayoutComponent,
    ProfileComponent,
    CustomerModalComponent,
    FeesComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    NgChartsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
  ],
})
export class HomeModule {} // This is the module that will be imported in the app.module.ts file.
