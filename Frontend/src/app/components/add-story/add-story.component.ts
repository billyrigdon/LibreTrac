import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppState } from '@capacitor/app';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MoodService } from 'src/app/services/mood.service';
import { StoryService } from 'src/app/services/story.service';
import { setAverageMood, setExploreStories, setIsMonthView, setStoryMood, setUserStories, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { SHARED_STATE_NAME, getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { Story, StoryDrug } from 'src/app/types/story';

@Component({
	selector: 'app-add-story',
	templateUrl: './add-story.component.html',
	styleUrls: ['./add-story.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AddStoryComponent implements OnInit, AfterViewInit, OnDestroy {
	form: UntypedFormGroup;
	story: Story;
	journalOpen: boolean;
	@Input() storyToEdit?: Story;
	userStories: StoryDrug[] = [];
	exploreStories: StoryDrug[] = [];
	userId = 0;
	stateSub$!: Subscription
	controlNames = ['energy', 'focus', 'creativity', 'irritability', 'happiness', 'anxiety'];

	constructor(
		private formBuilder: UntypedFormBuilder,
		private storyService: StoryService,
		private router: Router,
		private store: Store<AppState>,
		private moodService: MoodService
	) {
		this.form = this.formBuilder.group({
			energy: [1, Validators.required],
			focus: [1, Validators.required],
			creativity: [1, Validators.required],
			irritability: [1, Validators.required],
			happiness: [1, Validators.required],
			anxiety: [1, Validators.required],
			title: ['', [Validators.required, Validators.minLength(1)]],
			journal: ['']
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
		if (this.form.invalid) {
			return;
		}
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
		this.story.userId = this.userId;
		this.store.dispatch(toggleLoading({ status: true }));
		this.storyService.addUserStory(this.story).subscribe((res: any) => {
			this.store.dispatch(setUserStories({ stories: [res, ...this.userStories] }));
			this.store.dispatch(setExploreStories({ stories: [res, ...this.exploreStories] }));

			setTimeout(() => {
				this.moodService.getAverageUserMood(this.userId).subscribe((mood: any) => {
					this.store.dispatch(setAverageMood({ mood: JSON.parse(mood) }));
					this.store.dispatch(setIsMonthView({ isMonthView: false }));
					this.store.dispatch(toggleLoading({ status: false }));
					alert('Journal added successfully')
					this.router.navigateByUrl('/user-stories');
				}, (err) => {
					this.store.dispatch(toggleLoading({ status: false }));
					alert('Failed to fetch updated mood')
				})
			}, 500)

		}, (err) => {
			this.store.dispatch(toggleLoading({ status: false }));
			alert('Failed to add journal entry');
		});
	}

	updateStory() {
		if (this.form.invalid) {
			return;
		}
		const val = this.form.value;
		// const story = {} as Story;
		this.story.energy = parseInt(val.energy);
		this.story.creativity = parseInt(val.creativity);
		this.story.focus = parseInt(val.focus);
		this.story.irritability = parseInt(val.irritability);
		this.story.happiness = parseInt(val.happiness);
		this.story.anxiety = parseInt(val.anxiety);
		this.story.journal = val.journal;
		this.story.title = val.title;
		this.story.date = new Date();
		this.story.userId = this.userId;;
		this.store.dispatch(toggleLoading({ status: true }));
		this.storyService.updateUserStory(this.story).subscribe((res: any) => {
			const newStory = { ...res }
			this.moodService.getAverageStoryMood(res.storyId).subscribe((mood: any) => {
				this.store.dispatch(setStoryMood({ mood: JSON.parse(mood) }));
				const filteredUserStories = this.userStories.filter((story) => story.storyId !== newStory.storyId);
				const filteredExploreStories = this.exploreStories.filter((story) => story.storyId !== newStory.storyId);
				this.store.dispatch(setUserStories({ stories: [res, ...filteredUserStories] }));
				this.store.dispatch(setExploreStories({ stories: [res, ...filteredExploreStories] }));
				// setTimeout(() => {
				this.moodService.getAverageUserMood(this.userId).subscribe((mood: any) => {
					this.store.dispatch(setIsMonthView({ isMonthView: false }));
					this.store.dispatch(toggleLoading({ status: false }));
					this.store.dispatch(setAverageMood({ mood: JSON.parse(mood) }));
					alert('Story updated successfully')
					this.router.navigateByUrl('/user-stories');
				}, (err) => {
					this.store.dispatch(toggleLoading({ status: false }));
					alert('Failed to fetch updated mood')
				});
				// },500)
			}, (err) => {
				this.store.dispatch(toggleLoading({ status: false }));
				alert('Failed to fetch updated mood')
			});



		}, (err) => {
			this.store.dispatch(toggleLoading({ status: false }));
			alert('Failed to add journal entry');
		});
	}

	openJournal() {
		this.journalOpen = true;
	}

	closeJournal() {
		this.journalOpen = false;
	}

	ngAfterViewInit(): void {
		this.store.dispatch(toggleLoading({status: false}));
		this.store.select(getSharedState).subscribe((state) => {
			if (state.storyToEdit.storyId) {
				const story = {...state.storyToEdit};
				console.log(story)
				this.story.storyId = story.storyId;
				this.form.setValue({
					journal: story.journal,
					energy: story.energy,
					focus: story.focus,
					creativity: story.creativity,
					irritability: story.irritability,
					happiness: story.happiness,
					anxiety: story.anxiety,
					title: story.title,
				});
			}
		})

	}

	ngOnInit(): void {
		this.stateSub$ = this.store.select(getSharedState).subscribe((state) => {
			if (state.userStories.length > 0) {
				this.userStories = [...state.userStories];
			} else {
				this.userStories = []
			}
			if (state.exploreStories.length > 0) {
				this.exploreStories = [...state.exploreStories];
			} else {
				this.exploreStories = []
			}
			this.userId = state.userId;
		});

		if (!localStorage.getItem('userProfile')) {
			this.router.navigateByUrl('/login');
			window.location.reload();
		}
	}

	ngOnDestroy(): void {
		this.stateSub$.unsubscribe();
	}
}


