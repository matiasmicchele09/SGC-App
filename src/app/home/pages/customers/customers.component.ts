import { Component } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces/customers.interface';
import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Tax_Condition } from '../../interfaces/tax_conditions';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  public customers: Customer[] = [];
  public selectedCustomer: Customer | null = null;
  public taxConditions: Tax_Condition[] = []
  public titleForm: string = '';
  public buttonForm: string = '';
  public pristine: boolean = false;
  public isNew: boolean = false;

  public customerForm: FormGroup = this.fb.group({
    activity: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    cuit: ['', Validators.required],
    email: [''],
    fec_alta: [''],
    fec_baja: [null],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    surname: ['', Validators.required],
    tax_code: [''],
    // id_tax_condition: [''],
    tax_condition: ['']
   });

  constructor(private customerService: CustomersService,
              private fb: FormBuilder,
              private authService: AuthService){

    this.customerService.getTaxConditions().subscribe({
      next: (tax_conditions) => {
        this.taxConditions = []
        this.taxConditions = tax_conditions;
        console.log(tax_conditions);
      },
      error: (err) => {
        console.log(err);
      }
    })
    this.customerService.getCustomers(2).subscribe({
      next: (customers) => {
        // console.log(customers);
        this.customers = customers;


        this.customers.forEach((customer: Customer) => {
          let desc;
          desc = this.taxConditions.filter(type => type.id === customer.id_tax_condition)
          customer.tax_condition = desc[0].description
        })

      }
      , error: (err) => {
        console.error(err);
      }
      , complete: () => {
        console.log("complete");
      }
    });
  }

  onCustomer(customer: Customer | null, isNew: boolean) {
    this.isNew = isNew;
    this.selectedCustomer = customer;
    console.log(this.selectedCustomer);
    // if (isNew) {
    //   this.selectedCustomer = {
    //     id: 0,
    //     name: '',
    //     email: '',
    //     phone: '',
    //     address: '',
    //     city: '',
    //     surname: '',
    //     activity: '',
    //     cuit: ''
    //   };
    // }
    if (isNew) {
      this.titleForm = 'Nuevo Cliente';
      this.buttonForm = 'Agregar';
      this.customerForm.reset();
    }
    else {
      this.buttonForm = 'Actualizar';
      this.titleForm = this.selectedCustomer
        ? `${this.selectedCustomer.name} ${this.selectedCustomer.surname}`
        : '';

        this.customerForm.patchValue(this.selectedCustomer!);
       /* this.customerForm.get('name')?.patchValue(this.selectedCustomer?.name);
        this.customerForm.get('email')?.setValue(this.selectedCustomer?.email);
        this.customerForm.get('email')?.setValue(this.selectedCustomer?.email);
        this.customerForm.get('email')?.setValue(this.selectedCustomer?.email);
        this.customerForm.get('email')?.setValue(this.selectedCustomer?.email);*/
    }

    const modalElement = document.getElementById('staticCustomerModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
  areAllFieldsPristine(): boolean {
    const controls = this.customerForm.controls;
    return controls['name'].pristine &&
           controls['surname'].pristine &&
           controls['email'].pristine &&
           controls['phone'].pristine &&
           controls['cuit'].pristine &&
           controls['activity'].pristine &&
           controls['city'].pristine;
  }
  saveChanges(customer:FormGroup)   {

    //* Valido que nada este vacío
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    //* Valido que hayan cambiado algún valor
    //Si el valor NO ha sido modificado --> true | Si ha sido modificado --> false
    if (this.areAllFieldsPristine()){
      this.pristine = true;
      return;
    } else this.pristine = false;

    if (this.isNew) {
      console.log(customer.value);



      // this.customerService.addCustomer(customer.value, this.isNew).subscribe({
      //   next: (customer) => {
      //     console.log(customer);
      //     this.customers.push(customer);
      //   }
      //   , error: (err) => {
      //     console.error(err);
      //   }
      //   , complete: () => {
      //     console.log("complete");
      //   }
      // });
    }
    // if (this.selectedCustomer) {
    //   this.customers = this.customers.map(c => c.id === this.selectedCustomer?.id ? customer.value : c);
    // } else {
    //   this.customers.push(customer.value);
    // }
    // const modalElement = document.getElementById('staticCustomerModal');
    // if (modalElement) {
    //   const modal = new Modal(modalElement);
    //   modal.hide();
    // }
  }
  onDeleteCustomer(customer: Customer | null) {
    const modalElement = document.getElementById('staticCustomerModal');
    console.log(customer);
    // if (modalElement) {
    //   const modal = new Modal(modalElement);
    //   modal.hide();
    // }
    // this.customers = this.customers.filter(c => c.id !== customer.id);
  }




}
