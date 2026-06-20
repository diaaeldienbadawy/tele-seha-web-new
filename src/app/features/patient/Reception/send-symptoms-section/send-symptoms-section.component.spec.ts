import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSymptomsSectionComponent } from './send-symptoms-section.component';

describe('SendSymptomsSectionComponent', () => {
  let component: SendSymptomsSectionComponent;
  let fixture: ComponentFixture<SendSymptomsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendSymptomsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendSymptomsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
