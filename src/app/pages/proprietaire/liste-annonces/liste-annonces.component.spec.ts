import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAnnoncesComponent } from './liste-annonces.component';

describe('ListeAnnoncesComponent', () => {
  let component: ListeAnnoncesComponent;
  let fixture: ComponentFixture<ListeAnnoncesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeAnnoncesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeAnnoncesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
