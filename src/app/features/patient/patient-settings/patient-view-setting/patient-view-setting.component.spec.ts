import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewSettingComponent } from './patient-view-setting.component';

describe('PatientViewSettingComponent', () => {
  let component: PatientViewSettingComponent;
  let fixture: ComponentFixture<PatientViewSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientViewSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientViewSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
