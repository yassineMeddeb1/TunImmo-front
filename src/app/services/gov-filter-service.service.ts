import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GovFilterServiceService {
  constructor() { }
  private selectedCity = new BehaviorSubject<{name: string, id: number} | null>(null);
  selectedCity$ = this.selectedCity.asObservable();

  setSelectedCity(city: {name: string, id: number}) {
    this.selectedCity.next(city);
  }
}