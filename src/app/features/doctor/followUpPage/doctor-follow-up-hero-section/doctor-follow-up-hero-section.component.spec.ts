import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFollowUpHeroSectionComponent } from './doctor-follow-up-hero-section.component';

describe('DoctorFollowUpHeroSectionComponent', () => {
  let component: DoctorFollowUpHeroSectionComponent;
  let fixture: ComponentFixture<DoctorFollowUpHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFollowUpHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFollowUpHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
