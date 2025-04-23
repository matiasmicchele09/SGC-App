import { Component } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces/customers.interface';
import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { Province } from '../../interfaces/provinces.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  public buttonForm: string = '';
  public isNew: boolean = false;
  public pristine: boolean = false;
  public titleForm: string = '';
  public titleSwal: string = '';
  public iconSwal: string = '';
  public save: boolean = false;
  public textSwal: string = '';

  public customers: Customer[] = [];
  public provinces: Province[] = []
  public selectedCustomer: Customer | null = null;
  public taxConditions: Tax_Condition[] = []

  public customerForm: FormGroup = this.fb.group({
    activity: ['', Validators.required],
    active: [true],
    created_at: [''],
    deactivated_at: [null],
    address: ['', Validators.required],
    city: ['', Validators.required],
    cuit: ['', Validators.required],
    email: [''],
    id: [0],
    id_province: [''],
    id_tax_condition: [0],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    province: [''],
    surname: ['', Validators.required],
    tax_key: [''],
    tax_condition: [''],
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
    });

    this.customerService.getProvinces().subscribe({
      next: (provinces) => {
        this.provinces = []
        this.provinces = provinces;
        console.log(provinces);
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.customerService.getCustomers(2).subscribe({
      next: (customers) => {
        // console.log(customers);
        this.customers = customers.filter(c => c.active === true);


        this.customers.forEach((customer: Customer) => {
          let desc;
          desc = this.taxConditions.filter(type => type.id === customer.id_tax_condition)
          customer.tax_condition = desc[0].description
        })

        this.customers.forEach((customer: Customer) => {
          let desc;
          desc = this.provinces.filter(type => type.id === customer.id_province)
          customer.province = desc[0].name
        }
        )

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

    if (isNew) {
      this.titleForm = 'Nuevo Cliente';
      this.buttonForm = 'Agregar';
      this.customerForm.reset();
      this.customerForm.get('id_tax_condition')?.setValue(0);
      this.customerForm.get('fec_alta')?.setValue(new Date());
      this.customerForm.get('fec_baja')?.setValue(null);
      this.customerForm.get('id_province')?.setValue(0);
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
    console.log(customer);

    //* Valido que nada este vacío
   /* if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }*/
    //* Valido que hayan cambiado algún valor
    //Si el valor NO ha sido modificado --> true | Si ha sido modificado --> false
    /*if (this.areAllFieldsPristine()){
      this.pristine = true;
      return;
    } else this.pristine = false;*/

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
    else{
      Swal.fire({
        title: '¿Desea modificar los datos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si'
      }).then((result) => {
        if (result.isConfirmed) {
          // const modalElement = document.getElementById('staticCustomerModal');
          // if (modalElement) {
          //   const modal = new Modal(modalElement);
          //   modal.hide();
          // }


          this.customerService.updateCustomer(customer.value).subscribe({
            next: (customer) => {
              console.log(customer);
              this.save = true;
              this.iconSwal = 'success';
              this.titleSwal = 'Cliente modificado';
              this.textSwal = 'El cliente fue modificado correctamente';
              this.customers = this.customers.map(c => c.id === customer.id ? customer : c);
            }
            , error: (err) => {
              this.save = false;
              this.iconSwal = 'error';
              this.titleSwal = 'Error: No se pudo modificar el cliente';
              this.textSwal = err.error.message;
              console.error(err);
            }
            , complete: () => {
              console.log("complete");
            }
          });

          Swal.fire({
            icon: 'success'  ,
            title: this.titleSwal,
            text: this.textSwal,
            showConfirmButton: false,
            timer: 4500
          })



        }
      })
      const modalElement = document.getElementById('staticCustomerModal');
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.hide();
      }

    }
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
