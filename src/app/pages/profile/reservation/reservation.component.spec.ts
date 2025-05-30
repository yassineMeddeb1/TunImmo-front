import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeReservationComponent } from './reservation.component'

describe('ReservationComponent', () => {
  let component: ListeReservationComponent;
  let fixture: ComponentFixture<ListeReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
