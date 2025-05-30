import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessangesComponent } from './messanges.component';

describe('MessangesComponent', () => {
  let component: MessangesComponent;
  let fixture: ComponentFixture<MessangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessangesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
