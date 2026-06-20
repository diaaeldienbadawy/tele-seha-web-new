import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAboutYouComponent } from './info-about-you.component';

describe('InfoAboutYouComponent', () => {
  let component: InfoAboutYouComponent;
  let fixture: ComponentFixture<InfoAboutYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAboutYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoAboutYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
