import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementsAdminComponent } from './paiements-admin.component';

describe('PaiementsAdminComponent', () => {
  let component: PaiementsAdminComponent;
  let fixture: ComponentFixture<PaiementsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaiementsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
