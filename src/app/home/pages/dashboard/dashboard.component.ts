import { Component, NgModule, OnInit } from '@angular/core';
import { User } from 'src/app/auth/interfaces/user.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  public user : User | null = null;

  constructor(private authService: AuthService) {

    this.authService.getUser(this.authService.user!.id_user)
      .subscribe(user => {
                this.user = user;
                });
  }
  kpis = [
    { title: 'Total Clientes', value: 120, icon: 'bi-people' },
    { title: 'Activos', value: 98, icon: 'bi-check-circle' },
    { title: 'Inactivos', value: 22, icon: 'bi-x-circle' },
    { title: 'Con DREI', value: 45, icon: 'bi-file-earmark-text' }
  ];

  clientesPorProvincia = [
    { provincia: 'Santa Fe', total: 40 },
    { provincia: 'Buenos Aires', total: 30 },
    { provincia: 'Córdoba', total: 25 },
    { provincia: 'Otras', total: 25 }
  ];

  clientesPorCondicion = [
    { condicion: 'Responsable Inscripto', total: 60 },
    { condicion: 'Monotributo', total: 40 },
    { condicion: 'Exento', total: 20 }
  ];

  ultimosClientes = [
    { nombre: 'Juan', apellido: 'Pérez', created_at: new Date('2025-05-20') },
    { nombre: 'Ana', apellido: 'Gómez', created_at: new Date('2025-05-22') },
    { nombre: 'Luis', apellido: 'Fernández', created_at: new Date('2025-05-30') }
  ];

  // Datos para gráfico de barras (provincias)
  barChartLabels: string[] = ['Santa Fe', 'Buenos Aires', 'Córdoba', 'Otras'];
 barChartData: ChartConfiguration<'bar'>['data'] = {
  labels: ['Santa Fe', 'Buenos Aires', 'Córdoba', 'Otras'],
  datasets: [
    {
      data: [40, 30, 25, 25],
      label: 'Clientes',
      backgroundColor: '#0d6efd'
    }
  ]
};

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // Datos para gráfico de torta (condición fiscal)
  pieChartLabels: string[] = ['Responsable Inscripto', 'Monotributo', 'Exento'];
  pieChartData: ChartConfiguration<'pie'>['data'] = {
  labels: ['Responsable Inscripto', 'Monotributo', 'Exento'],
  datasets: [
    {
      data: [60, 40, 20],
      backgroundColor: ['#198754', '#ffc107', '#dc3545']
    }
  ]
};
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

}
