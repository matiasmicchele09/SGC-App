import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NgbActiveModal,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Actividad, ACTIVIDADES_ARCA } from 'src/app/data/actividades-arca';
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
  private actividades: Actividad[] = [];
  private emailPattern: string =
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$';
  public titleForm: string = '';
  public pristine: boolean = false;
  public buttonForm: string = '';
  private customers: Customer[] = [];

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
    type_person: [''],
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
  ) {}

  ngOnInit(): void {
    console.log(this.customer);
    // Cargá tu JSON (local o desde API)
    this.actividades = ACTIVIDADES_ARCA;
    /* Por si quedó algun campo con algún valor o quedó el formulario disable por entrar primero a un inactivo */
    this.customerForm.enable();
    this.customerForm.reset();
    if (this.isNew) {
      this.titleForm = 'Nuevo Cliente';
      this.buttonForm = 'Agregar';
      this.customerForm.reset();
      this.customerForm.get('id_tax_condition')?.setValue(0);
      this.customerForm.get('created_at')?.setValue(new Date());
      this.customerForm.get('deactivated_at')?.setValue(null);
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
        const activity = this.actividades.find(
          (a) => a.codActividadArca === Number(this.customer?.activity)
        );
        this.customerForm.get('activity')?.setValue(activity);
      } else {
        this.buttonForm = 'Actualizar';
        this.titleForm = this.customer ? `${title}` : '';
        this.customerForm.patchValue(this.customer!);

        const activity = this.actividades.find(
          (a) => a.codActividadArca === Number(this.customer?.activity)
        );

        this.customerForm.get('activity')?.setValue(activity);
        // ejemplo
        // this.customerForm.patchValue({
        //   activity: this.toActividadValue(this.customer.activity),
        // });

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

  // private toActividadValue = (val: any): any => {
  //   console.log(val);
  //   if (val == null) return '';

  //   // Caso string tipo "11111 — Cultivo de arroz"
  //   if (typeof val === 'string') {
  //     const m = val.match(/^\s*(\d+)\s+—\s+(.+)$/);
  //     if (m) {
  //       const byCode = this.actividades.find(
  //         (a) => String(a.codActividadArca) === m[1]
  //       );
  //       return byCode ?? { codActividadArca: m[1], nombreActividadArca: m[2] };
  //     }
  //     // Solo código o solo nombre
  //     const byCode = this.actividades.find(
  //       (a) => String(a.codActividadArca) === val.trim()
  //     );
  //     if (byCode) return byCode;

  //     const byName = this.actividades.find(
  //       (a) => this.norm(a.nombreActividadArca) === this.norm(val)
  //     );
  //     return byName ?? val; // si no existe, lo dejamos como string libre
  //   }

  //   // Caso número: buscar por código
  //   if (typeof val === 'number') {
  //     const byCode = this.actividades.find(
  //       (a) => Number(a.codActividadArca) === val
  //     );
  //     return byCode ?? val;
  //   }

  //   // Caso objeto ya correcto
  //   if (val.codActividadArca && val.nombreActividadArca) return val;

  //   // Caso objeto con otras keys
  //   const code = val.code ?? val.codigo ?? val.cod;
  //   const name = val.name ?? val.nombre ?? val.desc;
  //   if (code && name)
  //     return {
  //       codActividadArca: String(code),
  //       nombreActividadArca: String(name),
  //     };

  //   return val; // lo que sea, que el formatter lo muestre
  // };

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

  onCloseModal(payload: Customer | null = null) {
    this.activeModal.close(payload);
  }

  private areAllFieldsPristine(): boolean {
    return Object.values(this.customerForm.controls).every(
      (control) => control.pristine
    );
  }

  onChangeTypePerson(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === '2') {
      this.customerForm.get('name')?.setValue('');
      this.customerForm.get('name')?.setValidators(null);
      this.customerForm.get('name')?.updateValueAndValidity();
    } else {
      this.customerForm.get('name')?.setValidators([Validators.required]);
      this.customerForm.get('name')?.updateValueAndValidity();
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
          confirmMessage: '¿Desea agregar este cliente?',
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

  private norm = (v: string) =>
    (v || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();

  public search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) => {
        const t = this.norm(term);
        if (!t) return this.actividades.slice(0, 20);
        return this.actividades
          .filter(
            (a) =>
              this.norm(a.nombreActividadArca).includes(t) ||
              this.norm(String(a.codActividadArca)).includes(t)
          )
          .slice(0, 20); // limitá resultados por performance
      })
    );
  // Cómo se muestra en el input cuando está seleccionado
  public inputFormatter = (a: Actividad | null) =>
    a ? `${a.codActividadArca} — ${a.nombreActividadArca}` : '';

  // Cómo se muestra cada item del dropdown (si no usás ng-template)
  // public resultFormatter = (a: Actividad) =>
  //   `${a.codActividadArca} — ${a.nombreActividadArca}`;

  // Cuando el usuario selecciona un item del dropdown
  public onSelect(e: NgbTypeaheadSelectItemEvent<Actividad>) {
    console.log('e', e);
    // Guardamos el OBJETO en el form control
    this.customerForm
      .get('activity')!
      .setValue(String(e.item.codActividadArca), { emitEvent: true });
    // Si preferís guardar solo el código:
    // this.form.get('actividad')!.setValue(e.item.codActividadArca, { emitEvent: true });
  }

  onSaveChanges(customer: FormGroup) {
    console.log(customer);
    const action = this.resolveAction(
      this.isNew,
      customer.value.active,
      true // Siempre activo al guardar porque si estaba activo sigue activo y si estaba inactivo el form se habilita al reactivar
    );

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

    if (action === 'create') {
      const { confirmMessage, titleMessage, textMessage, errorMessage } =
        this.getMessages(action);

      /* Agrego campos al objeto */
      const newCustomer = this.isNew
        ? {
            ...customer.value,
            activity: String(customer.value.activity.codActividadArca),
            id_user: this.authService.user!.id_user,
            created_at: new Date().toISOString(),
            active: true,
            deactivated_at: null,
            highlight: false,
          }
        : { ...customer.value, id_user: this.authService.user!.id_user };
      //}

      /* Y ahora saco algunos campos que no deben ir al back */
      const {
        province,
        tax_condition,
        bank,
        highlight,
        type_person,
        ...backendCustomer
      } = newCustomer;

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
            this.customerService.addCustomer(backendCustomer).subscribe({
              next: (customer) => {
                const createdCustomer = {
                  ...newCustomer,
                  highlight: true,
                };
                console.log(customer);
                this.alertService.success({
                  title: titleMessage,
                  text: textMessage,
                  timer: 3000,
                });

                // ❌ Cerrar el modal
                this.onCloseModal(customer);
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
    } else if (action === 'update') {
      const { confirmMessage, titleMessage, textMessage, errorMessage } =
        this.getMessages(action);

      /* Y ahora saco algunos campos que no deben ir al back y id que no cambia */
      const {
        province,
        tax_condition,
        bank,
        highlight,
        type_person,
        deactivated_at,
        created_at,
        ...restCustomer
      } = customer.value;

      console.log(restCustomer);
      const backendCustomer = {
        ...restCustomer,
        activity: String(customer.value.activity.codActividadArca),
      };
      console.log(backendCustomer);

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
            this.customerService.updateCustomer(backendCustomer).subscribe({
              next: (customer) => {
                console.log(customer);
                const updatedCustomer = {
                  ...customer,
                  highlight: true,
                };

                this.alertService.success({
                  title: titleMessage,
                  text: textMessage,
                  timer: 3000,
                });
                this.customers = this.customers.map((c) =>
                  c.id === customer.id ? customer : c
                );

                // ❌ Cerrar el modal
                this.onCloseModal(customer);
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
    } else if (action === 'reactivate') {
      const { confirmMessage, titleMessage, textMessage, errorMessage } =
        this.getMessages(action);
      const {
        province,
        tax_condition,
        bank,
        highlight,
        type_person,
        deactivated_at,
        created_at,
        ...backendCustomer
      } = customer.value;

      /* Agrego campos al objeto */
      const reactivatedCustomer = {
        ...backendCustomer,
        active: true,
        deactivated_at: null,
      };
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
            this.customerService.updateCustomer(reactivatedCustomer).subscribe({
              next: (customer) => {
                console.log(customer);
                this.alertService.success({
                  title: titleMessage,
                  text: textMessage,
                  timer: 3000,
                });

                // ❌ Cerrar el modal
                this.onCloseModal(customer);
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
}
