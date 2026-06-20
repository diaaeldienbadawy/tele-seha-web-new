import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSupportPageComponent } from './doctor-support-page.component';

describe('DoctorSupportPageComponent', () => {
  let component: DoctorSupportPageComponent;
  let fixture: ComponentFixture<DoctorSupportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorSupportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSupportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
