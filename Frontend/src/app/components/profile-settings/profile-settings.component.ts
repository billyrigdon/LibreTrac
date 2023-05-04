import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { UserProfile } from 'src/app/types/user';
import { AppState } from 'src/app/store/app.state';
import { DrugService } from 'src/app/services/drug.service';
import { Drug } from 'src/app/types/drug';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Disorder } from 'src/app/types/disorder';
import { DisorderService } from 'src/app/services/disorder.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { BottomSheetDrugComponent } from '../bottom-sheet-drug/bottom-sheet-drug.component';
import { PasswordResetModalComponent } from '../password-reset-modal/password-reset-modal.component';


@Component({
	selector: 'app-profile-settings',
	templateUrl: './profile-settings.component.html',
	styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
	form: UntypedFormGroup;
	userProfile: UserProfile;
	drugs: Array<Drug>;
	drugForm: UntypedFormGroup;
	resetPasswordForm: UntypedFormGroup;
	@ViewChild('formContainer') formContainer: ElementRef = new ElementRef(null);
	updateEmailForm: UntypedFormGroup;
	constructor(
		private formBuilder: UntypedFormBuilder,
		private profileService: ProfileService,
		private router: Router,
		private storageService: StorageService,
		private store: Store<AppState>,
		private drugService: DrugService,
		private bottomSheet: MatBottomSheet,
		private authService: AuthService,
		private dialog: MatDialog,
	) {
		this.form = this.formBuilder.group({
			covidVaccine: [false, Validators.required],
			smoker: [false, Validators.required],
			drinker: [false, Validators.required],
			optOut: [false, Validators.required],
		});
		this.userProfile = {
			userId: 0,
			username: '',
			reputation: 0,
			covidVaccine: false,
			smoker: false,
			drinker: false,
			// twoFactor: false,
			optOutOfPublicStories: false,
			notificationPermission: false,
			textSize: 16
		};
		this.drugs = [];
		this.drugForm = this.formBuilder.group({
			drugId: [0],
			dosage: ['', Validators.required],
		});
		this.resetPasswordForm = this.formBuilder.group({
			oldPassword: ['', Validators.required],
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([
				Validators.required,
				Validators.minLength(8),
				Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@#!%*?&])[A-Za-z\\d$@#!%*?&]{8,}$')
			])],
			confirmPassword: ['', Validators.compose([Validators.required])],
		});
		this.updateEmailForm = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			newEmail: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required])]
		});
	}

	ngAfterViewInit() {
		this.adjustFormContainerPosition();
		window.addEventListener('resize', this.adjustFormContainerPosition.bind(this));
	  }
	  
	  ngOnDestroy() {
		window.removeEventListener('resize', this.adjustFormContainerPosition.bind(this));
	  }
	  
	  adjustFormContainerPosition() {
		const windowHeight = window.innerHeight;
		const formContainerHeight = this.formContainer.nativeElement.offsetHeight;
		const formContainerTop = (windowHeight - formContainerHeight) / 2;
		this.formContainer.nativeElement.style.top = formContainerTop + 'px';
	  }

	ngOnInit(): void {
		this.drugService.getDrugs().subscribe((res) => {
			this.drugs = JSON.parse(res);
		});

		if (localStorage.getItem('userProfile')) {
			this.userProfile = JSON.parse(
				localStorage.getItem('userProfile') || ''
			);
			this.form = this.formBuilder.group({
				covidVaccine: [this.userProfile.covidVaccine, Validators.required],
				smoker: [this.userProfile.smoker, Validators.required],
				drinker: [this.userProfile.drinker, Validators.required],
				optOut: [this.userProfile.optOutOfPublicStories, Validators.required],
			});


		}
	}

	resetPassword() {
		this.formContainer.nativeElement.style.marginTop = '0';
		const val = this.resetPasswordForm.value;
		if (val.password !== val.confirmPassword) {
			alert('Passwords do not match');
			return;
		}

		this.authService.login(val.email, val.oldPassword).subscribe((res) => {
			if (res) {
				this.authService.resetPassword(val.email, val.password).subscribe((res2) => {
					if (res2) {
						alert('Password reset successfully');
						this.storageService.signout();
						this.store.dispatch(toggleAuth({ status: false }))
						this.router.navigateByUrl('/login');
					} else {
						alert('Failed to reset password');
					}
				});
			} else {
				alert('Failed to reset password');
			}
		});
	}

	openResetPasswordModal() {
		const dialogRef = this.dialog.open(PasswordResetModalComponent, {
			width: '500px',
			height: '500px',
		});
		
	}

	updateEmail() {
		this.store.dispatch(toggleLoading({ status: true }))
		this.formContainer.nativeElement.style.marginTop = '0';
		const val = this.updateEmailForm.value;

		this.authService.login(val.email, val.password).subscribe((res) => {
			if (res) {
				this.authService.updateEmail(val.email, val.newEmail).subscribe((res2) => {
					if (res2) {
						alert('Email updated successfully');
						this.store.dispatch(toggleLoading({ status: false }));
						this.storageService.signout();
						this.store.dispatch(toggleAuth({ status: false }))
						this.router.navigateByUrl('/login');
					} else {
						this.store.dispatch(toggleLoading({ status: false }))
						alert('Failed to update Email');
					}
				});
			} else {
				this.store.dispatch(toggleLoading({ status: false }))
				alert('Failed to updateEmail');
			}
		});
	}

	openBottomSheet() {
		const bottomSheetRef = this.bottomSheet.open(BottomSheetDrugComponent);



		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
		});
	}

	addDrug() {
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			const val = this.drugForm.value;

			this.drugService
				.addUserDrug(userId, parseInt(val.drugId), val.dosage)
				.subscribe((res) => {
					this.router.navigateByUrl('/profileSettings');
					window.location.reload();
				});
		}
	}

	// goToDrugs() {
	// 	this.router.navigateByUrl('addDrug');
	// }

	updateProfile() {
		let val = this.form.value;
		this.userProfile.covidVaccine = val.covidVaccine;
		this.userProfile.smoker = val.smoker;
		this.userProfile.drinker = val.drinker;
		this.userProfile.optOutOfPublicStories = val.optOut;

		this.profileService.updateProfile(this.userProfile).subscribe((res) => {
			this.profileService.setProfile(res);
			this.router.navigate(['/profile']);
		}, (err) => {
			alert('Failed to update profile');
		});

	}
}
