import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPaiementComponent } from './confirmation-paiement.component';

describe('ConfirmationPaiementComponent', () => {
  let component: ConfirmationPaiementComponent;
  let fixture: ComponentFixture<ConfirmationPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
