import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAllDoctorsPageComponent } from './doctor-all-doctors-page.component';

describe('DoctorAllDoctorsPageComponent', () => {
  let component: DoctorAllDoctorsPageComponent;
  let fixture: ComponentFixture<DoctorAllDoctorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAllDoctorsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAllDoctorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
