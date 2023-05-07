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
import { setNotificationStories, setUserId, toggleAuth, toggleNoties } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getNotiesOpen, getSharedState, getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { CommentNotification } from 'src/app/types/comment';
import { NotificationStory, Story } from 'src/app/types/story';
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
	notificationStories = Array<NotificationStory>();
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

		// this.isLoggedIn.subscribe((res) => {
			// if (res) {
			// this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
			//Get initial notifications
			this.notificationService
				.getUserNotifications(this.userId)
				.subscribe((noties) => {
					this.store.dispatch(
						setNotifications({ notifications: noties ? noties : [] })
					);
					if (noties && noties.length !== this.notificationStories.length) {
						this.getNotifications(this.userId);
					}
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
							if (noties && noties.length !== this.notificationStories.length) {
								this.getNotifications(this.userId);
							}
						});
				}, 15000);
			// }

		// });
	}

	getNotifications(userId: number) {
		this.notificationService
		  .getNotificationStories(userId)
		  .subscribe((res) => {
			if (res) {
				console.log(res);

				let notieArray = [...res];
				notieArray.forEach((notie) => {
					notie.title = notie.title.length > 18 ? notie.title.slice(0, 18) + '...' : notie.title;
					notie.content = notie.content.length > 12 ? notie.content.slice(0, 12) + '...' : notie.content;
				})
			  	this.store.dispatch(setNotificationStories({
					notificationStories: notieArray
			  	})) 
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
		this.store.select(getSharedState).subscribe((state) => {
			this.notificationStories = state.notificationStories
		})
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

		});

	}


	//Remove token and user profile from session/local storage. Reload page
	signout() {
		this.storageService.signout();
		this.profileService.removeProfile();
		this.store.dispatch(setUserId({userId: 0}));
		this.store.dispatch(toggleAuth({ status: false }));
		this.router.navigateByUrl('/login');
		window.location.reload();
	}
}
