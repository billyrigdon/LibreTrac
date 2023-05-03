import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { setNotifications } from 'src/app/store/comments/comments.actions';
import { getNotifications } from 'src/app/store/comments/comments.selector';
import { toggleAuth } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { SearchModalComponent } from '../search-modal/search-modal.component';
let NavbarComponent = class NavbarComponent {
    constructor(storageService, profileService, router, store, notificationService, dialog) {
        this.storageService = storageService;
        this.profileService = profileService;
        this.router = router;
        this.store = store;
        this.notificationService = notificationService;
        this.dialog = dialog;
        this.buttonRoutes = {
            profile: '/profile',
            explore: '/explore',
            userStories: '/user-stories'
        };
        this.isLoggedIn = this.store.select(getAuthState);
        this.userId = 0;
        this.noties = [];
        this.stories = [];
    }
    isRouteActive(route) {
        return this.router.url.includes(route);
    }
    ngAfterViewInit() {
        this.isLoggedIn.subscribe((res) => {
            if (res) {
                this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
                //Get initial notifications
                this.notificationService
                    .getUserNotifications(this.userId)
                    .subscribe((noties) => {
                    this.store.dispatch(setNotifications({ notifications: noties ? noties : [] }));
                });
                // Get new notifications every 30 seconds
                // if (res) {
                setInterval(() => {
                    this.notificationService
                        .getUserNotifications(this.userId)
                        .subscribe((noties) => {
                        this.store.dispatch(setNotifications({ notifications: noties ? noties : [] }));
                    });
                }, 15000);
            }
        });
    }
    ngOnInit() {
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
    showNoties() {
        if (this.noties.length === 0) {
        }
        this.notificationService
            .getNotificationStories(this.userId)
            .subscribe((res) => {
            this.stories = res;
            this.store.dispatch(setNotifications({ notifications: [] }));
            const dialogRef = this.dialog.open(StoriesModalComponent, {
                data: { stories: this.stories },
                width: '100%',
                height: '50%',
            });
            dialogRef.afterClosed().subscribe((storyId) => {
                if (storyId) {
                    this.notificationService
                        .clearNotifications(this.userId, storyId)
                        .subscribe();
                    this.router.navigateByUrl('/story?storyId=' + storyId.toString());
                }
            });
        });
    }
    showSearch() {
        const dialogRef = this.dialog.open(SearchModalComponent, {
            data: {},
            width: '95%',
            height: '400px',
        });
        dialogRef.componentInstance.onCancel.subscribe(() => {
            dialogRef.close();
        });
        dialogRef.componentInstance.onSearchEvent.subscribe((searchTerm) => {
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
};
NavbarComponent = __decorate([
    Component({
        selector: 'app-navbar',
        templateUrl: './navbar.component.html',
        styleUrls: ['./navbar.component.scss'],
    })
], NavbarComponent);
export { NavbarComponent };
// Modal for notifications
let StoriesModalComponent = class StoriesModalComponent {
    constructor(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
    }
    onStoryClick(storyId) {
        this.dialogRef.close(storyId);
    }
};
StoriesModalComponent = __decorate([
    Component({
        selector: 'app-stories-modal',
        template: `
	<div *ngIf="data.stories.length > 0" class="modal-wrapper">
	  <h2>You have comments on these stories:</h2>
	  <div fxLayout="row wrap" fxLayoutAlign="space-between center">
		<div class="story-card" *ngFor="let story of data.stories" (click)="onStoryClick(story.storyId)">
		  <div class="story-name">{{ story.title }}</div>
		</div>
	  </div>
	</div>
	<div class="modal-wrapper">
	  <h2>All caught up!</h2>
	</div>
	`,
        styles: [`
	app-stories-modal {
		width: 100%;
		height: 100%;
		background-color: #171717 !important;
		border-radius: 10px !important;
		padding: 12px !important;
	}

	.modal-wrapper {
		width: 100%;
		height: 100%;
		background-color: black;
		padding: 12px;
		background-color: #171717 !important;
		border-radius: 10px !important;
		padding: 12px !important;
	}

	  .story-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #171717 !important;
		border-radius: 10px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		width: 100%;
		height: 100%;
		margin: 10px;
		cursor: pointer;

	  }
  
	  .story-name {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
	  }
  
	  .story-id {
		font-size: 16px;
	  }
	`]
    }),
    __param(1, Inject(MAT_DIALOG_DATA))
], StoriesModalComponent);
export { StoriesModalComponent };
//# sourceMappingURL=navbar.component.js.map