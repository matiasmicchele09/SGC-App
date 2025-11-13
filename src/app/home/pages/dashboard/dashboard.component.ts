import { Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Customer } from '../../interfaces/customers.interface';
import { Tax_Condition } from '../../interfaces/tax_conditions';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public user: User | null = null;
  public customers: Customer[] = [];
  public tax_conditions: Tax_Condition[] = [];
  public kpis: { title: string; value: number; icon: string; color: string }[] =
    [];
  public clientesPorCiudad: { ciudad: string; total: number }[] = [];
  public condionesFiscales: { condicion: string; total: number }[] = [];
  public ultimosClientes: {
    nombre: string;
    apellido: string;
    created_at: Date;
  }[] = [];

  // Datos del gráfico de barras por Ciudad
  public barChartCiudad: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Clientes por ciudad',
        backgroundColor: '#4dc853',
      },
    ],
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Cambia el eje de las etiquetas a horizontal
    plugins: {
      legend: { display: false },
    },
  };
  // Datos del gráfico de barras por Cond. Fiscal
  public barChartCondFiscal: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Clientes por Condición Fiscal',
        backgroundColor: '#4dc853',
      },
    ],
  };

  public barChartCondFiscalOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Cambia el eje de las etiquetas a horizontal
    plugins: {
      legend: { display: false },
    },
  };

  constructor(
    private authService: AuthService,
    private customerService: CustomersService
  ) {}

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getUser(this.authService.user!.id_user),
      customers: this.customerService.getCustomers(
        this.authService.user!.id_user
      ),
      tax_conditions: this.customerService.getTaxConditions(),
    }).subscribe({
      next: ({ user, customers, tax_conditions }) => {
        this.user = user;
        this.customers = customers;
        this.tax_conditions = tax_conditions;
        // console.log(tax_conditions);
        // console.log('User:', this.user);
        // console.log('Customers:', this.customers);
        const total = customers.length;
        const activos = customers.filter((c) => c.active).length;
        const inactivos = customers.filter((c) => !c.active).length;
        const conDREI = customers.filter((c) => c.hasDREI).length;

        /* KPIs */
        this.kpis = [
          {
            title: 'Total Clientes',
            value: total,
            icon: 'bi-people',
            color: 'text-primary',
          },
          {
            title: 'Activos',
            value: activos,
            icon: 'bi-check-circle',
            color: 'text-success',
          },
          {
            title: 'Inactivos',
            value: inactivos,
            icon: 'bi-x-circle',
            color: 'text-danger',
          },
          {
            title: 'Con DREI',
            value: conDREI,
            icon: 'bi-file-earmark-text',
            color: 'text-secondary',
          },
        ];

        /* Graficos */
        this.clientesPorCiudad = Object.entries(
          this.customers.reduce((acc, cliente) => {
            const ciudad = cliente.city;
            acc[ciudad] = (acc[ciudad] || 0) + 1;
            return acc;
          }, {} as { [ciudad: string]: number }) // Asegura tipado correcto
        ).map(([ciudad, total]) => ({ ciudad, total }));

        this.barChartCiudad.labels = this.clientesPorCiudad.map(
          (c) => c.ciudad
        );
        this.barChartCiudad.datasets[0].data = this.clientesPorCiudad.map(
          (c) => c.total
        );

        this.condionesFiscales = this.customers.reduce((acc, cliente) => {
          const condicion = this.tax_conditions.filter(
            (tc) => tc.id === cliente.id_tax_condition
          );
          const descripcion =
            condicion.length > 0 ? condicion[0].description : 'Sin Condición';
          if (!acc.some((c) => c.condicion === descripcion)) {
            acc.push({ condicion: descripcion, total: 0 });
          }
          acc.find((c) => c.condicion === descripcion)!.total++;
          return acc;
        }, [] as { condicion: string; total: number }[]);

        this.barChartCondFiscal.labels = this.condionesFiscales.map(
          (c) => c.condicion
        );
        this.barChartCondFiscal.datasets[0].data = this.condionesFiscales.map(
          (c) => c.total
        );

        /* Últimos Clientes */
        this.ultimosClientes = this.customers
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5)
          .map((cliente) => ({
            nombre: cliente.name,
            apellido: cliente.surname,
            created_at: new Date(cliente.created_at),
          }));
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  // ultimosClientes = [
  //   { nombre: 'Juan', apellido: 'Pérez', created_at: new Date('2025-05-20') },
  //   { nombre: 'Ana', apellido: 'Gómez', created_at: new Date('2025-05-22') },
  //   { nombre: 'Luis', apellido: 'Fernández', created_at: new Date('2025-05-30') }
  // ];
}
