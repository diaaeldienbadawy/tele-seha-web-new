import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportContentComponent } from './support-content.component';

describe('SupportContentComponent', () => {
  let component: SupportContentComponent;
  let fixture: ComponentFixture<SupportContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
