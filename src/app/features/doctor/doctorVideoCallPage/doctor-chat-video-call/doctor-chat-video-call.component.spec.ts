import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorChatVideoCallComponent } from './doctor-chat-video-call.component';

describe('DoctorChatVideoCallComponent', () => {
  let component: DoctorChatVideoCallComponent;
  let fixture: ComponentFixture<DoctorChatVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorChatVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorChatVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
