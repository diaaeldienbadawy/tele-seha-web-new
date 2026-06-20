import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientChatVideoCallComponent } from './patient-chat-video-call.component';

describe('PatientChatVideoCallComponent', () => {
  let component: PatientChatVideoCallComponent;
  let fixture: ComponentFixture<PatientChatVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientChatVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientChatVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
