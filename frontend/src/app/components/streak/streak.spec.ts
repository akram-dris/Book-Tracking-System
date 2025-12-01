import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Streak } from './streak';

describe('Streak', () => {
  let component: Streak;
  let fixture: ComponentFixture<Streak>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Streak]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Streak);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
