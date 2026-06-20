import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForDoctorComponent } from './for-doctor.component';

describe('ForDoctorComponent', () => {
  let component: ForDoctorComponent;
  let fixture: ComponentFixture<ForDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
