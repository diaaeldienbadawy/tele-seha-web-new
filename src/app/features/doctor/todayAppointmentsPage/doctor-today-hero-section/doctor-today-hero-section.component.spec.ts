import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTodayHeroSectionComponent } from './doctor-today-hero-section.component';

describe('DoctorTodayHeroSectionComponent', () => {
  let component: DoctorTodayHeroSectionComponent;
  let fixture: ComponentFixture<DoctorTodayHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTodayHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTodayHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
