import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { AppState } from 'src/app/store/app.state';
import {
	setUserId,
	toggleAuth,
	toggleLoading,
} from 'src/app/store/shared/actions/shared.actions';
import { getAuthState } from 'src/app/store/shared/selectors/shared.selector';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	form: UntypedFormGroup;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private authService: AuthService,
		private storageService: StorageService,
		private router: Router,
		private profileService: ProfileService,
		private store: Store<AppState>,
	) {
		this.form = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required])]
		});
	}

	//Make login post request, save token response to session storage, navigate to home
	login() {
		const val = this.form.value;

		if (val.email && val.password) {
			this.store.dispatch(toggleLoading({ status: true }));

			this.authService
				.login(val.email.toLowerCase(), val.password)
				.subscribe((res) => {
					this.storageService.saveUser(res.username);
					this.storageService.saveToken(res.token);
					this.store.dispatch(
						setUserId({ userId: res.userId})
					);
					this.profileService.getProfile().subscribe((res) => {
						this.profileService.setProfile(res);
						this.store.dispatch(toggleAuth({ status: true }));
						
						this.store.dispatch(toggleLoading({ status: false }));

						this.router.navigateByUrl('/profile');
					});
				},
					(err) => {
						this.store.dispatch(toggleLoading({ status: false }));
						const message = 'Username or password is incorrect';
						alert(message);
					});
		}
	}

	//If already logged in and user profile found, navigate to home
	ngOnInit(): void {
		if (this.storageService.getToken()) {
			this.router.navigateByUrl('/profile');
		}
	}
}
