import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorViewSettingComponent } from './doctor-view-setting.component';

describe('DoctorViewSettingComponent', () => {
  let component: DoctorViewSettingComponent;
  let fixture: ComponentFixture<DoctorViewSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorViewSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorViewSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
