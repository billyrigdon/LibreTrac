import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import { DrugService } from 'src/app/services/drug.service';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { AppState } from 'src/app/store/app.state';
import { toggleAuth } from 'src/app/store/shared/actions/shared.actions';

@Component({
  selector: 'app-password-reset-modal',
  templateUrl: './password-reset-modal.component.html',
  styleUrls: ['./password-reset-modal.component.scss']
})
export class PasswordResetModalComponent {
  resetPasswordForm: any;
//   formContainer: any;

  constructor(private formBuilder: UntypedFormBuilder,
		private profileService: ProfileService,
		private router: Router,
		private storageService: StorageService,
		private store: Store<AppState>,
		private drugService: DrugService,
		private bottomSheet: MatBottomSheet,
		private authService: AuthService,) {
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
   }

  resetPassword() {
		// this.formContainer.nativeElement.style.marginTop = '0';
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

}
