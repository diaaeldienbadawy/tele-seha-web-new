import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicMedicalHistoryComponent } from './basic-medical-history.component';

describe('BasicMedicalHistoryComponent', () => {
  let component: BasicMedicalHistoryComponent;
  let fixture: ComponentFixture<BasicMedicalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicMedicalHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicMedicalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
