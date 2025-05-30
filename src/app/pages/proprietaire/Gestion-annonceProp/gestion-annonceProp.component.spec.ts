import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionAnnoncePropComponent } from './gestion-annonceProp.component';



describe('GestionAnnoncePropComponent', () => {
  let component: GestionAnnoncePropComponent;
  let fixture: ComponentFixture<GestionAnnoncePropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionAnnoncePropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionAnnoncePropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
