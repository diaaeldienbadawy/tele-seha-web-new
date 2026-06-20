import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPagePartnersComponent } from './landing-page-partners.component';

describe('LandingPagePartnersComponent', () => {
  let component: LandingPagePartnersComponent;
  let fixture: ComponentFixture<LandingPagePartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPagePartnersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPagePartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
