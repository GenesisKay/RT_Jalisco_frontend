import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EstadisticasService } from '../services/estadisticas.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  @ViewChild('stackedBarChartCanvas') stackedBarChartCanvas!: ElementRef;
  @ViewChild('areaChartCanvas') areaChartCanvas!: ElementRef;

  // Declarar las nuevas propiedades para los gráficos
  stackedBarChart: any;
  areaChart: any;

  // Filtros
  yearStart: number = 2020;
  monthStart: number = 1;
  yearEnd: number = 2022;
  monthEnd: number = 12;
  transporte: string = 'all';

  // Datos para mostrar en el dashboard
  ingresosPasaje: number = 0;
  kilometrosRecorridos: number = 0;
  longitudServicio: number = 0;
  pasajerosTransportados: number = 0;
  unidadesOperacion: number = 0;

  transportes: string[] = ['all'];

  estadisticas: any[] = [];
  lineChart: any;
  barChart: any;
  pieChart: any;

  constructor(private estadisticasService: EstadisticasService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.estadisticasService.getStatistics(this.yearStart, this.monthStart, this.yearEnd, this.monthEnd, this.transporte)
      .subscribe({
        next: (data) => {
          this.estadisticas = data;
          this.ingresosPasaje = data.reduce((acc, item) => acc + item.ingresosPasaje, 0);
          this.kilometrosRecorridos = data.reduce((acc, item) => acc + item.kilometrosRecorridos, 0);
          this.longitudServicio = data.reduce((acc, item) => acc + item.longitudServicio, 0);
          this.pasajerosTransportados = data.reduce((acc, item) => acc + item.pasajerosTransportados, 0);
          this.unidadesOperacion = data.reduce((acc, item) => acc + item.unidadesOperacion, 0);
          this.transportes = ['all', ...new Set(data.map(item => item.transporte))];
          this.generarLineChart();
          this.generarBarChart();
          this.generarPieChart();
          this.generarStackedBarChart(); // Cargar el gráfico de barras apiladas
          this.generarAreaChart(); // Cargar el gráfico de área
        },
        error: (err) => console.error('Error al cargar las estadísticas', err)
      });
  }

  onFilterChange(): void {
    this.loadStatistics();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método para generar la gráfica de línea
  generarLineChart(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    const labels = this.estadisticas.map(e => `${e.año}-${e.mes}`);
    const ingresos = this.estadisticas.map(e => e.ingresosPasaje);
    const pasajeros = this.estadisticas.map(e => e.pasajerosTransportados);

    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos por Pasaje',
            data: ingresos,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.5)',
            fill: true
          },
          {
            label: 'Pasajeros Transportados',
            data: pasajeros,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            fill: true
          }
        ]
      }
    });
  }

  // Método para generar la gráfica de barras
  generarBarChart(): void {
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    const transportes = this.transportes;
    const ingresosPorTransporte = transportes.map(t =>
      this.estadisticas.filter(e => e.transporte === t).reduce((sum, e) => sum + e.ingresosPasaje, 0)
    );

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: transportes,
        datasets: [
          {
            label: 'Ingresos por Transporte',
            data: ingresosPorTransporte,
            backgroundColor: 'green'
          }
        ]
      }
    });
  }

  // Método para generar la gráfica de pastel
  generarPieChart(): void {
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    const transportes = this.transportes;
    const ingresosPorTransporte = transportes.map(t =>
      this.estadisticas.filter(e => e.transporte === t).reduce((sum, e) => sum + e.ingresosPasaje, 0)
    );

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: transportes,
        datasets: [{
          data: ingresosPorTransporte,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          hoverBackgroundColor: ['#FF4377', '#2E7BB9', '#FFB732', '#3DAFAA'],
        }]
      }
    });
  }

  // Método para generar el gráfico de barras apiladas
  generarStackedBarChart(): void {
    const ctx = this.stackedBarChartCanvas.nativeElement.getContext('2d');
    const transportes = this.transportes;
    const ingresosPorTransporte = transportes.map(t =>
      this.estadisticas.filter(e => e.transporte === t).reduce((sum, e) => sum + e.ingresosPasaje, 0)
    );
    const pasajerosPorTransporte = transportes.map(t =>
      this.estadisticas.filter(e => e.transporte === t).reduce((sum, e) => sum + e.pasajerosTransportados, 0)
    );

    if (this.stackedBarChart) this.stackedBarChart.destroy();

    this.stackedBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: transportes,
        datasets: [
          {
            label: 'Ingresos por Transporte',
            data: ingresosPorTransporte,
            backgroundColor: 'green',
          },
          {
            label: 'Pasajeros Transportados',
            data: pasajerosPorTransporte,
            backgroundColor: 'blue',
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    });
  }

  // Método para generar el gráfico de área
  generarAreaChart(): void {
    const ctx = this.areaChartCanvas.nativeElement.getContext('2d');
    const labels = this.estadisticas.map(e => `${e.año}-${e.mes}`);
    const longitudServicio = this.estadisticas.map(e => e.longitudServicio);

    if (this.areaChart) this.areaChart.destroy();

    this.areaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Longitud de Servicio',
          data: longitudServicio,
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
        }]
      }
    });
  }
}