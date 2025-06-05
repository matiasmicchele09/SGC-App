import { Component, NgModule, OnInit } from '@angular/core';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ChartConfiguration } from 'chart.js';
import { Customer } from '../../interfaces/customers.interface';
import { CustomersComponent } from '../customers/customers.component';
import { CustomersService } from '../../services/customers.service';
import { forkJoin } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { Tax_Condition } from '../../interfaces/tax_conditions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public user : User | null = null;
  public customers:Customer[] = [];
  public tax_conditions: Tax_Condition[] = [];
  public kpis: { title: string; value: number; icon: string }[] = [];
  public clientesPorCiudad: { ciudad: string; total: number }[] = [];
  public condionesFiscales: { condicion:string, total: number }[] = []

  // Datos del gráfico de barras por ciudad
  public barChartCiudad: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Clientes por ciudad',
        backgroundColor: '#4dc853'
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // Datos para gráfico de torta (condición fiscal)
  pieChartLabels: string[] = [];
  pieChartData: ChartConfiguration<'pie'>['data'] = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: ['#198754',
        '#ffc107',
        '#dc3545',
        '#0d6efd',
        '#6f42c1',
        '#fd7e14',
        '#20c997',
        '#6610f2',
        '#e83e8c',
        '#17a2b8',
        '#6c757d',
        '#343a40'],

      borderWidth: 1,
      borderColor: '#ffffff',
      hoverBorderColor: '#ffffff'
    }
    ]
  };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };


  constructor(private authService: AuthService,
              private customerService: CustomersService
  ) {

  }
  ngOnInit(): void {

    forkJoin({
      user: this.authService.getUser(this.authService.user!.id_user),
      customers: this.customerService.getCustomers(this.authService.user!.id_user),
      tax_conditions: this.customerService.getTaxConditions()
    }).subscribe({
      next: ({ user, customers, tax_conditions }) => {
        this.user = user;
        this.customers = customers;
        this.tax_conditions = tax_conditions;
        console.log(tax_conditions);
        console.log('User:', this.user);
        console.log('Customers:', this.customers);
        const total = customers.length;
        const activos = customers.filter(c => c.active).length;
        const inactivos = customers.filter(c => !c.active).length;
        const conDREI = customers.filter(c => c.hasDREI).length;
        // const ciudades = customers.reduce((acc, customer) => {
        //   const ciudad = customer.city || 'Sin Ciudad';
        //   if (!acc[ciudad]) {
        //     acc[ciudad] = 0;
        //   }
        //   acc[ciudad]++;
        //   return acc;
        // }, {} as Record<string, number>);
        this.clientesPorCiudad = Object.entries(
          this.customers.reduce((acc, cliente) => {
            const ciudad = cliente.city;
            acc[ciudad] = (acc[ciudad] || 0) + 1;
            return acc;
          }, {} as { [ciudad: string]: number }) // Asegura tipado correcto
        ).map(([ciudad, total]) => ({ ciudad, total }));

        console.log(this.clientesPorCiudad);

        this.barChartCiudad.labels = this.clientesPorCiudad.map(c => c.ciudad);
        this.barChartCiudad.datasets[0].data = this.clientesPorCiudad.map(c => c.total);



        // this.condionesFiscales = Object.entries(
        //   this.customers.reduce((acc, cliente) => {
        //     //console.log(cliente.id_tax_condition);
        //     const id_condicion = cliente.id_tax_condition || 'Sin Condición';
        //     const condicion = cliente.tax_condition
        //     acc[id_condicion] = (acc[id_condicion] || 0) + 1;
        //     return acc;
        //   }, {} as { [id_condicion: string]: number }) // Asegura tipado correcto
        // ).map(([id_condicion, total]) => ({ id_condicion, total }));

        // console.log(this.condionesFiscales);

        // this.pieChartLabels = this.condionesFiscales.map(c => c.condicion);
        // console.log(this.pieChartLabels);

        this.condionesFiscales = this.customers.reduce((acc, cliente) => {
          const condicion = this.tax_conditions.filter(tc => tc.id === cliente.id_tax_condition);
          const descripcion = condicion.length > 0 ? condicion[0].description : 'Sin Condición';
          if (!acc.some(c => c.condicion === descripcion)) {
            acc.push({ condicion: descripcion, total: 0 });
          }
          acc.find(c => c.condicion === descripcion)!.total++;
          return acc;
        }, [] as { condicion: string; total: number }[]);

        console.log(this.condionesFiscales);

        this.pieChartLabels = this.condionesFiscales.map(c => c.condicion);
        console.log(this.pieChartLabels);
        this.pieChartData.labels = this.pieChartLabels;

        this.pieChartData.datasets[0].data = this.condionesFiscales.map(c => c.total);



        this.kpis = [
          { title: 'Total Clientes', value: total, icon: 'bi-people' },
          { title: 'Activos', value: activos, icon: 'bi-check-circle' },
          { title: 'Inactivos', value: inactivos, icon: 'bi-x-circle' },
          { title: 'Con DREI', value: conDREI, icon: 'bi-file-earmark-text' }
        ];

      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }




  ultimosClientes = [
    { nombre: 'Juan', apellido: 'Pérez', created_at: new Date('2025-05-20') },
    { nombre: 'Ana', apellido: 'Gómez', created_at: new Date('2025-05-22') },
    { nombre: 'Luis', apellido: 'Fernández', created_at: new Date('2025-05-30') }
  ];

  // Datos para gráfico de barras (provincias)
  // barChartLabels: string[] = ['Santa Fe', 'Buenos Aires', 'Córdoba', 'Otras'];
  //  barChartData: ChartConfiguration<'bar'>['data'] = {
  // labels: ['Santa Fe', 'Buenos Aires', 'Córdoba', 'Otras'],
  // datasets: [
  //   {
  //     data: [40, 30, 25, 25],
  //     label: 'Clientes',
  //     backgroundColor: '#0d6efd'
  //   }
  // ]
  // };




//  barChartOptions: ChartConfiguration<'bar'>['options'] = {
//   responsive: true,
//   plugins: {
//     legend: { display: true }
//   }
// };




}
