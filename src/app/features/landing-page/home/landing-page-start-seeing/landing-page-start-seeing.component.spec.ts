import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageStartSeeingComponent } from './landing-page-start-seeing.component';

describe('LandingPageStartSeeingComponent', () => {
  let component: LandingPageStartSeeingComponent;
  let fixture: ComponentFixture<LandingPageStartSeeingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageStartSeeingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageStartSeeingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
