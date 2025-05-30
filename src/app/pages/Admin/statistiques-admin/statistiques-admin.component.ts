import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { Subscription, timer, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

interface KpiConfig {
  title: string;
  icon: string;
  color: string;
  getValue: () => number | string;
  unit?: string;
  trend?: {
    icon: string | (() => string);
    value: () => string | number;
  };
  subtext?: () => string;
}

interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-statistiques-admin',
  templateUrl: './statistiques-admin.component.html',
  styleUrls: ['./statistiques-admin.component.css']
})
export class StatistiquesAdminComponent implements OnInit, OnDestroy {
  isLoading = true;
  stats: any = {};
  today = new Date();
  private refreshSubscription!: Subscription;

  // Configuration des KPI avec typage fort
  kpis: KpiConfig[] = [
    {
      title: 'Utilisateurs',
      icon: 'bi bi-people-fill',
      color: 'primary',
      getValue: () => this.stats.totalUsers || 0,
      trend: {
        icon: 'bi bi-arrow-up',
        value: () => this.stats.userActivity?.newUsers || 0
      }
    },
    {
      title: 'Biens Immobiliers',
      icon: 'bi bi-house-fill',
      color: 'success',
      getValue: () => this.stats.totalProperties || 0,
      trend: {
        icon: 'bi bi-arrow-up',
        value: () => this.stats.activeProperties || 0
      },
      subtext: () => `${this.stats.activeProperties || 0} actifs | ${this.stats.pendingProperties || 0} en attente`
    },
    {
      title: 'Revenus Mensuels',
      icon: 'bi bi-cash-stack',
      color: 'warning',
      getValue: () => this.stats.monthlyRevenue || 0,
      unit: ' TND',
      trend: {
        icon: () => this.stats.monthlyRevenue > 0 ? 'bi bi-arrow-up' : 'bi bi-dash',
        value: () => this.stats.monthlyRevenue > 0 ? '▲' : '—'
      },
      subtext: () => `Annuel: ${this.stats.annualRevenue || 0} TND`
    },
    {
      title: 'Taux de Conversion',
      icon: 'bi bi-graph-up-arrow',
      color: 'info',
      getValue: () => this.stats.conversionRate?.toFixed(2) || '0',
      unit: '%',
      trend: {
        icon: () => (this.stats.conversionRate || 0) > 30 ? 'bi bi-arrow-up' : 'bi bi-arrow-down',
        value: () => (this.stats.conversionRate || 0) > 30 ? '▲' : '▼'
      }
    }
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshSubscription = timer(0, 300000).pipe(
      switchMap(() => this.fetchData())
    ).subscribe(data => {
      this.stats = data;
      console.log(this.stats);
      this.isLoading = false;
      this.today = new Date(); // Pour mettre à jour l'heure aussi
      this.renderCharts();
    });
  
    this.initChartSizes();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  getIconClass(kpi: any): string {
    const icon = kpi?.trend?.icon;
    return typeof icon === 'function' ? icon() : icon;
  }
  
  getTrendValue(kpi: any): string {
    const value = kpi?.trend?.value;
    return typeof value === 'function' ? value() : value;
  }
  
  getSubtext(kpi: any): string {
    const subtext = kpi?.subtext;
    return typeof subtext === 'function' ? subtext() : subtext;
  }
  
  private initChartSizes(): void {
    const chartConfigs = [
      { id: '#property-distribution-chart', width: '100%', height: '300px' },
      { id: '#reservation-status-chart', width: '100%', height: '300px' }
    ];

    chartConfigs.forEach(config => {
      const element = document.querySelector(config.id);
      if (element) {
        element.innerHTML = '';
      }
    });
  }

  fetchData(): Observable<any> {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`http://localhost:9091/api/admin/statistics`,{headers, withCredentials: true});
  }

  renderCharts(): void {
    if (this.stats.propertyDistribution) {
      this.renderPieChart(
        '#property-distribution-chart', 
        Object.entries(this.stats.propertyDistribution).map(([name, value]) => ({ 
          name, 
          value: Number(value) 
        }))
      );
    }

    if (this.stats.reservationStats) {
      this.renderBarChart(
        '#reservation-status-chart',
        [
          { name: 'Confirmées', value: this.stats.reservationStats.confirmed },
          { name: 'En attente', value: this.stats.reservationStats.pending },
          { name: 'Annulées', value: this.stats.reservationStats.cancelled }
        ]
      );
    }
  }

  private renderPieChart(selector: string, data: ChartData[]): void {
    const element = document.querySelector(selector);
    if (!element) return;

    element.innerHTML = '';
    
    const width = 450;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(selector)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const pie = d3.pie<ChartData>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<ChartData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i.toString()))
      .attr('stroke', '#fff')
      .style('stroke-width', '1px')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`${d.data.name}: ${d.data.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d.data.value);

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(-${width/2 - 30},${i * 20 - height/2 + 20})`);

    legend.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d, i) => color(i.toString()));

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => d.name);

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0);
  }

  private renderBarChart(selector: string, data: ChartData[]): void {
    const element = document.querySelector(selector);
    if (!element) return;

    element.innerHTML = '';
    
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = 450 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select(selector)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name) || 0)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', (d, i) => color(i.toString()))
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`${d.name}: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0);
  }
}