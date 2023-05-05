import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodGraphStoryComponent } from './mood-graph-story.component';

describe('MoodGraphStoryComponent', () => {
  let component: MoodGraphStoryComponent;
  let fixture: ComponentFixture<MoodGraphStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoodGraphStoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoodGraphStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
