import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageService } from 'src/app/services/storage.service';
import { StoryService } from 'src/app/services/story.service';
import { AppState } from 'src/app/store/app.state';
import { toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { StoryDrug } from 'src/app/types/story';

@Component({
  selector: 'app-user-stories',
  templateUrl: './user-stories.component.html',
  styleUrls: ['./user-stories.component.scss']
})
export class UserStoriesComponent implements OnInit {
  stories: Array<StoryDrug>;

  constructor(private storyService: StoryService, private storageService: StorageService, private router: Router, private store: Store<AppState>) {
    this.stories = [];
  }

  ngOnInit(): void {
    this.store.dispatch(toggleLoading({status: true}));
    if (this.storageService.getToken() && this.storageService.getUser()) {
      if (localStorage.getItem('userProfile')) {
        //Get user fields from user stored in local storage
        let user = JSON.parse(localStorage.getItem('userProfile') || '');
			  const userId = user.userId;

        this.storyService
          .getUserStories(userId)
          .subscribe((res) => {
            this.stories = JSON.parse(res);
            if (!this.stories) {
              this.stories = [];
            }
            for (let i = 0; i < this.stories.length; i++) {
              const storyDate = new Date(this.stories[i].date);
              const formattedDate = storyDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',

              });
              this.stories[i].date = formattedDate;
            }

            this.store.dispatch(toggleLoading({status: false}));
          },
            (err) => {
              this.store.dispatch(toggleLoading({status: false}));
              
            });
      } else {
        this.router.navigateByUrl('/login');
      }
    }
  }
}



      //Get stories using userId from local storage



