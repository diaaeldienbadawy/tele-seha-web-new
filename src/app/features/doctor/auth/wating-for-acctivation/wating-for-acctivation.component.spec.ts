import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatingForAcctivationComponent } from './wating-for-acctivation.component';

describe('WatingForAcctivationComponent', () => {
  let component: WatingForAcctivationComponent;
  let fixture: ComponentFixture<WatingForAcctivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatingForAcctivationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatingForAcctivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
