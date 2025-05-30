import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProprietaireDashComponent } from './proprietaire-dash.component';

describe('ProprietaireDashComponent', () => {
  let component: ProprietaireDashComponent;
  let fixture: ComponentFixture<ProprietaireDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProprietaireDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProprietaireDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
