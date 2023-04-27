import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { setNotifications } from 'src/app/store/comments/comments.actions';
import { getNotifications } from 'src/app/store/comments/comments.selector';
import { toggleAuth, toggleNoties } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getNotiesOpen, getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { CommentNotification } from 'src/app/types/comment';
import { Story } from 'src/app/types/story';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
	isLoggedIn: Observable<boolean>;
	userId: number;
	noties: Array<CommentNotification>;
	stories: Array<Story>;
	notiesOpen: boolean = false;
	constructor(
		private storageService: StorageService,
		private profileService: ProfileService,
		public router: Router,
		private store: Store,
		private notificationService: NotificationService,
		private dialog: MatDialog
	) {
		this.isLoggedIn = this.store.select(getAuthState);
		this.userId = 0;
		this.noties = [];
		this.stories = [];


	}

	buttonRoutes = {
		profile: '/profile',
		explore: '/explore',
		userStories: '/user-stories'
	}

	isRouteActive(route: string): boolean {
		return this.router.url.includes(route)
	  }

	ngAfterViewInit(): void {

		this.isLoggedIn.subscribe((res) => {
			if (res) {
			this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
			//Get initial notifications
			this.notificationService
				.getUserNotifications(this.userId)
				.subscribe((noties) => {
					this.store.dispatch(
						setNotifications({ notifications: noties ? noties : [] })
					);
				});

			// Get new notifications every 30 seconds
			// if (res) {
				setInterval(() => {
					this.notificationService
						.getUserNotifications(this.userId)
						.subscribe((noties) => {
							this.store.dispatch(
								setNotifications({ notifications: noties ? noties : [] })
							);
						});
				}, 15000);
			}

		});
	}

	ngOnInit(): void {

		this.store.select(getNotiesOpen).subscribe((res) => {
			this.notiesOpen = res;
		});
		this.store.select(getUserId).subscribe((res) => {
			this.userId = res;
		});

		this.store.select(getNotifications).subscribe((res) => {
			this.noties = res;
		});
	}

	goToAddStory() {
		this.router.navigateByUrl('addStory');
	}

	goToLogin() {
		this.router.navigateByUrl('/login');
	}

	goToSignup() {
		this.router.navigateByUrl('/signup');
	}

	goToUserStories() {
		this.router.navigateByUrl('/user-stories');
	}

	goToProfile() {
		this.router.navigateByUrl('/profile');
	}

	goToExplore() {
		this.router.navigateByUrl('/explore');
	}

	reloadWhenSearch() {
		
	}

	showNoties(): void {
		this.store.dispatch(
			toggleNoties({ open: !this.notiesOpen })
		);

	}

	showSearch() {
		const dialogRef = this.dialog.open(SearchModalComponent, {
			data: {},
			width: '95%',
			height: '400px',
			// panelClass: 'top-position-modal'
		});

		dialogRef.componentInstance.onCancel.subscribe(() => {
			dialogRef.close();

		});

		dialogRef.componentInstance.onSearchEvent.subscribe((searchTerm: string) => {
			dialogRef.close();
			// location.href = location.href;
			// location.reload();
			// window.location.reload();

		});

	}


	//Remove token and user profile from session/local storage. Reload page
	signout() {
		this.storageService.signout();
		this.profileService.removeProfile();
		this.store.dispatch(toggleAuth({ status: false }));
		this.router.navigateByUrl('/login');
	}
}


//

// // Modal for notifications
// @Component({
// 	selector: 'app-stories-modal',
// 	template: `
// 	<div *ngIf="data.stories?.length > 0" class="modal-wrapper">
// 	  <h2>You have comments on these stories:</h2>
// 	  <div fxLayout="row wrap" fxLayoutAlign="space-between center">
// 		<button mat-flat-button class="story-card" *ngFor="let story of data.stories" (click)="onStoryClick(story.storyId)">
// 		  <div class="story-name">{{ story.title }}<span class="material-icons">arrow_right</span></div>
// 		</button>
// 	  </div>
// 	</div>
// 	<div *ngIf="!data.stories" class="modal-wrapper">
// 	  <h2>All caught up!</h2>
// 	</div>
// 	`,
// 	`]
// })
// export class StoriesModalComponent {
// 	constructor(private dialogRef: MatDialogRef<StoriesModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
// 	}

// 	onStoryClick(storyId: number): void {
// 		this.dialogRef.close(storyId);
// 	}
// }