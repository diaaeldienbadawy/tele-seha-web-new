import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTermAndConditionsComponent } from './doctor-term-and-conditions.component';

describe('DoctorTermAndConditionsComponent', () => {
  let component: DoctorTermAndConditionsComponent;
  let fixture: ComponentFixture<DoctorTermAndConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTermAndConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTermAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
