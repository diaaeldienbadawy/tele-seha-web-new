import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorWeeksAppointmentsHeroSectionComponent } from './doctor-weeks-appointments-hero-section.component';

describe('DoctorWeeksAppointmentsHeroSectionComponent', () => {
  let component: DoctorWeeksAppointmentsHeroSectionComponent;
  let fixture: ComponentFixture<DoctorWeeksAppointmentsHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorWeeksAppointmentsHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorWeeksAppointmentsHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
