import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMeetingVideoCallComponent } from './doctor-meeting-video-call.component';

describe('DoctorMeetingVideoCallComponent', () => {
  let component: DoctorMeetingVideoCallComponent;
  let fixture: ComponentFixture<DoctorMeetingVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMeetingVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMeetingVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
