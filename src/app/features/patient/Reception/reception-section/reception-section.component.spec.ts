import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionSectionComponent } from './reception-section.component';

describe('ReceptionSectionComponent', () => {
  let component: ReceptionSectionComponent;
  let fixture: ComponentFixture<ReceptionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
