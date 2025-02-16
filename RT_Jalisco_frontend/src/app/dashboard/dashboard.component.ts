import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EstadisticasService } from '../services/estadisticas.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Importar CommonModule
import { Chart } from 'chart.js/auto';  // Importar Chart.js

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule]  // Añadir CommonModule aquí
})
export class DashboardComponent implements OnInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  // Filtros
  yearStart: number = 2020;
  monthStart: number = 1;
  yearEnd: number = 2022;
  monthEnd: number = 12;
  transporte: string = 'all'; // Este valor será 'all' o uno de los transportes dinámicos

  // Datos para mostrar en el dashboard
  ingresosPasaje: number = 0;
  kilometrosRecorridos: number = 0;
  longitudServicio: number = 0;
  pasajerosTransportados: number = 0;
  unidadesOperacion: number = 0;

  // Lista de transportes para el filtro
  transportes: string[] = ['all'];  // Iniciar con 'all' como opción predeterminada

  // Datos para los gráficos
  estadisticas: any[] = [];
  lineChart: any;
  barChart: any;

  constructor(private estadisticasService: EstadisticasService) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.estadisticasService.getStatistics(this.yearStart, this.monthStart, this.yearEnd, this.monthEnd, this.transporte)
      .subscribe({
        next: (data) => {
          // Guardar los datos recibidos
          this.estadisticas = data;

          // Calcular las estadísticas agregadas
          this.ingresosPasaje = data.reduce((acc, item) => acc + item.ingresosPasaje, 0);
          this.kilometrosRecorridos = data.reduce((acc, item) => acc + item.kilometrosRecorridos, 0);
          this.longitudServicio = data.reduce((acc, item) => acc + item.longitudServicio, 0);
          this.pasajerosTransportados = data.reduce((acc, item) => acc + item.pasajerosTransportados, 0);
          this.unidadesOperacion = data.reduce((acc, item) => acc + item.unidadesOperacion, 0);

          // Llenar la lista de transportes disponibles, incluyendo 'all'
          this.transportes = ['all', ...new Set(data.map(item => item.transporte))];

          // Llamar a los métodos para generar los gráficos
          this.generarLineChart();
          this.generarBarChart();
        },
        error: (err) => {
          console.error('Error al cargar las estadísticas', err);
        }
      });
  }

  // Método para manejar los cambios en los filtros
  onFilterChange(): void {
    this.loadStatistics();  // Recargar las estadísticas y gráficos con el nuevo filtro
  }

  // Generar la gráfica de línea
  generarLineChart(): void {
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    const labels = this.estadisticas.map(e => `${e.año}-${e.mes}`);
    const ingresos = this.estadisticas.map(e => e.ingresosPasaje);
    const pasajeros = this.estadisticas.map(e => e.pasajerosTransportados);

    if (this.lineChart) this.lineChart.destroy(); // Si ya existe un gráfico, destruirlo

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

  // Generar la gráfica de barras
  generarBarChart(): void {
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    const transportes = this.transportes;  // Usamos los transportes cargados dinámicamente
    const ingresosPorTransporte = transportes.map(t =>
      this.estadisticas.filter(e => e.transporte === t).reduce((sum, e) => sum + e.ingresosPasaje, 0)
    );

    if (this.barChart) this.barChart.destroy(); // Si ya existe un gráfico, destruirlo

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
}