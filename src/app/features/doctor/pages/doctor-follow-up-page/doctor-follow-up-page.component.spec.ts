import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFollowUpPageComponent } from './doctor-follow-up-page.component';

describe('DoctorFollowUpPageComponent', () => {
  let component: DoctorFollowUpPageComponent;
  let fixture: ComponentFixture<DoctorFollowUpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFollowUpPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFollowUpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
