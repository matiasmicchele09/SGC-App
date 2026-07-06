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

type ActiveFilter = 'todos' | 'activos' | 'baja';
type TypePersonFilter = 'todos' | 'fisica' | 'juridica';
type TaxConditionFilter = number | 'todos' | 'desconocido';

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
  public activeFilter: ActiveFilter = 'activos';
  public typePersonFilter: TypePersonFilter = 'todos';
  public taxConditionFilter: TaxConditionFilter = 'todos';
  private searchTerm: string = '';
  //* Variables para paginación local. Es decir, mi backend no tiene paginación
  public customersPerPage: Customer[] = [];
  public page: number = 1;
  public pageSize: number = 7;
  public totalItems: number = 0;

  constructor(
    private customerService: CustomersService,
    private authService: AuthService,
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

        this.applyFilters();
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
    this.order = order;
    const sortedCustomers = this.getSortedFilteredCustomers(order);
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.customersPerPage = sortedCustomers.slice(startIndex, endIndex);
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

  onFilterChange(filter: ActiveFilter) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onTypePersonFilterChange(filter: TypePersonFilter) {
    this.typePersonFilter = filter;
    this.applyFilters();
  }

  onTaxConditionFilterChange(event: Event) {
    const input = event.target as HTMLSelectElement;
    this.taxConditionFilter =
      input.value === 'todos' || input.value === 'desconocido'
        ? input.value
        : Number(input.value);
    this.applyFilters();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filteredCustomers = [...this.customers];

    if (this.activeFilter === 'activos') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.active === true,
      );
    } else if (this.activeFilter === 'baja') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.active === false,
      );
    }

    if (this.typePersonFilter === 'fisica') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.id_type === 1,
      );
    } else if (this.typePersonFilter === 'juridica') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.id_type === 2,
      );
    }

    if (this.taxConditionFilter === 'desconocido') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.tax_condition === 'Desconocido',
      );
    } else if (this.taxConditionFilter !== 'todos') {
      filteredCustomers = filteredCustomers.filter(
        (customer) => customer.id_tax_condition === this.taxConditionFilter,
      );
    }

    const searchQuery = this.normalizeSearchText(this.searchTerm);
    if (searchQuery) {
      const tokens = searchQuery.split(' ');
      filteredCustomers = filteredCustomers.filter((customer) => {
        const haystack = this.normalizeSearchText(
          `${customer.name ?? ''} ${customer.surname ?? ''}`,
        );

        return tokens.every((token) => haystack.includes(token));
      });
    }

    this.filteredCustomers = filteredCustomers;
    this.totalItems = this.filteredCustomers.length;
    this.page = 1; // opcional, volver a la primera página
    this.updatePage(this.order);
  }

  private normalizeSearchText(value = ''): string {
    return value
      .normalize('NFD') // separa acentos
      .replace(/[\u0300-\u036f]/g, '') // quita acentos
      .toLowerCase()
      .replace(/\s+/g, ' ') // colapsa espacios
      .trim();
  }

  onExportCsv(): void {
    const customersToExport = this.getSortedFilteredCustomers(this.order);

    if (customersToExport.length === 0) return;

    const headers = [
      'Nro',
      'Nombre/Razon Social',
      'Tipo Persona',
      'CUIT',
      'Clave Fiscal',
      'Banco',
      'Telefono',
      'Email',
      'Condicion Fiscal',
      'Provincia',
      'Ciudad',
      'Direccion',
      'Estado',
      'Fecha Alta',
      'Fecha Baja',
      'Observaciones',
    ];

    const rows = customersToExport.map((customer, index) => [
      index + 1,
      customer.id_type === 1
        ? `${customer.surname}, ${customer.name}`
        : customer.surname,
      customer.type_person,
      customer.cuit,
      customer.tax_key,
      customer.bank,
      customer.phone,
      customer.email,
      customer.tax_condition,
      customer.province,
      customer.city,
      customer.address,
      customer.active ? 'Activo' : 'Baja',
      customer.created_at,
      customer.deactivated_at ?? '',
      customer.observations ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => this.formatCsvValue(value)).join(';'))
      .join('\r\n');

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `clientes-filtrados-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private getSortedFilteredCustomers(order: 'ultimo' | 'abc'): Customer[] {
    if (order === 'abc') {
      return [...this.filteredCustomers].sort((firstCustomer, secondCustomer) =>
        firstCustomer.surname.localeCompare(secondCustomer.surname),
      );
    }

    return [...this.filteredCustomers].sort(
      (firstCustomer, secondCustomer) =>
        new Date(secondCustomer.created_at).getTime() -
        new Date(firstCustomer.created_at).getTime(),
    );
  }

  private formatCsvValue(value: unknown): string {
    if (value === null || value === undefined) return '';

    const text = String(value).replace(/"/g, '""');

    if (/[";\r\n]/.test(text)) return `"${text}"`;

    return text;
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
        this.applyFilters();
      })
      .catch((res) => {
        //console.log(`Dismissed ${this.getDismissReason(res)}`);
      });
  }
}
