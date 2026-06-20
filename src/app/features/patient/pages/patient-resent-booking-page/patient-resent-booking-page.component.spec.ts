import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientResentBookingPageComponent } from './patient-resent-booking-page.component';

describe('PatientResentBookingPageComponent', () => {
  let component: PatientResentBookingPageComponent;
  let fixture: ComponentFixture<PatientResentBookingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientResentBookingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientResentBookingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
