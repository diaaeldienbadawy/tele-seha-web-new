import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookFollowUpComponent } from './book-follow-up.component';

describe('BookFollowUpComponent', () => {
  let component: BookFollowUpComponent;
  let fixture: ComponentFixture<BookFollowUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookFollowUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookFollowUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
