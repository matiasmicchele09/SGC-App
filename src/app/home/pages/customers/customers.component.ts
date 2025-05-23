import { Component, ElementRef, ViewChild } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../interfaces/customers.interface';
import { Modal } from 'bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { Province } from '../../interfaces/provinces.interface';
import { AlertService } from 'src/app/shared/services/alerts.service';
import { closeBootstrapModal } from 'src/app/utils/bootstrap-utils';
import { forkJoin } from 'rxjs';
import { Bank } from '../../interfaces/banks.interface';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  public buttonForm: string = '';
  public isNew: boolean = false;
  public loading: boolean = false;
  public pristine: boolean = false;
  public titleForm: string = '';
  public save: boolean = false;

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public banks: Bank[] = [];
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
    bank: [''],
    created_at: [''],
    deactivated_at: [null],
    address: ['', Validators.required],
    city: ['', Validators.required],
    cuit: ['', Validators.required],
    email: [''],
    id: [0],
    id_bank: [],
    id_province: ['',Validators.required],
    id_tax_condition: [0,Validators.required],
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

    // this.authService.getCurrentUser().subscribe(user => {
    //   console.log("user", user);
    //   this.loadCustomers(user!.id);
    // });
    this.loadCustomers(this.authService.user!.id_user);
  }

  loadCustomers(id_user: number) {
    this.loading = true;

    // función de RxJS que te permite ejecutar varias llamadas asíncronas en paralelo (como peticiones HTTP), y esperar a que todas terminen antes de continuar.
    forkJoin({
      customers: this.customerService.getCustomers(id_user),
      tax_conditions: this.customerService.getTaxConditions(),
      provinces: this.customerService.getProvinces(),
      banks: this.customerService.getBanks()
    }).subscribe({
      next: ({ customers, tax_conditions, provinces, banks }) => {
        this.customers = customers.filter(c => c.active === true);
        console.log(customers);
        this.filteredCustomers = [...this.customers];
        this.totalItems = this.filteredCustomers.length;
        this.taxConditions = tax_conditions;
        this.provinces = provinces;
        this.banks = banks;

        /*console.log(banks);
        console.log(customers);
        console.log(tax_conditions);
        console.log(provinces);*/

        this.customers.forEach((customer: Customer) => {
          customer.tax_condition = this.taxConditions.find(tc => tc.id === customer.id_tax_condition)?.description ?? 'Desconocido';
          customer.province = this.provinces.find(p => p.id === customer.id_province)?.name ?? 'Desconocido';
          customer.bank = this.banks.find(b => b.id_bank === customer.id_bank)?.name ?? 'Desconocido';
        });

        this.loading = false;

        this.updatePage(); //Corta el array para mostrar solo los elementos de la página actual

      },
      error: (err) => {
        console.error(err);
      }
      , complete: () => {
        //console.log("complete");
      }
    })
  }

  updatePage(): void {
    const sorted = [...this.filteredCustomers].sort((a, b) => a.id - b.id);
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

  formatDateToDDMMYYYY(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onCustomer(customer: Customer | null, isNew: boolean) {
    this.pristine = false
    this.isNew = isNew;
    this.selectedCustomer = customer;

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
        this.customerForm.patchValue({
          created_at: this.formatDateToDDMMYYYY(this.selectedCustomer!.created_at)
        });
    }

    const modalElement = document.getElementById('staticCustomerModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const search = input.value.toLowerCase();
    this.filteredCustomers = this.customers.filter((customer: Customer) =>
      customer.name.toLowerCase().includes(search) ||
      customer.surname.toLowerCase().includes(search)
    );

    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage();
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

  isValidField(field: string): boolean | null{
    return this.customerForm.controls[field].errors &&
           this.customerForm.controls[field].touched
  }

  getFieldError(field:string):string | null {
    if (!this.customerForm.controls[field]) return null;

    const errors = this.customerForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {

      switch(key){
        case 'required':
          return 'Este campo es requerido';

        // case 'minlength':
        //   return `Mínimo ${errors['minlength'].requiredLength} caracteres`
      }
    }
    return null;
  }

  saveChanges(customer:FormGroup)   {
    console.log(customer);

    //* Valido que nada este vacío
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    console.log("paso el markAllAsTouched");
    //* Valido que hayan cambiado algún valor
    //Si el valor NO ha sido modificado --> true | Si ha sido modificado --> false
    if (this.areAllFieldsPristine()){
      this.pristine = true;
      return;
    } else this.pristine = false;

    if (this.isNew) {
      console.log(customer.value);
      const newCustomer = { ...customer.value, id_user: this.authService.user!.id_user, created_at: new Date().toISOString(), active: true, deactivated_at: null };
      this.alertService.confirm('¿Desea agregar este cliente?', '').then((result) => {
        if (result.isConfirmed) {
          this.customerService.addCustomer(newCustomer).subscribe({
            next: (customer) => {
              console.log(customer);
              this.alertService.success('Cliente agregado','El cliente fue agregado correctamente');
              this.customers.push(customer);

              // ❌ Cerrar el modal
              closeBootstrapModal(this.customerModalRef);
              this.loadCustomers(this.authService.user!.id_user);
            }
            , error: (err) => {
              this.alertService.error('Error: No se pudo agregar el cliente', err.error.message);
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
              this.loadCustomers(this.authService.user!.id_user);
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

  onDeleteCustomer(customer: Customer) {
    console.log(customer);
    this.alertService.confirm('¿Desea Eliminar este cliente?', '').then((result) => {
      if (result.isConfirmed) {
        const customerDelete = { ...customer, active: false, deactivated_at: new Date().toISOString() };
        this.customerService.updateCustomer(customerDelete).subscribe({
          next: (customer) => {
            console.log(customer);
            this.alertService.success('Cliente Eliminado','');
            this.customers = this.customers.map(c => c.id === customer.id ? customer : c);


            // ❌ Cerrar el modal
            closeBootstrapModal(this.customerModalRef);
            this.loadCustomers(this.authService.user!.id_user);
          }
          , error: (err) => {
            this.alertService.error('Error: No se pudo eliminar el cliente', err.error.message);
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
