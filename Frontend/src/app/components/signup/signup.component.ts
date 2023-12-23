import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import {
	Form,
	FormGroup,
	UntypedFormBuilder,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import {
	setUserId,
	toggleAuth,
	toggleLoading,
} from 'src/app/store/shared/actions/shared.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { MatDialog } from '@angular/material/dialog';
import { TosComponent } from '../tos/tos.component';
import { ProfileService } from 'src/app/services/profile.service';
import { UserProfile } from 'src/app/types/user';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
	form: UntypedFormGroup;
	submitted = false;
	user: UserProfile;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private authService: AuthService,
		private router: Router,
		private storageService: StorageService,
		private store: Store<AppState>,
		private dialog: MatDialog,
		private profileService: ProfileService,
	) {
		this.user = {
			userId: 0,
			username: '',
			reputation: 0,
			covidVaccine: false,
			smoker: false,
			drinker: false,
			optOutOfPublicStories: false,
			notificationPermission: false,
			textSize: 16,
		};

		this.form = this.formBuilder.group(
			{
				agreement: [false, Validators.requiredTrue],
				username: [
					'',
					Validators.compose([
						Validators.required,
						Validators.minLength(4),
					]),
				],
				email: [
					'',
					Validators.compose([Validators.required, Validators.email]),
				],
				password: [
					'',
					Validators.compose([
						Validators.required,
						Validators.minLength(8),
						Validators.pattern(
							'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@#!%*-?&])[A-Za-z\\d$@#!%*-?&]{8,}$',
						),
					]),
				],
				confirmPassword: [
					'',
					Validators.compose([Validators.required]),
				],
				covidVaccine: [false],
				smoker: [false],
				drinker: [false],
				optOut: [true],
			},
			{ validator: this.passwordMatchValidator },
		);
	}

	ngOnInit(): void {
		if (this.storageService.getToken()) {
			this.router.navigateByUrl('/profile');
		}
	}

	passwordMatchValidator(form: FormGroup) {
		const password = form.get('password')?.value;
		const confirmPassword = form.get('confirmPassword')?.value;

		if (password !== confirmPassword) {
			form.get('confirmPassword')?.setErrors({ mismatch: true });
		} else {
			form.get('confirmPassword')?.setErrors(null);
		}
	}

	openTos() {
		const dialogRef = this.dialog.open(TosComponent, {
			data: {},
			width: '90%',
			height: '75%',
		});

		dialogRef.componentInstance.onClose.subscribe(() => {
			dialogRef.close();
		});
	}

	signup() {
		const val = this.form.value;
		this.submitted = true;

		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		//Send post request, save token response to local storage, go to profile page
		if (
			val.agreement &&
			val.confirmPassword &&
			val.username &&
			val.email &&
			val.password
		) {
			this.store.dispatch(toggleLoading({ status: true }));
			this.authService
				.signup(val.username, val.email, val.password)
				.subscribe(
					(res) => {
						this.storageService.saveToken(res.token);
						this.storageService.saveUser(res.username);
						this.store.dispatch(setUserId({ userId: res.userId }));

						this.user.username = res.username;
						this.user.covidVaccine = val.covidVaccine;
						this.user.smoker = val.smoker;
						this.user.drinker = val.drinker;
						this.user.optOutOfPublicStories = val.optOut;
						this.user.userId = res.userId;
						this.profileService.createProfile(this.user).subscribe(
							(profile) => {
								this.profileService.setProfile(profile);
								this.store.dispatch(
									toggleAuth({ status: true }),
								);
								this.store.dispatch(
									toggleLoading({ status: false }),
								);
								this.router.navigateByUrl('/profile');
							},
							(err) => {
								const message =
									'Failed to create save profile info.';
								alert(message);
								this.router.navigateByUrl('/profile');
							},
						);
					},
					(err) => {
						this.store.dispatch(toggleLoading({ status: false }));
						const message = 'Username already in use';
						alert(message);
					},
				);
		}
	}
}
