import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CustomersService } from '../../services/customers.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Bank } from '../../interfaces/banks.interface';
import { Customer } from '../../interfaces/customers.interface';
import { Province } from '../../interfaces/provinces.interface';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { Type_Person } from '../../interfaces/types_persons';
import { CustomerModalComponent } from './customer-modal/customer-modal.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent {
  public isNew: boolean = false;
  public loading: boolean = false;
  public pristine: boolean = false;

  private modalCustomer = inject(NgbModal);

  public customers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public banks: Bank[] = [];
  public provinces: Province[] = [];
  public selectedCustomer: Customer | null = null;
  public taxConditions: Tax_Condition[] = [];
  public types_person: Type_Person[] = [];

  public order: 'ultimo' | 'abc' = 'ultimo';
  //* Variables para paginación local. Es decir, mi backend no tiene paginación
  public customersPerPage: Customer[] = [];
  public page: number = 1;
  public pageSize: number = 7;
  public totalItems: number = 0;

  constructor(
    private customerService: CustomersService,
    private authService: AuthService
  ) {
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

        this.customers.forEach((customer: Customer) => {
          customer.tax_condition =
            this.taxConditions.find((tc) => tc.id === customer.id_tax_condition)
              ?.description ?? 'Desconocido';
          customer.province =
            this.provinces.find((p) => p.id === customer.id_province)?.name ??
            'Desconocido';
          customer.bank =
            this.banks.find((b) => b.id_bank === customer.id_bank)?.name ??
            'Desconocido';
          customer.type_person =
            this.types_person.find((tp) => tp.id_type === customer.id_type)
              ?.description ?? 'Desconocido';
        });

        this.loading = false;

        this.onFilterChange('activos');
        this.updatePage(this.order); //Corta el array para mostrar solo los elementos de la página actual
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        //console.log("complete");
      },
    });
  }

  //const sorted = [...this.filteredCustomers].sort((a, b) => a.id - b.id);
  //const sorted = [...this.filteredCustomers].sort((a, b) => a.id - b.id);
  updatePage(order: 'ultimo' | 'abc'): void {
    let sorted;
    if (order === 'abc') {
      sorted = [...this.filteredCustomers].sort((a, b) =>
        a.surname.localeCompare(b.surname)
      );
    } else if (order === 'ultimo') {
      sorted = [...this.filteredCustomers].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    this.order = order;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.customersPerPage = sorted!.slice(startIndex, endIndex);
  }

  onNgbPageChange(p: number) {
    this.page = p;
    this.updatePage(this.order);
  }
  onSortChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.order = input.value as 'ultimo' | 'abc';
    this.updatePage(this.order);
  }
  onFilterChange(filter: string) {
    /*console.log(event);
    const input = event?.target as HTMLInputElement;
    console.log(input);*/

    if (filter === 'activos')
      this.filteredCustomers = this.customers.filter(
        (customer) => customer.active === true
      );
    else if (filter === 'baja')
      this.filteredCustomers = this.customers.filter(
        (customer) => customer.active === false
      );
    else if (filter === 'todos') this.filteredCustomers = [...this.customers];

    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage(this.order);
    return;
  }

  onSearch(event: Event) {
    const normalize = (s = '') =>
      s
        .normalize('NFD') // separa acentos
        .replace(/[\u0300-\u036f]/g, '') // quita acentos
        .toLowerCase()
        .replace(/\s+/g, ' ') // colapsa espacios
        .trim();
    const input = event.target as HTMLInputElement;
    const search = input.value.toLowerCase();
    const q = normalize(search);
    if (!q) {
      this.filteredCustomers = this.customers.slice();
    } else {
      const tokens = q.split(' ');
      this.filteredCustomers = this.customers.filter((c: Customer) => {
        const haystack = normalize(`${c.name ?? ''} ${c.surname ?? ''}`);
        return tokens.every((t) => haystack.includes(t));
      });
    }

    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage(this.order);
  }

  trackById = (_: number, c: Customer) => c.id;

  onCustomer(customer: Customer | null, isNew: boolean) {
    this.pristine = false;
    this.isNew = isNew;
    if (isNew) this.selectedCustomer = null;
    else this.selectedCustomer = customer;

    const ref = this.modalCustomer.open(CustomerModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    //* Paso los datos al modal
    ref.componentInstance.customer = this.selectedCustomer;
    ref.componentInstance.isNew = this.isNew;
    ref.componentInstance.types_person = this.types_person;
    ref.componentInstance.banks = this.banks;
    ref.componentInstance.provinces = this.provinces;
    ref.componentInstance.taxConditions = this.taxConditions;

    ref.result
      .then((customer) => {
        customer.tax_condition =
          this.taxConditions.find((tc) => tc.id === customer.id_tax_condition)
            ?.description ?? 'Desconocido';
        customer.province =
          this.provinces.find((p) => p.id === customer.id_province)?.name ??
          'Desconocido';
        customer.bank =
          this.banks.find((b) => b.id_bank === customer.id_bank)?.name ??
          'Desconocido';
        customer.type_person =
          this.types_person.find((tp) => tp.id_type === customer.id_type)
            ?.description ?? 'Desconocido';

        const updatedWithFlag = { ...customer, highlight: true };
        const idx = this.customers.findIndex((c) => c.id === customer.id);
        if (idx === -1) {
          this.customers = [updatedWithFlag, ...this.customers];
        } else {
          const customersClone = [...this.customers];
          console.log(customersClone[idx]);
          customersClone[idx] = updatedWithFlag;
          this.customers = customersClone;
        }
        // reemplazo inmutable en customers
        this.filteredCustomers = this.customers;
        this.updatePage(this.order);
      })
      .catch((res) => {
        //console.log(`Dismissed ${this.getDismissReason(res)}`);
      });
  }
}
