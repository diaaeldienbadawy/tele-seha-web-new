import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMeetingVideoCallComponent } from './patient-meeting-video-call.component';

describe('PatientMeetingVideoCallComponent', () => {
  let component: PatientMeetingVideoCallComponent;
  let fixture: ComponentFixture<PatientMeetingVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMeetingVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMeetingVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
