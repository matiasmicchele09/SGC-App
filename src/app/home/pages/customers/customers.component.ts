import { Component } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces/customers.interface';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  public customers: Customer[] = [];

  constructor(private customerService: CustomersService,

  ) {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        console.log(customers);
        this.customers = customers;
      }
      , error: (err) => {
        console.error(err);
      }
      , complete: () => {
        console.log("complete");
      }
    });
  }

  onCustomer(customer: any, isNew: boolean) {
    console.log(customer);

  }




}
