import { Component, ElementRef, ViewChild } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces/customers.interface';
import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { Province } from '../../interfaces/provinces.interface';
import Swal from 'sweetalert2';
import { AlertService } from 'src/app/shared/services/alerts.service';
import { closeBootstrapModal } from 'src/app/utils/bootstrap-utils';

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
  public save: boolean = false;

  public customers: Customer[] = [];
  public provinces: Province[] = []
  public selectedCustomer: Customer | null = null;
  public taxConditions: Tax_Condition[] = []

  //* Variables para paginación local. Es decir, mi backend no tiene paginación
  public customersPerPage: Customer[] = [];
  public page: number = 1;
  public pageSize: number = 10;
  public totalItems: number = 0;


  @ViewChild('customerModal') customerModalRef!: ElementRef;

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
              private authService: AuthService,
              private alertService: AlertService) {

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

    this.loadCustomers();
    // this.customerService.getCustomers(2).subscribe({
    //   next: (customers) => {
    //     // console.log(customers);
    //     this.customers = customers.filter(c => c.active === true);


    //     this.customers.forEach((customer: Customer) => {
    //       let desc;
    //       desc = this.taxConditions.filter(type => type.id === customer.id_tax_condition)
    //       customer.tax_condition = desc[0].description
    //     })

    //     this.customers.forEach((customer: Customer) => {
    //       let desc;
    //       desc = this.provinces.filter(type => type.id === customer.id_province)
    //       customer.province = desc[0].name
    //      // console.log(desc);
    //     }
    //     )

    //   }
    //   , error: (err) => {
    //     console.error(err);
    //   }
    //   , complete: () => {
    //     console.log("complete");
    //   }
    // });
  }

  loadCustomers(){
    this.customerService.getCustomers(2).subscribe({
      next: (customers) => {
        // console.log(customers);
        this.customers = customers.filter(c => c.active === true);
        this.totalItems = this.customers.length;



        this.customers.forEach((customer: Customer) => {
          let desc;
          desc = this.taxConditions.filter(type => type.id === customer.id_tax_condition)
          customer.tax_condition = desc[0].description
        })

        this.customers.forEach((customer: Customer) => {
          let desc;
          desc = this.provinces.filter(type => type.id === customer.id_province)
          customer.province = desc[0].name
         // console.log(desc);
          }
        )

        this.updatePage(); //Corta el array para mostrar solo los elementos de la página actual

      }
      , error: (err) => {
        console.error(err);
      }
      , complete: () => {
        console.log("complete");
      }
    });
  }

  updatePage() {
    const sorted = [...this.customers].sort((a, b) => a.id - b.id);
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.customersPerPage = sorted.slice(startIndex, endIndex);
  }
  changePage(p: number, $event: Event): void {
    $event.preventDefault();
    if (p < 1 || p > this.totalPages()) return;
    this.page = p;
    this.updatePage();
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
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

    else{

      this.alertService.confirm('¿Desea modificar los datos?', '').then((result) => {
        if (result.isConfirmed) {
          this.customerService.updateCustomer(customer.value).subscribe({
            next: (customer) => {
              console.log(customer);
              this.alertService.success('Cliente modificado','El cliente fue modificado correctamente');
              this.customers = this.customers.map(c => c.id === customer.id ? customer : c);


              // ❌ Cerrar el modal
              closeBootstrapModal(this.customerModalRef);
              this.loadCustomers();
            }
            , error: (err) => {
              this.alertService.error('Error: No se pudieron modificar los datos', err.error.message);
              console.error(err);
            }
            , complete: () => {
              console.log("complete");
            }
          });
        }
      }
      );
    }


  }
  onDeleteCustomer(customer: Customer | null) {

  }



}
