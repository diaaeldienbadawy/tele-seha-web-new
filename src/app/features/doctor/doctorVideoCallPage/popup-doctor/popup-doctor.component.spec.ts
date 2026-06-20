import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDoctorComponent } from './popup-doctor.component';

describe('PopupDoctorComponent', () => {
  let component: PopupDoctorComponent;
  let fixture: ComponentFixture<PopupDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
