import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDetailsDoctorComponent } from './doctor-details-doctor.component';

describe('DoctorDetailsDoctorComponent', () => {
  let component: DoctorDetailsDoctorComponent;
  let fixture: ComponentFixture<DoctorDetailsDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailsDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDetailsDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
