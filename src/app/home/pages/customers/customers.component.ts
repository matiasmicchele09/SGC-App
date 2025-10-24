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

  //* Variables para paginación local. Es decir, mi backend no tiene paginación
  public customersPerPage: Customer[] = [];
  public page: number = 1;
  public pageSize: number = 10;
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

        /*console.log(banks);
        console.log(customers);
        console.log(tax_conditions);
        console.log(provinces);*/

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

        this.updatePage(); //Corta el array para mostrar solo los elementos de la página actual
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
  updatePage(): void {
    const sorted = [...this.filteredCustomers].sort((a, b) =>
      a.surname.localeCompare(b.surname)
    );
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.customersPerPage = sorted.slice(startIndex, endIndex);
  }

  onNgbPageChange(p: number) {
    this.page = p;
    this.updatePage();
  }

  onFilterChange(event: Event) {
    const input = event?.target as HTMLInputElement;

    if (input.value === 'activos')
      this.filteredCustomers = this.customers.filter(
        (customer) => customer.active === true
      );
    else if (input.value === 'baja')
      this.filteredCustomers = this.customers.filter(
        (customer) => customer.active === false
      );
    else if (input.value === 'todos')
      this.filteredCustomers = [...this.customers];

    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage();
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
    this.updatePage();
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
        const idx = this.customers.findIndex((c) => c.id === customer.id);
        if (idx === -1) return;

        // seteo highlight en el objeto NUEVO
        const updatedWithFlag = { ...customer, highlight: true };

        // reemplazo inmutable en customers
        const customersClone = [...this.customers];
        customersClone[idx] = updatedWithFlag;
        this.customers = customersClone;
        this.filteredCustomers = this.customers;
        this.updatePage();
      })
      .catch((res) => {
        //console.log(`Dismissed ${this.getDismissReason(res)}`);
      });
  }
}
