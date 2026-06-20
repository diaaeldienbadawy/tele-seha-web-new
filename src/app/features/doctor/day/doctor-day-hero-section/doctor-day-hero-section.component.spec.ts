import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDayHeroSectionComponent } from './doctor-day-hero-section.component';

describe('DoctorDayHeroSectionComponent', () => {
  let component: DoctorDayHeroSectionComponent;
  let fixture: ComponentFixture<DoctorDayHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDayHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDayHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
