import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatientAllResentComponent } from './view-patient-all-resent.component';

describe('ViewPatientAllResentComponent', () => {
  let component: ViewPatientAllResentComponent;
  let fixture: ComponentFixture<ViewPatientAllResentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPatientAllResentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPatientAllResentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
