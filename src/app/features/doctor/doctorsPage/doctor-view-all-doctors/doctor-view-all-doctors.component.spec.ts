import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorViewAllDoctorsComponent } from './doctor-view-all-doctors.component';

describe('DoctorViewAllDoctorsComponent', () => {
  let component: DoctorViewAllDoctorsComponent;
  let fixture: ComponentFixture<DoctorViewAllDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorViewAllDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorViewAllDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
