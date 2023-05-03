import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppState } from '@capacitor/app';
import { Store } from '@ngrx/store';
import { StoryService } from 'src/app/services/story.service';
import { SHARED_STATE_NAME, getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { Story } from 'src/app/types/story';

@Component({
	selector: 'app-add-story',
	templateUrl: './add-story.component.html',
	styleUrls: ['./add-story.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AddStoryComponent implements OnInit, AfterViewInit {
	form: UntypedFormGroup;
	story: Story;
	journalOpen: boolean;
	@Input() storyToEdit?: Story;

	controlNames = ['energy', 'focus', 'creativity', 'irritability', 'happiness', 'anxiety'];

	constructor(
		private formBuilder: UntypedFormBuilder,
		private storyService: StoryService,
		private router: Router,
		private store: Store<AppState>
	) {
		this.form = this.formBuilder.group({
			energy: [1, Validators.required],
			focus: [1, Validators.required],
			creativity: [1, Validators.required],
			irritability: [1, Validators.required],
			happiness: [1, Validators.required],
			anxiety: [1, Validators.required],
			title: ['', Validators.required],
			journal: ['', Validators.required],
		});
		this.story = {
			title: '',
			energy: 1,
			creativity: 1,
			focus: 1,
			irritability: 1,
			happiness: 1,
			anxiety: 1,
			journal: '',
			userId: 1,
			date: new Date(),
			storyId: 1,
			votes: 1,
		};
		this.journalOpen = false;
	}

	addStory() {
		const val = this.form.value;
		this.story.energy = parseInt(val.energy);
		this.story.creativity = parseInt(val.creativity);
		this.story.focus = parseInt(val.focus);
		this.story.irritability = parseInt(val.irritability);
		this.story.happiness = parseInt(val.happiness);
		this.story.anxiety = parseInt(val.anxiety);
		this.story.journal = val.journal;
		this.story.title = val.title;
		this.story.date = new Date();
		this.storyService.addUserStory(this.story).subscribe((res) => {
			this.router.navigateByUrl('profile');
		}, (err) => {
			alert('Failed to add journal entry');
		});
	}

	updateStory() {
		const val = this.form.value;
		this.story.energy = parseInt(val.energy);
		this.story.creativity = parseInt(val.creativity);
		this.story.focus = parseInt(val.focus);
		this.story.irritability = parseInt(val.irritability);
		this.story.happiness = parseInt(val.happiness);
		this.story.anxiety = parseInt(val.anxiety);
		this.story.journal = val.journal;
		this.story.title = val.title;
		this.story.date = new Date();
		this.storyService.updateUserStory(this.story).subscribe((res) => {
			this.router.navigateByUrl('profile');
		}, (err) => {
			alert('Failed to add journal entry');
		});
	}

	openJournal() {
		this.journalOpen = true;
	}

	ngAfterViewInit(): void {
		this.store.select(getSharedState).subscribe((state) => {
			if (state.storyToEdit.storyId) {
				const story = state.storyToEdit;
				this.story.storyId = story.storyId;
				this.form.setValue({
					energy: story.energy,
					focus: story.focus,
					creativity: story.creativity,
					irritability: story.irritability,
					happiness: story.happiness,
					anxiety: story.anxiety,
					title: story.title,
					journal: story.journal,
				});
			}
		})
		if (this.storyToEdit) {

		}
	}

	ngOnInit(): void {


		if (localStorage.getItem('userProfile')) {
			//Get user fields from user stored in local storage
			this.story.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
		} else {
			this.router.navigateByUrl('explore');
		}
	}
}


