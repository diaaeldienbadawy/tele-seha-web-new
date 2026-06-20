import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorHeroSectionHomePageComponent } from './doctor-hero-section-home-page.component';

describe('DoctorHeroSectionHomePageComponent', () => {
  let component: DoctorHeroSectionHomePageComponent;
  let fixture: ComponentFixture<DoctorHeroSectionHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorHeroSectionHomePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorHeroSectionHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
