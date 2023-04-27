import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { NotificationService } from 'src/app/services/notification.service';
import { AppState } from 'src/app/store/app.state';
import { setNotifications } from 'src/app/store/comments/comments.actions';
import { toggleNoties } from 'src/app/store/shared/actions/shared.actions';
import { getUserId } from 'src/app/store/shared/selectors/shared.selector';

@Component({
  selector: 'app-notie-bar',
  templateUrl: './notie-bar.component.html',
  styleUrls: ['./notie-bar.component.scss']
})
export class NotieBarComponent implements OnInit {
  stories: any[] = [];
  notiesAvaialble = false;
  userId: number = 0;
  constructor(private notificationService: NotificationService, private store: Store<AppState>, private router: Router, private elementRef: ElementRef) {
    this.stories = [
      // {
      //   "title": "Story notificaton 1 a really long title",
      //   "storyId": 1
      // },
      // {
      //   "title": "Another really long title for a story hahahahahahahahahahahahah",
      //   "storyId": 2
      // },
      // {
      //   "title": "Story notificaton 3",
      //   "storyId": 3
      // },
      // {
      //   "title": "Story notificaton 1 a really long title",
      //   "storyId": 1
      // },
      // {
      //   "title": "Another really long title for a story hahahahahahahahahahahahah",
      //   "storyId": 2
      // },
      // {
      //   "title": "Story notificaton 3",
      //   "storyId": 3
      // },
      // {
      //   "title": "Story notificaton 1 a really long title",
      //   "storyId": 1
      // },
      // {
      //   "title": "Another really long title for a story hahahahahahahahahahahahah",
      //   "storyId": 2
      // },
      // {
      //   "title": "Story notificaton 3",
      //   "storyId": 3
      // },
      // {
      //   "title": "Story notificaton 1 a really long title",
      //   "storyId": 1
      // },
      // {
      //   "title": "Another really long title for a story hahahahahahahahahahahahah",
      //   "storyId": 2
      // },
      // {
      //   "title": "Story notificaton 3",
      //   "storyId": 3
      // },
      // {
      //   "title": "Story notificaton 1 a really long title",
      //   "storyId": 1
      // },
      // {
      //   "title": "Another really long title for a story hahahahahahahahahahahahah",
      //   "storyId": 2
      // },
      // {
      //   "title": "Story notificaton 3",
      //   "storyId": 3
      // }
    ]
    // this.stories = this.stories.map((story: any) => ({
    //   ...story,
    //   title: story.title.slice(0, 18) + '...',
    // }));
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const appContainer = document.getElementById('app-container');
    if (appContainer && appContainer.contains(targetElement)) {
      this.store.dispatch(toggleNoties({ open: false }));
    }
  }


  getNotifications(userId: number) {
    this.notificationService
      .getNotificationStories(userId)
      .subscribe((res) => {
        if (res) {
          this.stories = res.map((story: any) => ({
            ...story,
            title: story.title.slice(0, 18) + '...',
          }));
        }
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      setNotifications({ notifications: [] })
    );
  }


  goToStory(storyId: number) {
    this.notificationService
      .clearNotifications(this.userId, storyId)
      .subscribe((res) => {
        this.notificationService
				.getUserNotifications(this.userId)
				.subscribe((noties) => {
					this.store.dispatch(
						setNotifications({ notifications: noties ? noties : [] })
					);
				});
      });
    this.router.navigateByUrl('/story?storyId=' + storyId.toString());
    this.store.dispatch(toggleNoties({ open: false }));
  }

  ngOnInit(): void {
    this.userId = JSON.parse(
      localStorage.getItem('userProfile') || ''
    ).userId;
    this.getNotifications(this.userId);

    // this.store.dispatch(
    //   setNotifications({ notifications: [] })
    // );


  }
}
