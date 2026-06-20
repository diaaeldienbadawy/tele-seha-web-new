import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonRecurringAppointmentsComponent } from './non-recurring-appointments.component';

describe('NonRecurringAppointmentsComponent', () => {
  let component: NonRecurringAppointmentsComponent;
  let fixture: ComponentFixture<NonRecurringAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonRecurringAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonRecurringAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
