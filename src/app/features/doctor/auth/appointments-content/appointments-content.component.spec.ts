import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsContentComponent } from './appointments-content.component';

describe('AppointmentsContentComponent', () => {
  let component: AppointmentsContentComponent;
  let fixture: ComponentFixture<AppointmentsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
