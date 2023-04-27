import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProfileService } from 'src/app/services/profile.service';
import { StorageService } from 'src/app/services/storage.service';
import { toggleAuth } from 'src/app/store/shared/actions/shared.actions';
import { UserProfile } from 'src/app/types/user';
import { AppState } from 'src/app/store/app.state';
import { MatDialog } from '@angular/material/dialog';
import { TosComponent } from '../tos/tos.component';

@Component({
	selector: 'app-create-profile',
	templateUrl: './create-profile.component.html',
	styleUrls: ['./create-profile.component.scss'],
})
export class CreateProfileComponent implements OnInit {
	form: UntypedFormGroup;
	user: UserProfile;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private profileService: ProfileService,
		private router: Router,
		private storageService: StorageService,
		private store: Store<AppState>,
		private dialog: MatDialog
	) {
		this.form = this.formBuilder.group({
			age: ['', Validators.required],
			weight: ['', Validators.required],
			covidVaccine: [false, Validators.required],
			smoker: [false, Validators.required],
			drinker: [false, Validators.required],
			optOut: [false, Validators.required],
		});
		this.user = {
			userId: 0,
			username: '',
			reputation: 0,
			covidVaccine: false,
			smoker: false,
			drinker: false,
			// twoFactor: false,
			optOutOfPublicStories: false,
			notificationPermission: false,
			textSize: 16,
		};
	}

	//Redirect to splash screen if not logged in
	ngOnInit(): void {
		// if (!this.storageService.getToken()) {
		// 	this.router.navigateByUrl("/explore");
		// }
	}


	//Create new user_profile entry in database using fields from form and redirect to home page
	// submitProfile() {
	// 	let val = this.form.value;

	// 	if (username !== null) {
			
	// 		// this.user.age = parseInt(val.age);
	// 		// this.user.weight = parseInt(val.weight);
	// 		// //this.user.country = val.country;
	// 		// //this.user.avatar = val.avatar;
	// 		// //this.user.status = val.status;
	// 		// //this.user.funFact = val.funFact;
	// 		this.user.covidVaccine = val.covidVaccine;
	// 		this.user.smoker = val.smoker;
	// 		this.user.drinker = val.drinker;
	// 		this.user.optOutOfPublicStories = val.optOut;

	// 		this.profileService.createProfile(this.user).subscribe((res) => {
	// 			this.profileService.setProfile(res);
	// 			this.store.dispatch(toggleAuth({ status: true }));
	// 			this.router.navigateByUrl("/profile");
	// 		},
	// 		(err) => {
	// 			const message = 'Failed to create profile.';
  	// 			alert(message);
	// 		});
	// 	}
	// }
}
