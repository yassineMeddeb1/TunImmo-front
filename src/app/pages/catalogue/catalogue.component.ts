import { Component } from '@angular/core';

import { topOfferData } from './data';
import { topOffer } from './rent.model';
@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.css'
})
export class CatalogueComponent {

  breadCrumbItems!: Array<{}>;
  topOfferData!: topOffer[];
  topOfferDatas!: topOffer[];
  longitude = 20.728218;
  latitude = 52.128973;
  dataCount: any;
  checkedVal: any[] = [];

  // Slider values
  minValue: number = 1100;
  maxValue: number = 3000;

  // Sort fields
  sortField: any;
  sortBy: any;

  constructor() { }

  ngOnInit(): void {
    // BreadCrumb
    this.breadCrumbItems = [
      { label: 'Home', link: '' },
      { label: 'Property for rent', active: true }
    ];

    // Fetch data
    this._fetchData();
  }

  // Fetch data function
  private _fetchData() {
    this.dataCount = topOfferData.length;
    this.topOfferData = topOfferData;
    this.topOfferDatas = [...this.topOfferData];
  }

  // Filter by price
  filterByPrice(): void {
    this.topOfferDatas = this.topOfferData.filter((data: any) => {
      const price = parseInt(data.price.replace(/,/g, ''), 10);
      return price >= this.minValue && price <= this.maxValue;
    });
    this.dataCount = this.topOfferDatas.length;
  }

  // Location filter
  LocationSearch() {
    const location = (document.getElementById('location') as HTMLInputElement).value;
    this.topOfferDatas = this.topOfferData.filter((data: any) => data.location === location);
    this.dataCount = this.topOfferDatas.length;
  }

  // District filter
  DistrictSearch() {
    const district = (document.getElementById('district') as HTMLInputElement).value;
    this.topOfferDatas = this.topOfferData.filter((data: any) => data.district === district);
    this.dataCount = this.topOfferDatas.length;
  }

  // Property type filter
  changeProperty(e: any, type: string) {
    if (e.target.checked) {
      this.checkedVal.push(type);
    } else {
      const index = this.checkedVal.indexOf(type);
      if (index > -1) {
        this.checkedVal.splice(index, 1);
      }
    }
    this.topOfferDatas = this.checkedVal.length
      ? this.topOfferData.filter((data: any) => this.checkedVal.includes(data.property))
      : this.topOfferData;
    this.dataCount = this.topOfferDatas.length;
  }

  // Bedrooms filter
  bedrooms(value: any) {
    this.topOfferDatas = this.topOfferData.filter((data: any) => data.bad >= value);
    this.dataCount = this.topOfferDatas.length;
  }

  // Bathrooms filter
  bathrooms(value: any) {
    this.topOfferDatas = this.topOfferData.filter((data: any) => data.bath === value);
    this.dataCount = this.topOfferDatas.length;
  }

  // Square metres filter
  metresSearch() {
    const minMeters = parseInt((document.getElementById('minValue') as HTMLInputElement).value, 10);
    const maxMeters = parseInt((document.getElementById('maxValue') as HTMLInputElement).value, 10);
    this.topOfferDatas = this.topOfferData.filter((data: any) => data.metres >= minMeters && data.metres <= maxMeters);
    this.dataCount = this.topOfferDatas.length;
  }

  // Sort filter
  SortFilter() {
    const sortField = (document.getElementById('sortby') as HTMLInputElement).value;
    if (sortField.startsWith('A')) {
      this.sortBy = 'asc';
      this.sortField = sortField.slice(1);
    } else if (sortField.startsWith('D')) {
      this.sortBy = 'desc';
      this.sortField = sortField.slice(1);
    }
  }
}