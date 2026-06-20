import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSessionComponent } from './booking-session.component';

describe('BookingSessionComponent', () => {
  let component: BookingSessionComponent;
  let fixture: ComponentFixture<BookingSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
