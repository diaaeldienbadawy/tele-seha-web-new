import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorVideoCallPageComponent } from './doctor-video-call-page.component';

describe('DoctorVideoCallPageComponent', () => {
  let component: DoctorVideoCallPageComponent;
  let fixture: ComponentFixture<DoctorVideoCallPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorVideoCallPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorVideoCallPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
