import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPaymentRecordsComponent } from './doctor-payment-records.component';

describe('DoctorPaymentRecordsComponent', () => {
  let component: DoctorPaymentRecordsComponent;
  let fixture: ComponentFixture<DoctorPaymentRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPaymentRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPaymentRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
