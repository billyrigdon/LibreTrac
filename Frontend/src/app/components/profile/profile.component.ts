import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { StoryService } from 'src/app/services/story.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserProfile } from 'src/app/types/user';
import { Story, StoryDrug } from '../../types/story';
import { UserDrug } from 'src/app/types/userDrug';
import { DrugService } from 'src/app/services/drug.service';
import { DatePipe, formatDate } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { setAverageMood, setDrugToEdit, setIsMonthView, setStoryToEdit, setUserDisorders, setUserDrugs, setUserId, toggleAuth, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WarningComponent } from '../warning/warning.component';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
// import { BottomSheetDisorderComponent, BottomSheetDrugComponent, BottomSheetInfoComponent } from '../profile-settings/profile-settings.component';
import { BottomSheetDisorderComponent } from '../bottom-sheet-disorder/bottom-sheet-disorder.component';
import { BottomSheetDrugComponent } from '../bottom-sheet-drug/bottom-sheet-drug.component';
import { BottomSheetInfoComponent } from '../bottom-sheet-info/bottom-sheet-info.component';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Drug } from 'src/app/types/drug';
import { UserDisorder } from 'src/app/types/disorder';
import { DisorderService } from 'src/app/services/disorder.service';
import axios from 'axios';
import { MoodService } from 'src/app/services/mood.service';

interface DisorderInfo {
	title: string;
	summary: string;
	categories: string[];
	images: string[];
}



@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
	stories: Array<StoryDrug>;
	userDrugs: Array<UserDrug>;
	userDisorders: Array<UserDisorder>;
	userProfile: UserProfile;
	profilePic: string;
	drugs: Array<Drug>;
	isMonthView: boolean = false;
	private startY: number | null = null;
	illnesses = [
		{ name: 'Bipolar Disorder Type I' },
		{ name: 'Attention Deficit Hyperactive Disorder - Combined' },
		{ name: 'Insomnia Disorder' },
		{ name: 'Generalized Anxiety Disorder' }
	];
	drugForm: UntypedFormGroup;
	userId: number = 0;
	mood: StoryDrug = <StoryDrug>{};
	@ViewChild('scrollable') scrollableElementRef!: ElementRef;
	constructor(
		private storyService: StoryService,
		private router: Router,
		private storageService: StorageService,
		private profileService: ProfileService,
		private drugService: DrugService,
		private datepipe: DatePipe,
		private store: Store<AppState>,
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private bottomSheet: MatBottomSheet,
		private disorderService: DisorderService,
		private moodService: MoodService
	) {
		this.stories = [];
		this.userDrugs = Array<UserDrug>();
		this.userDisorders = Array<UserDisorder>();
		this.userProfile = <UserProfile>{};
		this.profilePic = '../../../assets/Icons/avatar-placeholder.png';
		this.drugs = [];
		this.drugForm = this.formBuilder.group({
			drugId: [0],
			dosage: ['', Validators.required],
		});
	}

	@HostListener('touchstart', ['$event'])
	onTouchStart(event: TouchEvent) {
		this.startY = event.touches[0].clientY;
	}

	@HostListener('touchend', ['$event'])
	onTouchEnd(event: TouchEvent) {
		const endY = event.changedTouches[0].clientY;
		if (this.startY !== null && this.startY < endY && this.scrollableElementRef.nativeElement.scrollTop === 0) {
			const swipeDistance = endY - this.startY;
			const threshold = 100; // Set a threshold to consider it as a swipe down

			if (swipeDistance > threshold) {
				// window.location.reload();
				this.switchView(this.isMonthView);
				this.getUserDrugs();	
				this.getUserDisorders();
			}
		}
		this.startY = null;
	}

	openBottomSheetDrug() {
		this.store.dispatch(setDrugToEdit({ drug: {} as UserDrug }))
		const bottomSheetRef = this.bottomSheet.open(BottomSheetDrugComponent);


		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
		});
	}

	openBottomSheetDrugEdit() {
		const bottomSheetRef = this.bottomSheet.open(BottomSheetDrugComponent);


		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
		});
	}

	openBottomSheetProblem() {
		const bottomSheetRef = this.bottomSheet.open(BottomSheetDisorderComponent);

		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
		});
	}

	openBottomSheetInfo(summary: string, url: string, id: number, isDrug: boolean, drug?: UserDrug) {
		if (drug) {
			this.store.dispatch(setDrugToEdit({ drug }))
		}
		const bottomSheetRef: MatBottomSheetRef<BottomSheetInfoComponent> = this.bottomSheet.open(BottomSheetInfoComponent);
		bottomSheetRef.instance.summary = summary;
		bottomSheetRef.instance.id = id;
		bottomSheetRef.instance.isDrug = isDrug;
		bottomSheetRef.instance.url = url;
		bottomSheetRef.instance.onEdit.subscribe(() => {
			this.openBottomSheetDrugEdit();
		})
		bottomSheetRef.afterDismissed().subscribe(() => {
			console.log('Bottom sheet dismissed');
			// this.store.dispatch(setDrugToEdit({drug: {} as UserDrug}))
		});
	}

	switchView(isMonth: boolean) {
		// this.mood = <StoryDrug>{}; // reset mood
		this.store.dispatch(setIsMonthView({ isMonthView: isMonth }));

		if (this.isMonthView) {
			this.moodService.getAverageUserMoodForMonth(this.userId).subscribe((res: any) => {
				console.log(res);
				// this.mood = JSON.parse(res);
				this.store.dispatch(setAverageMood({ mood: JSON.parse(res) }))
			},
				(err) => {
					this.store.dispatch(setAverageMood({ mood: {} as StoryDrug }))
				});
		} else {
			this.moodService
				.getAverageUserMood(this.userId)
				.subscribe((res: any) => {
					console.log(res);
					// this.mood = JSON.parse(res);
					this.store.dispatch(setAverageMood({ mood: JSON.parse(res) }))
				},
					(err) => {
						this.store.dispatch(setAverageMood({ mood: {} as StoryDrug }))
					});
		}
	}

	addDrug() {

		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			// const userId = user.userId;
			const val = this.drugForm.value;

			this.drugService
				.addUserDrug(this.userId, parseInt(val.drugId), val.dosage)
				.subscribe((res) => {
					this.getUserDrugs();
				});
		}
	}

	addDisorder() {
		if (localStorage.getItem('userProfile')) {
			let user = JSON.parse(localStorage.getItem('userProfile') || '');
			const userId = user.userId;
			const val = this.drugForm.value;

			this.disorderService
				.addUserDisorder(userId, parseInt(val.disorderId))
				.subscribe((res) => {
					this.getUserDisorders();
				});
		}
	}



	async getSummary(name: string, id: number, isDrug: boolean, drug?: UserDrug): Promise<any> {
		const apiEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";
		const encodedTitle = encodeURI(name);
		const url = `${apiEndpoint}${encodedTitle}`;
		const wikiUrl = `https://en.wikipedia.org/wiki/${encodedTitle}`;
		try {
			const response = await axios.get(url);
			const summary = response.data.extract;
			this.openBottomSheetInfo(summary, wikiUrl, id, isDrug, drug);
			return { contents: summary };
		} catch (error) {
			this.openBottomSheetInfo('No information found', '', id, isDrug);
			return null;
		}
	}

	removeUserDrug(drugId: number) {
		const dialogRef = this.dialog.open(WarningComponent, {
			width: '500px',
			height: '500px',
		});
		dialogRef.componentInstance.message = 'Are you sure you want to remove this drug?';
		dialogRef.componentInstance.onCancel.subscribe((event: any) => {
			dialogRef.close();
			this.router.navigateByUrl('/profile')
		});
		dialogRef.componentInstance.onConfirm.subscribe(() => {
			this.drugService.removeUserDrug(drugId).subscribe((res) => {
				window.location.reload();
			});
		})
	}

	searchForDrug(drugId: number) {
		this.router.navigateByUrl('/explore?drugX=' + drugId + '&drugY=');
	}

	goToAddStory() {
		this.store.dispatch(setStoryToEdit({ story: {} as StoryDrug }))
		this.router.navigateByUrl('addStory');
	}

	goToSettings() {
		console.log('test');
		this.router.navigateByUrl('/profileSettings');
	}

	goToDrugs() {
		this.router.navigateByUrl('addDrug');
	}

	goToDrugInfo(drugName: string) {
		this.router.navigateByUrl('/drugInfo?drugName=' + drugName)
	}

	getUserDrugs() {
		this.store.dispatch(toggleLoading({ status: true }));
		this.drugService.getUserDrugs().subscribe((res) => {
			this.store.dispatch(setUserDrugs({userDrugs: JSON.parse(res) }));
			this.store.dispatch(toggleLoading({ status: false }));
		}, (err) => {
			this.store.dispatch(toggleLoading({ status: false }));
			this.store.dispatch(setUserDrugs({userDrugs: [] })) ;
		});
	}

	getUserDisorders() {
		this.disorderService.getUserDisorders().subscribe((res) => {
			this.store.dispatch(setUserDisorders({userDisorders: JSON.parse(res) })) ;
			
		}, (err) => {
			console.log(err);
			this.store.dispatch(setUserDisorders({userDisorders: []})) ;
			
		});
	}

	ngOnInit(): void {
		this.store.select(getSharedState).subscribe((state) => {
			this.userDrugs = state.userDrugs;
			this.userDisorders = state.userDisorders;
			this.mood = state.averageMood;
			this.isMonthView = state.isMonthView;
			this.userId = state.userId;
		
		});


		//Check if logged in and navigate to splash if not
		if (this.storageService.getToken() && this.storageService.getUser()) {
			this.switchView(this.isMonthView);
		
			this.getUserDrugs();
			this.getUserDisorders();
			
			this.drugService.getDrugs().subscribe((res) => {
				this.drugs = JSON.parse(res);
				this.store.dispatch(toggleLoading({ status: false }));
			});
			//TODO: Move userprofile to shared state instead of handling it this way
			if (localStorage.getItem('userProfile')) {
				this.store.dispatch(toggleLoading({ status: true }));
				this.profileService.getProfile().subscribe((res) => {
					this.profileService.setProfile(res)
				})
				//Get user fields from user stored in local storage
				this.userProfile = JSON.parse(
					localStorage.getItem('userProfile') || ''
				);

				//Get Profile if it does not exist in local storage
			} else {
				this.profileService.getProfile().subscribe((res) => {
					this.profileService.setProfile(res);

					//If user profile successfully saved, reload page
					if (localStorage.getItem('userProfile')) {
						window.location.reload();
						//If couldn't get user profile, navigate to createProfile page
					} 
				});
			}
		} else {
			this.storageService.signout();
			this.store.dispatch(toggleAuth({ status: false }));
			this.router.navigateByUrl('/login');
		}

		
	}
}
