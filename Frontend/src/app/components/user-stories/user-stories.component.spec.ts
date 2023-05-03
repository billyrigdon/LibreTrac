import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoriesComponent } from './user-stories.component';

describe('UserStoriesComponent', () => {
  let component: UserStoriesComponent;
  let fixture: ComponentFixture<UserStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
