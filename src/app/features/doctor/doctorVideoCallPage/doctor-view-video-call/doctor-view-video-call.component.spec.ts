import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorViewVideoCallComponent } from './doctor-view-video-call.component';

describe('DoctorViewVideoCallComponent', () => {
  let component: DoctorViewVideoCallComponent;
  let fixture: ComponentFixture<DoctorViewVideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorViewVideoCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorViewVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
