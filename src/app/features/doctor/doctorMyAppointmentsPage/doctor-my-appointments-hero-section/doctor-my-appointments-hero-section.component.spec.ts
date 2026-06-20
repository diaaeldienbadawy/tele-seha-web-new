import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMyAppointmentsHeroSectionComponent } from './doctor-my-appointments-hero-section.component';

describe('DoctorMyAppointmentsHeroSectionComponent', () => {
  let component: DoctorMyAppointmentsHeroSectionComponent;
  let fixture: ComponentFixture<DoctorMyAppointmentsHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMyAppointmentsHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMyAppointmentsHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
