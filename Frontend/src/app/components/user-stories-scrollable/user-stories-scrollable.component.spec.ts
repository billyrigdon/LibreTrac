import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoriesScrollableComponent } from './user-stories-scrollable.component';

describe('UserStoriesScrollableComponent', () => {
  let component: UserStoriesScrollableComponent;
  let fixture: ComponentFixture<UserStoriesScrollableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStoriesScrollableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStoriesScrollableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
