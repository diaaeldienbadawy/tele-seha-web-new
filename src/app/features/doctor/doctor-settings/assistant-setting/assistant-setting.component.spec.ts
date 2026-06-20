import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantSettingComponent } from './assistant-setting.component';

describe('AssistantSettingComponent', () => {
  let component: AssistantSettingComponent;
  let fixture: ComponentFixture<AssistantSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
