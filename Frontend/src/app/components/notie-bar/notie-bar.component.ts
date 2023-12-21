import {Component, OnInit, HostListener, ElementRef} from '@angular/core';
import {Router} from '@angular/router';

import {Store} from '@ngrx/store';
import {NotificationService} from 'src/app/services/notification.service';
import {AppState} from 'src/app/store/app.state';
import {setNotifications} from 'src/app/store/comments/comments.actions';
import {setNotificationStories, toggleNoties} from 'src/app/store/shared/actions/shared.actions';
import {getSharedState, getUserId} from 'src/app/store/shared/selectors/shared.selector';
import {NotificationStory} from 'src/app/types/story';
import {Platform} from "@angular/cdk/platform";

@Component({
	selector: 'app-notie-bar',
	templateUrl: './notie-bar.component.html',
	styleUrls: ['./notie-bar.component.scss']
})
export class NotieBarComponent implements OnInit {
	noties: NotificationStory[] = [];
	notiesAvaialble = false;
	userId: number = 0;
	bottomMargin: string = '48px';

	constructor(private notificationService: NotificationService, private store: Store<AppState>, private router: Router, private elementRef: ElementRef, private platform: Platform) {
		this.noties = [
			// {
			//   "title": "Story notificaton 1 a really long title",
			//   "storyId": 1,
			//   "commentId": 1,
			//   "content": 'sdfsdkljflskdfjsldkjds',
			//   "notificationId": 1,
			//   "parentCommentId": 1,
			//   "viewed": false
			// },
			// {
			//   "title": "Another really long title for a story hahahahahahahahahahahahah",
			//   "storyId": 2,
			//   "commentId": 1,
			//   "content": 'sdfsdkljflskdfjsldkjds',
			//   "notificationId": 1,
			//   "parentCommentId": 1,
			//   "viewed": false
			// },
			// {
			//   "title": "Story notificaton 3",
			//   "storyId": 3,
			//   "commentId": 1,
			//   "content": 'sdfsdkljflskdfjsldkjds',
			//   "notificationId": 1,
			//   "parentCommentId": 1,
			//   "viewed": false
			// },
			// {
			//   "title": "Story notificaton 1 a really long title",
			//   "storyId": 1,
			//   "commentId": 1,
			//   "content": 'sdfsdkljflskdfjsldkjds',
			//   "notificationId": 1,
			//   "parentCommentId": 1,
			//   "viewed": false
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
			this.store.dispatch(toggleNoties({open: false}));
		}
	}

	goToStory(storyId: number, commentId: number) {
		this.notificationService
			.clearNotifications(this.userId, storyId)
			.subscribe((res) => {
				this.notificationService
					.getUserNotifications(this.userId)
					.subscribe((noties) => {
						this.store.dispatch(
							setNotifications({notifications: noties ? noties : []})
						);
						this.notificationService.getNotificationStories(this.userId).subscribe((stories) => {
							if (stories) {
								let notieArray = [...stories];
								notieArray.forEach((notie) => {
									notie.title = notie.title.length > 18 ? notie.title.slice(0, 18) + '...' : notie.title;
									notie.content = notie.content.length > 12 ? notie.content.slice(0, 12) + '...' : notie.content;
								})
								this.store.dispatch(setNotificationStories({
									notificationStories: notieArray
								}))
							} else {
								this.store.dispatch(setNotificationStories({
									notificationStories: []
								}))
							}
							this.router.navigateByUrl('/story?storyId=' + storyId.toString() + '&commentId=' + commentId.toString());
							this.store.dispatch(toggleNoties({open: false}));

						});
					});
			});
	}

	ngOnInit(): void {
		if (this.platform.IOS && window.matchMedia('(display-mode: standalone)').matches) {
			this.bottomMargin = "64px";
		}
		this.store.select(getSharedState).subscribe((res) => {
			this.userId = res.userId;
			this.noties = res.notificationStories;
		})
	}
}

