import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndCondititonContentComponent } from './terms-and-condititon-content.component';

describe('TermsAndCondititonContentComponent', () => {
  let component: TermsAndCondititonContentComponent;
  let fixture: ComponentFixture<TermsAndCondititonContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndCondititonContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsAndCondititonContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
