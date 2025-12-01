import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDetails } from './tag-details';

describe('TagDetails', () => {
  let component: TagDetails;
  let fixture: ComponentFixture<TagDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
