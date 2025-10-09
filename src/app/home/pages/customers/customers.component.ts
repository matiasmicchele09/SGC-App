import { AlertService } from 'src/app/shared/services/alerts.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { closeBootstrapModal } from 'src/app/utils/bootstrap-utils';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CustomersService } from '../../services/customers.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';

import { Bank } from '../../interfaces/banks.interface';
import { Customer } from '../../interfaces/customers.interface';
import { forkJoin } from 'rxjs';
import { Province } from '../../interfaces/provinces.interface';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { Type_Person } from '../../interfaces/types_persons';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  public buttonForm: string = '';
  public emailPattern: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
  public isNew: boolean = false;
  public loading: boolean = false;
  public pristine: boolean = false;
  public titleForm: string = '';

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public banks: Bank[] = [];
  public provinces: Province[] = []
  public selectedCustomer: Customer | null = null;
  public taxConditions: Tax_Condition[] = []
  public types_person: Type_Person[] = [];

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
    hasDREI: [false],
    nro_cuenta_DREI: [],
    nro_reg_DREI: [],
    address: ['', Validators.required],
    city: ['', Validators.required],
    cuit: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(11)]],
    email: ['', [Validators.pattern(this.emailPattern)]],
    id: [0],
    id_bank: [],
    id_province: ['',Validators.required],
    id_tax_condition: [0,Validators.required],
    id_sex: [1],
    id_type: [0],
    id_user: [],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    province: [''],
    surname: ['', Validators.required],
    tax_key: [''],
    tax_condition: [''],
    type_person:[]
   });




  constructor(private customerService: CustomersService,
              private fb: FormBuilder,
              private authService: AuthService,
              private alertService: AlertService) {
    this.loadCustomers(this.authService.user!.id_user);
  }

  loadCustomers(id_user: number) {
    this.loading = true;

    // función de RxJS que te permite ejecutar varias llamadas asíncronas en paralelo (como peticiones HTTP), y esperar a que todas terminen antes de continuar.
    forkJoin({
      customers: this.customerService.getCustomers(id_user),
      tax_conditions: this.customerService.getTaxConditions(),
      provinces: this.customerService.getProvinces(),
      banks: this.customerService.getBanks(),
      type_person: this.customerService.getTypesPerson(),
    }).subscribe({
      next: ({ customers, tax_conditions, provinces, banks, type_person }) => {
        // this.customers = customers.filter(c => c.active === true);
        this.customers = customers;
        console.log(customers);
        this.filteredCustomers = [...this.customers];
        this.totalItems = this.filteredCustomers.length;
        this.taxConditions = tax_conditions;
        this.provinces = provinces;
        this.banks = banks;
        this.types_person = type_person;

        /*console.log(banks);
        console.log(customers);
        console.log(tax_conditions);
        console.log(provinces);*/

        this.customers.forEach((customer: Customer) => {
          customer.tax_condition = this.taxConditions.find(tc => tc.id === customer.id_tax_condition)?.description ?? 'Desconocido';
          customer.province = this.provinces.find(p => p.id === customer.id_province)?.name ?? 'Desconocido';
          customer.bank = this.banks.find(b => b.id_bank === customer.id_bank)?.name ?? 'Desconocido';
          customer.type_person = this.types_person.find(tp => tp.id_type === customer.id_type)?.description ?? 'Desconocido';
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
    //const sorted = [...this.filteredCustomers].sort((a, b) => a.id - b.id);
    //const sorted = [...this.filteredCustomers].sort((a, b) => a.id - b.id);
    const sorted = [...this.filteredCustomers].sort((a, b) => a.surname.localeCompare(b.surname));

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

  areAllFieldsPristine(): boolean {
  return Object.values(this.customerForm.controls).every(control => control.pristine);
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
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
        case 'minlength':
          return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        case 'pattern':
          return 'Formato inválido';
      }
    }
    return null;
  }

  capitalizeWords(input: string, field:string) {
    const formattedInput = input.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    this.customerForm.get(`${field}`)?.setValue(formattedInput);
  }

  onFilterChange(event: Event) {
    const input = event?.target as HTMLInputElement;

    if (input.value === 'activos') this.filteredCustomers = this.customers.filter(customer => customer.active === true);
    else if (input.value === 'baja') this.filteredCustomers = this.customers.filter(customer => customer.active === false);
    else if (input.value === 'todos') this.filteredCustomers = [...this.customers];

    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage();
    return;
  }

  onChangeDREI(event: Event): void {
  const isChecked = (event.target as HTMLInputElement).checked;

    if (!isChecked){
      this.customerForm.get('nro_cuenta_DREI')?.disable();
      this.customerForm.get('nro_reg_DREI')?.disable();
      this.customerForm.get('nro_cuenta_DREI')?.setValue(null);
      this.customerForm.get('nro_reg_DREI')?.setValue(null);
    }
    else{
      this.customerForm.get('nro_cuenta_DREI')?.setValue(this.customers.find(c => c.id === this.selectedCustomer?.id)?.nro_cuenta_DREI ?? null);
      this.customerForm.get('nro_reg_DREI')?.setValue(this.customers.find(c => c.id === this.selectedCustomer?.id)?.nro_reg_DREI ?? null);
      this.customerForm.get('nro_cuenta_DREI')?.enable();
      this.customerForm.get('nro_reg_DREI')?.enable();
    }
  }

  onCustomer(customer: Customer | null, isNew: boolean) {
    console.log(customer);
    this.pristine = false
    this.isNew = isNew;
    this.selectedCustomer = customer;
    /* Por si quedó algun campo con algún valor o quedó el formulario disable por entrar primero a un inactivo */
    this.customerForm.enable();
    this.customerForm.reset();

    if (isNew) {
      this.titleForm = 'Nuevo Cliente';
      this.buttonForm = 'Agregar';
      this.customerForm.reset();
      this.customerForm.get('id_tax_condition')?.setValue(0);
      this.customerForm.get('fec_alta')?.setValue(new Date());
      this.customerForm.get('fec_baja')?.setValue(null);
      this.customerForm.get('id_province')?.setValue(0);
      this.customerForm.get('id_type')?.setValue(0);
      this.customerForm.get('nro_cuenta_DREI')?.disable();
            this.customerForm.get('nro_reg_DREI')?.disable();
    }
    else {
      const title = this.selectedCustomer?.id_type === 1 ? `${this.selectedCustomer.name} ${this.selectedCustomer.surname}` : `${this.selectedCustomer?.surname}`;    

      if (!customer?.active){
        this.customerForm.disable()
        this.buttonForm = 'Dar de Alta Nuevamente';

        this.titleForm = this.selectedCustomer
          ? `${title} - INACTIVO`
          : '';
          this.customerForm.patchValue(this.selectedCustomer!);
      }else{

        this.buttonForm = 'Actualizar';
        this.titleForm = this.selectedCustomer
          ? `${title}`
          : '';
          this.customerForm.patchValue(this.selectedCustomer!);
          if (!this.selectedCustomer?.hasDREI) {
            this.customerForm.get('nro_cuenta_DREI')?.disable();
            this.customerForm.get('nro_reg_DREI')?.disable();
          }
      }
        // this.customerForm.patchValue({
        //   created_at: this.formatDateToDDMMYYYY(this.selectedCustomer!.created_at)
        // });
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

  onSaveChanges(customer:FormGroup)   {

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

    const confirmMessage = this.isNew ? '¿Desea agregar este cliente?' : '¿Desea modificar los datos?';
    const titleMessage = this.isNew ? 'Cliente agregado' : 'Cliente modificado';
    const textMessage = this.isNew ? 'El cliente fue agregado correctamente' : 'El cliente fue modificado correctamente';
    const errorMessage = this.isNew ? 'Error: No se pudo agregar el cliente' : 'Error: No se pudieron modificar los datos';
    /* Agrego campos al objeto */
    const newCustomer = this.isNew ? { ...customer.value,
                        id_user: this.authService.user!.id_user,
                        created_at: new Date().toISOString(),
                        active: true,
                        deactivated_at: null } : { ...customer.value,
                        id_user: this.authService.user!.id_user, };
                      //}

    /* Y ahora saco algunos campos que no deben ir al back */
    const {province, tax_condition, bank, ...backendCustomer} = newCustomer;
    console.log(backendCustomer);

    this.alertService.confirm(confirmMessage, '').then((result) => {
        if (result.isConfirmed) {
          this.customerService.addCustomer(backendCustomer, this.isNew).subscribe({
            next: (customer) => {

              console.log(customer);
              console.log(titleMessage);
              this.alertService.success(titleMessage, textMessage);
              if (this.isNew)
                this.customers.push(customer);
              else
              this.customers = this.customers.map(c => c.id === customer.id ? customer : c);

              // ❌ Cerrar el modal
              closeBootstrapModal(this.customerModalRef);
              this.loadCustomers(this.authService.user!.id_user);
            }
            , error: (err) => {
              console.log(err);
              this.alertService.error(errorMessage, err);
              console.error(err);
            }
            , complete: () => {
              console.log("complete");
            }
          });
        }
      });
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
