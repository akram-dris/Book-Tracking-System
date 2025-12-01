import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreakSidebar } from './streak-sidebar';

describe('StreakSidebar', () => {
  let component: StreakSidebar;
  let fixture: ComponentFixture<StreakSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreakSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreakSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
