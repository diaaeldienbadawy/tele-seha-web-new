import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorUpcomingFollowUpSectionComponent } from './doctor-upcoming-follow-up-section.component';

describe('DoctorUpcomingFollowUpSectionComponent', () => {
  let component: DoctorUpcomingFollowUpSectionComponent;
  let fixture: ComponentFixture<DoctorUpcomingFollowUpSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorUpcomingFollowUpSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorUpcomingFollowUpSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
