import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PatientSendPictureVideoCallComponent } from './patient-send-picture-video-call.component';

describe('PatientSendPictureVideoCallComponent', () => {
  let component: PatientSendPictureVideoCallComponent;
  let fixture: ComponentFixture<PatientSendPictureVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSendPictureVideoCallComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSendPictureVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
