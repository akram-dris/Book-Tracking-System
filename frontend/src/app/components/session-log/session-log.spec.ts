import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionLog } from './session-log';

describe('SessionLog', () => {
  let component: SessionLog;
  let fixture: ComponentFixture<SessionLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
