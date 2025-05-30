import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiquesAdminComponent } from './statistiques-admin.component';

describe('StatistiquesAdminComponent', () => {
  let component: StatistiquesAdminComponent;
  let fixture: ComponentFixture<StatistiquesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatistiquesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistiquesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
