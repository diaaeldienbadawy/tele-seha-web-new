import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageWhyTeleSehaComponent } from './landing-page-why-tele-seha.component';

describe('LandingPageWhyTeleSehaComponent', () => {
  let component: LandingPageWhyTeleSehaComponent;
  let fixture: ComponentFixture<LandingPageWhyTeleSehaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageWhyTeleSehaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageWhyTeleSehaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
