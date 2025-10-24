import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Bank } from 'src/app/home/interfaces/banks.interface';
import { Customer } from 'src/app/home/interfaces/customers.interface';
import { Province } from 'src/app/home/interfaces/provinces.interface';
import { Tax_Condition } from 'src/app/home/interfaces/tax_conditions';
import { Type_Person } from 'src/app/home/interfaces/types_persons';
import { CustomersService } from 'src/app/home/services/customers.service';
import { AlertService } from 'src/app/shared/services/alerts.service';
type Action = 'create' | 'update' | 'reactivate';
@Component({
  selector: 'app-customer-modal',
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.css'],
})
export class CustomerModalComponent implements OnInit {
  public emailPattern: string =
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$';
  public titleForm: string = '';
  public pristine: boolean = false;
  public buttonForm: string = '';
  public customers: Customer[] = [];

  public activeModal = inject(NgbActiveModal);

  public customerForm: FormGroup = this.fb.group({
    activity: ['', Validators.required],
    active: [true],
    bank: [''],
    created_at: [''],
    deactivated_at: [null],
    hasDREI: [false],
    nro_cuenta_DREI: [],
    nro_reg_DREI: [],
    address: [''],
    city: ['', Validators.required],
    cuit: [
      '',
      [Validators.required, Validators.maxLength(13), Validators.minLength(11)],
    ],
    email: ['', [Validators.pattern(this.emailPattern)]],
    id: [0],
    id_bank: [0, Validators.required],
    id_province: [0, Validators.required],
    id_tax_condition: [0, Validators.required],
    id_sex: [1],
    id_type: [0, Validators.required],
    id_user: [],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    province: [''],
    surname: ['', Validators.required],
    tax_key: [''],
    tax_condition: [''],
    type_person: ['', Validators.required],
  });

  @Input() customer: Customer | null = null;
  @Input() isNew: boolean = true;
  @Input() types_person: Type_Person[] = [];
  @Input() banks: Bank[] = [];
  @Input() provinces: Province[] = [];
  @Input() taxConditions: Tax_Condition[] = [];

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private customerService: CustomersService,
    private fb: FormBuilder
  ) {
    //his.loadCustomers(this.authService.user!.id_user);
  }

  ngOnInit(): void {
    /* Por si quedó algun campo con algún valor o quedó el formulario disable por entrar primero a un inactivo */
    this.customerForm.enable();
    this.customerForm.reset();
    if (this.isNew) {
      this.titleForm = 'Nuevo Cliente';
      this.buttonForm = 'Agregar';
      this.customerForm.reset();
      this.customerForm.get('id_tax_condition')?.setValue(0);
      this.customerForm.get('fec_alta')?.setValue(new Date());
      this.customerForm.get('fec_baja')?.setValue(null);
      this.customerForm.get('id_province')?.setValue(0);
      this.customerForm.get('id_type')?.setValue(0);
      this.customerForm.get('id_bank')?.setValue(0);
      this.customerForm.get('nro_cuenta_DREI')?.disable();
      this.customerForm.get('nro_reg_DREI')?.disable();
    } else {
      const title =
        this.customer?.id_type === 1
          ? `${this.customer.name} ${this.customer.surname}`
          : `${this.customer?.surname}`;

      if (!this.customer?.active) {
        this.customerForm.disable();
        this.buttonForm = 'Dar de Alta Nuevamente';

        this.titleForm = this.customer ? `${title} - INACTIVO` : '';
        this.customerForm.patchValue(this.customer!);
      } else {
        this.buttonForm = 'Actualizar';
        this.titleForm = this.customer ? `${title}` : '';
        this.customerForm.patchValue(this.customer!);
        if (!this.customer?.hasDREI) {
          this.customerForm.get('nro_cuenta_DREI')?.disable();
          this.customerForm.get('nro_reg_DREI')?.disable();
        }
      }
      // this.customerForm.patchValue({
      //   created_at: this.formatDateToDDMMYYYY(this.customer!.created_at)
      // });
    }
  }

  onCloseModal(payload: Customer | null = null) {
    console.log('payload', payload);
    this.activeModal.close(payload);
  }
  //this.activeModal.dismiss('close-button'); // o

  capitalizeWords(input: string, field: string) {
    const formattedInput = input.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    this.customerForm.get(`${field}`)?.setValue(formattedInput);
  }
  isValidField(field: string): boolean | null {
    return (
      this.customerForm.controls[field].errors &&
      this.customerForm.controls[field].touched
    );
  }

  getFieldError(field: string): string | null {
    if (!this.customerForm.controls[field]) return null;

    const errors = this.customerForm.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
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

  onChangeDREI(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (!isChecked) {
      this.customerForm.get('nro_cuenta_DREI')?.disable();
      this.customerForm.get('nro_reg_DREI')?.disable();
      this.customerForm.get('nro_cuenta_DREI')?.setValue(null);
      this.customerForm.get('nro_reg_DREI')?.setValue(null);
    } else {
      this.customerForm
        .get('nro_cuenta_DREI')
        ?.setValue(
          this.customers.find((c) => c.id === this.customer?.id)
            ?.nro_cuenta_DREI ?? null
        );
      this.customerForm
        .get('nro_reg_DREI')
        ?.setValue(
          this.customers.find((c) => c.id === this.customer?.id)
            ?.nro_reg_DREI ?? null
        );
      this.customerForm.get('nro_cuenta_DREI')?.enable();
      this.customerForm.get('nro_reg_DREI')?.enable();
    }
  }

  private resolveAction(
    isNew: boolean,
    originalActive?: boolean, // estado al cargar el cliente
    currentActive?: boolean // valor del form al guardar
  ): Action {
    if (isNew) return 'create';
    if (originalActive === false && currentActive === true) return 'reactivate';
    return 'update';
  }

  private getMessages(action: Action): {
    confirmMessage: string;
    titleMessage: string;
    textMessage: string;
    errorMessage: string;
  } {
    switch (action) {
      case 'create':
        return {
          confirmMessage: '¿Desea modificar los datos?',
          titleMessage: 'Cliente agregado',
          textMessage: 'El cliente fue agregado correctamente',
          errorMessage: 'Error: No se pudo agregar el cliente',
        };
      case 'update':
        return {
          confirmMessage: '¿Desea modificar los datos?',
          titleMessage: 'Cliente modificado',
          textMessage: 'El cliente fue modificado correctamente',
          errorMessage: 'Error: No se pudieron modificar los datos',
        };
      case 'reactivate':
        return {
          confirmMessage: '¿Desea dar de alta nuevamente este cliente?',
          titleMessage: 'Cliente reactivado',
          textMessage: 'El cliente fue dado de alta correctamente',
          errorMessage: 'Error: No se pudo reactivar el cliente',
        };
    }
  }
  onSaveChanges(customer: FormGroup) {
    console.log(customer);

    const action = this.resolveAction(
      this.isNew,
      customer.value.active,
      true // Siempre activo al guardar porque si estaba activo sigue activo y si estaba inactivo el form se habilita al reactivar
    );

    console.log('Action:', action);

    if (customer.value.active) {
    }
    //* Valido que nada este vacío
    if (this.customerForm.invalid && action !== 'reactivate') {
      this.customerForm.markAllAsTouched();
      return;
    }

    //* Valido que hayan cambiado algún valor
    //Si el valor NO ha sido modificado --> true | Si ha sido modificado --> false
    if (this.areAllFieldsPristine() && action !== 'reactivate') {
      this.pristine = true;
      return;
    } else this.pristine = false;

    const { confirmMessage, titleMessage, textMessage, errorMessage } =
      this.getMessages(action);

    /* Agrego campos al objeto */
    const newCustomer = this.isNew
      ? {
          ...customer.value,
          id_user: this.authService.user!.id_user,
          created_at: new Date().toISOString(),
          active: true,
          deactivated_at: null,
          highlight: false,
        }
      : { ...customer.value, id_user: this.authService.user!.id_user };
    //}

    /* Y ahora saco algunos campos que no deben ir al back */
    const { province, tax_condition, bank, highlight, ...backendCustomer } =
      newCustomer;
    console.log(newCustomer);

    this.alertService
      .confirm({
        title: confirmMessage,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.customerService
            .addCustomer(backendCustomer, this.isNew)
            .subscribe({
              next: (customer) => {
                console.log(customer);
                console.log(titleMessage);
                this.alertService.success({
                  title: titleMessage,
                  text: textMessage,
                  timer: 3000,
                });
                if (this.isNew) this.customers.push(customer);
                else
                  this.customers = this.customers.map((c) =>
                    c.id === customer.id ? customer : c
                  );

                // ❌ Cerrar el modal
                this.onCloseModal(newCustomer);
                // this.loadCustomers(this.authService.user!.id_user);
              },
              error: (err) => {
                console.log(err);
                this.alertService.error({
                  title: errorMessage,
                  text: err,
                  timer: 3000,
                });
                console.error(err);
              },
              complete: () => {
                console.log('complete');
              },
            });
        }
      });
  }

  onDeleteCustomer(customer: Customer) {
    console.log(customer);
    this.alertService
      .confirm({
        title: '¿Desea Eliminar este cliente?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      })
      .then((result) => {
        if (result.isConfirmed) {
          const customerDelete = {
            ...customer,
            active: false,
            deactivated_at: new Date().toISOString(),
          };
          this.customerService.updateCustomer(customerDelete).subscribe({
            next: (customer) => {
              console.log(customer);
              this.alertService.success({
                title: 'Cliente Eliminado',
                timer: 3000,
              });
              this.customers = this.customers.map((c) =>
                c.id === customer.id ? customer : c
              );

              // ❌ Cerrar el modal
              this.onCloseModal(customer);
              // this.loadCustomers(this.authService.user!.id_user);
            },
            error: (err) => {
              this.alertService.error({
                title: 'Error: No se pudo eliminar el cliente',
                text: err.error.message,
                timer: 3000,
              });
              console.error(err);
            },
            complete: () => {
              console.log('complete');
            },
          });
        }
      });
  }

  areAllFieldsPristine(): boolean {
    return Object.values(this.customerForm.controls).every(
      (control) => control.pristine
    );
  }
}
