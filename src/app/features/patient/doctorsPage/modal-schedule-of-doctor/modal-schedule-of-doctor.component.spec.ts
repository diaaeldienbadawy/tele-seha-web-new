import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalScheduleOfDoctorComponent } from './modal-schedule-of-doctor.component';

describe('ModalScheduleOfDoctorComponent', () => {
  let component: ModalScheduleOfDoctorComponent;
  let fixture: ComponentFixture<ModalScheduleOfDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalScheduleOfDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalScheduleOfDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
