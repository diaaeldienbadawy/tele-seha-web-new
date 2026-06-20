import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSendPictureVideoCallComponent } from './doctor-send-picture-video-call.component';

describe('DoctorSendPictureVideoCallComponent', () => {
  let component: DoctorSendPictureVideoCallComponent;
  let fixture: ComponentFixture<DoctorSendPictureVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorSendPictureVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSendPictureVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
