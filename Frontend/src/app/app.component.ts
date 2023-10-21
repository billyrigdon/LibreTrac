import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';

import { NotificationService } from './services/notification.service';
import { StorageService } from './services/storage.service';
import { AppState } from './store/app.state';
import { setNotifications } from './store/comments/comments.actions';
import { getAddCommentsOpen } from './store/comments/comments.selector';
import { setUserId, toggleAuth, toggleNoties } from './store/shared/actions/shared.actions';
import {
	getAuthState,
	getLoading,
	getNotiesOpen,
} from './store/shared/selectors/shared.selector';
import { AuthService } from './services/auth.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'LibreTrac';
	isLoggedIn: Observable<boolean>;
	isLoading: Observable<boolean>;
	addCommentOpen: Observable<boolean>;
	userId: number;
	loggedIn: boolean;
	containerHeight: number = 0;
	originalHeight: number = 0;
	containerMarginBottom: string = '0px';
	inputFocusBlurHandler: () => void = this.inputHandler.bind(this);
	notiesOpen: boolean = false;
	constructor(
		private storageService: StorageService,
		private store: Store<AppState>,
		public router: Router,
		private notificationService: NotificationService,
		private authService: AuthService
	) {
		this.isLoading = this.store.select(getLoading);
		this.isLoggedIn = this.store.select(getAuthState);
		this.addCommentOpen = this.store.select(getAddCommentsOpen);
		this.userId = 0;
		this.loggedIn = false;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: Event) {
		this.containerHeight = (event.target as Window).innerHeight;
		this.inputHandler();
	}

	ngAfterViewInit(): void {
		// this.addEventListenersToInputs();
		// if (localStorage.getItem('user')) {
		// 	//Get userId from user stored in local storage
		// 	this.userId = JSON.parse(localStorage.getItem('user') || '').userId;
		// 	//Set global userId
		// 	console.log(this.userId)
		// 	this.store.dispatch(setUserId({ userId: this.userId }));
		// 	this.notificationService
		// 		.getUserNotifications(this.userId)
		// 		.subscribe((noties) => {
		// 			this.store.dispatch(
		// 				setNotifications({ notifications: noties })
		// 			);
		// 		});
		// }

		this.isLoggedIn.subscribe((res) => {
			this.loggedIn = res;
			if (!this.loggedIn) {
				this.router.navigateByUrl('/login');
			}
		})
	}

	inputHandler() {
		console.log(this.containerHeight);
		document.body.style.height = window.innerHeight + 'px';	
		this.containerHeight = (window.innerHeight - 48);
		this.containerMarginBottom = (this.originalHeight - this.containerHeight).toString() + 'px';
	}

	addEventListenersToInputs() {
		// document.body.addEventListener("resize", this.inputHandler, true);
		const inputElements = document.querySelectorAll('input');
		inputElements.forEach(input => {
			input.addEventListener('focus', this.inputFocusBlurHandler);
			input.addEventListener('blur', this.inputFocusBlurHandler);
		});
	}

	removeEventListenersFromInputs() {
		const inputElements = document.querySelectorAll('input');
		inputElements.forEach(input => {
			input.removeEventListener('focus', this.inputFocusBlurHandler);
			input.removeEventListener('blur', this.inputFocusBlurHandler);
		});
	}

	ngOnInit(): void {

		this.store.select(getNotiesOpen).subscribe((open) => {
			this.notiesOpen = open;
		})


		if (Capacitor.getPlatform() === 'android') {
			App.addListener('backButton', (data) => {
				if (data.canGoBack) {
					window.history.back();
					if (this.router.url === '/login') {
						App.exitApp();
					}
				} else {
					App.exitApp();
				}
			})
		}
		this.containerHeight = (window.innerHeight - 48);
		this.originalHeight = (window.innerHeight - 48);
		//Scroll to top of page on route changes aside from explore page
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(() => {
				this.store.dispatch(toggleNoties({ open: false }));
				if (!this.router.url.includes('explore')) {
					document.body.scrollTop = 0;
				}
			});

		if (this.storageService.getToken()) {
			if (this.authService.tokenExpired(this.storageService.getToken() as string)) {
				this.storageService.signout();
			} else {
				this.store.dispatch(toggleAuth({ status: true }));
			}
		}

		if (localStorage.getItem('userProfile')) {
			//Get userId from user stored in local storage
			this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
			console.log(this.userId);
			// this.store.dispatch(setUserId({ userId: this.userId }));

			//Set global userId
			this.store.dispatch(setUserId({ userId: this.userId }));
			this.notificationService
				.getUserNotifications(this.userId)
				.subscribe((noties) => {
					this.store.dispatch(
						setNotifications({ notifications: noties })
					);
				});
		}
		this.isLoading = this.store.select(getLoading);




		// document.body.addEventListener("resize", () => {
		// 	console.log(this.containerHeight);
		// 	this.containerHeight = (window.innerHeight - 48);
		// 	this.containerMarginBottom = (this.originalHeight - this.containerHeight) .toString() + 'px'; 
		// }, true);


		// document.body.addEventListener("focus", (event: any) => {
		// 	this.containerHeight = (window.innerHeight - 48);

		// 	const target = event.target;
		// 	switch (target.tagName) {
		// 		case "INPUT":
		// 		case "TEXTAREA":
		// 		case "SELECT":
		// 			document.body.classList.add("keyboard");
		// 	}
		// }, true); 
		// document.body.addEventListener("blur", () => {
		// 	this.containerHeight = (window.innerHeight - 48);
		// 	document.body.classList.remove("keyboard");
		// }, true); 
	}
}
