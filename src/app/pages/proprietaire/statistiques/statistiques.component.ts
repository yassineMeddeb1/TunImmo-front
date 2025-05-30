import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { StatisticsService } from '../../../services/statistics.service';
import { AuthService } from '../../../services/auth.service';
import { ImageService } from '../../../services/image-service.service';

interface RevenueData {
  month: string;
  revenue: number;
}

interface PropertyCategory {
  category: string;
  count: number;
}

interface TopClient {
  id: number;
  name: string;
  initials: string;
  reservations: number;
  avatarColor?: string;
}

interface TopProperty {
  id: number;
  title: string;
  views: number;
  reservations: number;
  images?: string[];
  rating?: number;
}

interface SubscriptionInfo {
  type: string;
  startDate: string;
  endDate: string;
  annoncesRestantes: number;
  annoncesAutorisees: number;
  status: string;
}

interface UpcomingReservation {
  id: number;
  bienTitle: string;
  clientName: string;
  dateDebut: string;
  dateFin: string;
  daysLeft: number;
}

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent implements OnInit, OnDestroy, AfterViewInit {
  // Données principales
  totalBiens = 0;
  reservationsMensuelles = 0;
  reservationsActives = 0;
  tauxOccupation = 0;
  subscriptionInfo: SubscriptionInfo = {
    type: '',
    startDate: '',
    endDate: '',
    annoncesRestantes: 0,
    annoncesAutorisees: 0,
    status: ''
  };
  selectedPeriod = '6m';
  isLoading = true;

  // Données pour les graphiques
  monthlyRevenue: RevenueData[] = [];
  propertyCategories: PropertyCategory[] = [];
  topClients: TopClient[] = [];
  topProperties: TopProperty[] = [];
  upcomingReservations: UpcomingReservation[] = [];

  // Références aux éléments DOM
  @ViewChild('revenueChart') revenueChart!: ElementRef;
  @ViewChild('propertyDistributionChart') propertyDistributionChart!: ElementRef;
  @ViewChild('quotaGaugeChart') quotaGaugeChart!: ElementRef;

  // Couleurs et styles
  private colorPalette = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
  private clientAvatarColors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE'];

  // Souscriptions
  private dataSub!: Subscription;
  private imageSubs: Subscription[] = [];

  constructor(
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createCharts(), 500); // Petit délai pour s'assurer que les éléments sont rendus
  }

  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    this.imageSubs.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    this.dataSub = this.statisticsService.getOwnerDashboardData(userId).subscribe({
      next: (data) => {
        this.processDashboardData(data);
        this.loadPropertyImages();
        this.assignClientColors();
        this.isLoading = false;
        setTimeout(() => this.createCharts(), 100); // Délai pour s'assurer que la vue est mise à jour
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'APPARTEMENT': '#36A2EB',
      'MAISON': '#FF6384',
      'TERRAIN': '#FFCE56',
    };
    return colorMap[category] || '#999';
  }

  getSubscriptionStatusClass(): string {
    switch(this.subscriptionInfo.status) {
      case 'ACTIVE': return 'positive';
      case 'EXPIRED': return 'negative';
      case 'PENDING': return 'neutral';
      default: return '';
    }
  }

  private processDashboardData(data: any): void {
    this.totalBiens = data.totalProperties || 0;
    this.reservationsMensuelles = data.monthlyReservations || 0;
    this.reservationsActives = data.activeReservations || 0;
    this.tauxOccupation = data.occupancyRate || 0;
    
    this.subscriptionInfo = {
      type: data.subscriptionType || '-',
      startDate: data.subscriptionStartDate || '-',
      endDate: data.subscriptionEndDate || '-',
      annoncesRestantes: data.remainingAnnouncements || 0,
      annoncesAutorisees: data.announcementQuota || 0,
      status: data.subscriptionStatus || 'INACTIVE'
    };
    
    this.monthlyRevenue = data.monthlyRevenue || [];
    this.propertyCategories = data.propertyDistribution || [];
    this.topClients = data.topClients || [];
    this.topProperties = data.topProperties || [];
    this.upcomingReservations = data.upcomingReservations || [];
  }

  private loadPropertyImages(): void {
    this.topProperties.forEach(property => {
      const sub = this.imageService.loadImages(property.id).subscribe({
        next: (images) => {
          property.images = images.map(img => this.imageService.getImageUrl(img.idImage!));
          property.rating = this.calculateRandomRating();
        },
        error: (err) => {
          console.error('Error loading images for property', property.id, err);
          property.images = ['assets/default-property.jpg'];
        }
      });
      this.imageSubs.push(sub);
    });
  }

  private assignClientColors(): void {
    this.topClients = this.topClients.map((client, index) => ({
      ...client,
      avatarColor: this.clientAvatarColors[index % this.clientAvatarColors.length]
    }));
  }

  private calculateRandomRating(): number {
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // Entre 3.0 et 5.0
  }

  getRatingStars(rating: number | undefined): string[] {
    if (!rating) return Array(5).fill('bi-star');
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('bi-star-fill');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('bi-star-half');
      } else {
        stars.push('bi-star');
      }
    }

    return stars;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.createCharts();
  }

  createCharts(): void {
    if (this.monthlyRevenue.length) this.createRevenueChart();
    if (this.propertyCategories.length) this.createPropertyDistributionChart();
    this.createQuotaGaugeChart();
  }

  createRevenueChart(): void {
    const element = this.revenueChart?.nativeElement;
    if (!element || !this.monthlyRevenue.length) return;

    d3.select(element).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const x = d3.scaleBand()
      .domain(this.monthlyRevenue.map(d => d.month))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.monthlyRevenue, d => d.revenue) || 0])
      .nice()
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).tickFormat(d => `${d} €`));

    // Barres avec gradient
    const gradientId = 'revenue-gradient';
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#36A2EB');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4BC0C0');

    svg.selectAll('.revenue-bar')
      .data(this.monthlyRevenue)
      .enter()
      .append('rect')
      .attr('class', 'revenue-bar')
      .attr('x', d => x(d.month) || 0)
      .attr('y', d => y(d.revenue))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.revenue))
      .attr('fill', `url(#${gradientId})`)
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());

    // Titres
    svg.append('text')
      .attr('x', width -20)
      .attr('y', height + margin.bottom )
      .attr('text-aligne', 'right')
      .style('font-size', '12px')
      .text('Mois');

    svg.append('text')
    
      .attr('y', -20)
      .attr('x', 0 )
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Revenu (€)');
  }

  createPropertyDistributionChart(): void {
    const element = this.propertyDistributionChart?.nativeElement;
    if (!element || !this.propertyCategories.length) return;

    d3.select(element).selectAll('*').remove();

    const width = element.offsetWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<PropertyCategory>().value(d => d.count);
    const arc = d3.arc<any, d3.PieArcDatum<PropertyCategory>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius - 10);

    const color = d3.scaleOrdinal<string>()
      .domain(this.propertyCategories.map(d => d.category))
      .range(this.colorPalette);

    const arcs = svg.selectAll('.arc')
      .data(pie(this.propertyCategories))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.category))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .on('mouseover', (event, d) => this.showPieTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());

    // Étiquettes avec pourcentage
    arcs.append('text')
      .attr('transform', d => {
        const [x, y] = arc.centroid(d);
        return `translate(${x * 1.4},${y * 1.4})`;
      })
      .attr('text-anchor', 'middle')
      .text(d => {
        const total = d3.sum(this.propertyCategories.map(c => c.count));
        return total > 0 ? `${Math.round(d.data.count / total * 100)}%` : '';
      })
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white');

    // Légende externe
    const legend = svg.selectAll('.legend')
      .data(this.propertyCategories)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const angle = (i * 360 / this.propertyCategories.length) * Math.PI / 180;
        const x = Math.sin(angle) * (radius + 20);
        const y = -Math.cos(angle) * (radius + 20);
        return `translate(${x},${y})`;
      });

    legend.append('circle')
      .attr('r', 5)
      .attr('fill', d => color(d.category));

    legend.append('text')
      .attr('x', 10)
      .attr('dy', '.35em')
      .text(d => d.category)
      .style('font-size', '10px')
      .style('text-anchor', d => {
        const angle = (this.propertyCategories.indexOf(d) * 360 / this.propertyCategories.length);
        return angle > 90 && angle < 270 ? 'end' : 'start';
      });
  }

  createQuotaGaugeChart(): void {
    const element = this.quotaGaugeChart?.nativeElement;
    if (!element) return;

    d3.select(element).selectAll('*').remove();

    const width = element.offsetWidth;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height})`);

    // Arc de fond
    const backgroundArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    svg.append('path')
      .datum({ endAngle: Math.PI / 2 })
      .attr('d', backgroundArc as any)
      .attr('fill', '#f5f5f5');

    // Arc de valeur avec gradient
    const value = this.subscriptionInfo.annoncesAutorisees > 0 
      ? this.subscriptionInfo.annoncesRestantes / this.subscriptionInfo.annoncesAutorisees 
      : 0;

    const valueArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + value * Math.PI);

    const gradientId = 'gauge-gradient';
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4BC0C0');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FF6384');

    svg.append('path')
      .datum({ endAngle: -Math.PI / 2 + value * Math.PI })
      .attr('d', valueArc as any)
      .attr('fill', `url(#${gradientId})`);

    // Aiguille animée
    const needle = svg.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -radius * 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');

    needle.transition()
      .duration(1500)
      .ease(d3.easeElasticOut)
      .attr('transform', `rotate(${-90 + value * 180})`);

    // Texte au centre
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .text(`${this.subscriptionInfo.annoncesRestantes}`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '12px')
      .text('annonces restantes');

    // Zones de couleur
    const zones = [
      { start: -Math.PI/2, end: -Math.PI/6, color: '#FF6384' },
      { start: -Math.PI/6, end: Math.PI/6, color: '#FFCE56' },
      { start: Math.PI/6, end: Math.PI/2, color: '#4BC0C0' }
    ];

    zones.forEach(zone => {
      const zoneArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.65)
        .startAngle(zone.start)
        .endAngle(zone.end);

      svg.append('path')
        .attr('d', zoneArc as any)
        .attr('fill', zone.color);
    });
  }

  private showTooltip(event: MouseEvent, data: RevenueData): void {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'custom-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.2)')
      .style('z-index', '1000');

    tooltip.html(`
      <div style="font-weight: bold; margin-bottom: 4px">${data.month}</div>
      <div>Revenu: <span style="font-weight: bold">${data.revenue} €</span></div>
    `)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY - 40}px`);
  }

  private showPieTooltip(event: MouseEvent, data: d3.PieArcDatum<PropertyCategory>): void {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'custom-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.2)')
      .style('z-index', '1000');

    const total = d3.sum(this.propertyCategories.map(c => c.count));
    const percentage = total > 0 ? Math.round(data.data.count / total * 100) : 0;

    tooltip.html(`
      <div style="font-weight: bold; margin-bottom: 4px">${data.data.category}</div>
      <div>Nombre: <span style="font-weight: bold">${data.data.count}</span></div>
      <div>Pourcentage: <span style="font-weight: bold">${percentage}%</span></div>
    `)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY - 40}px`);
  }

  private hideTooltip(): void {
    d3.selectAll('.custom-tooltip').remove();
  }
}