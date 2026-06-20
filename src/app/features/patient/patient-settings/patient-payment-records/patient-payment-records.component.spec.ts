import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPaymentRecordsComponent } from './patient-payment-records.component';

describe('PatientPaymentRecordsComponent', () => {
  let component: PatientPaymentRecordsComponent;
  let fixture: ComponentFixture<PatientPaymentRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPaymentRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPaymentRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
