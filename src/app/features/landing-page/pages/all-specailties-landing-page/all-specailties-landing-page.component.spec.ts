import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSpecailtiesLandingPageComponent } from './all-specailties-landing-page.component';

describe('AllSpecailtiesLandingPageComponent', () => {
  let component: AllSpecailtiesLandingPageComponent;
  let fixture: ComponentFixture<AllSpecailtiesLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSpecailtiesLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSpecailtiesLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
