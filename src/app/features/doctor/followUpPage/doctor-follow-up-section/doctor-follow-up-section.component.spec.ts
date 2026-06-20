import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFollowUpSectionComponent } from './doctor-follow-up-section.component';

describe('DoctorFollowUpSectionComponent', () => {
  let component: DoctorFollowUpSectionComponent;
  let fixture: ComponentFixture<DoctorFollowUpSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFollowUpSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorFollowUpSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
