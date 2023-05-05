import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';
import { ActivatedRoute, Router } from '@angular/router';
import {
	setIsUserStory,
	setParentCommentContent,
	setParentId,
	setStoryContent,
	setStoryId,
} from 'src/app/store/comments/comments.actions';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { setAverageMood, setExploreStories, setStoryToEdit, setUserStories, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { MoodService } from 'src/app/services/mood.service';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';

@Component({
	selector: 'app-story',
	templateUrl: './story.component.html',
	styleUrls: ['./story.component.scss'],
})
export class StoryComponent implements OnInit {
	story: StoryDrug;
	mood: StoryDrug;
	storyId: number;
	userId: number;
	isUserStory: boolean;
	userStories: StoryDrug[] = [];
	exploreStories: StoryDrug[] = [];

	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private moodService: MoodService
	) {
		this.story = <StoryDrug>{};
		this.mood = <StoryDrug>{};
		this.storyId = 0;
		this.userId = 0;
		this.isUserStory = false;
	}

	navigateToEditStory() {
		this.store.dispatch(setStoryToEdit({ story: this.story }))
		this.router.navigate(['/addStory']);
	}

	parseDate(input: string) {

		let parts = input.split('-');

		// new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])); // Note: months are 0-based
	}

	getStory() {
		this.store.dispatch(toggleLoading({ status: true }));
		this.storyService.getStory(this.storyId).subscribe((res) => {
			this.story = JSON.parse(res);
			const storyDate = new Date(this.story.date);
			const formattedDate = storyDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
			});
			this.story.date = formattedDate;
			this.moodService
				.getAverageStoryMood(this.storyId)
				.subscribe((res) => {
					this.mood = JSON.parse(res);
					this.store.dispatch(toggleLoading({ status: false }));
				}, (err) => {
					this.mood = <StoryDrug>{};
					this.store.dispatch(toggleLoading({ status: false }));
				});
		});

	}

	upvoteStory(vote: StoryVote) {
		this.voteService.addStoryVote(vote).subscribe((res) => {
			this.story.votes = this.story.votes + 1;
		});
	}

	openAddComment() {
		this.store.dispatch(setParentId({ parentId: 0 }));
		this.store.dispatch(setStoryContent({ content: this.story.journal }))
		this.store.dispatch(setParentCommentContent({ content: "" }))

		const dialogRef = this.dialog.open(AddCommentComponent, {
			width: '600px',
			height: '400px',
		});

		dialogRef.componentInstance.onError.subscribe((event: any) => {
			dialogRef.close();

			const errorDialogRef = this.dialog.open(ModalComponent, {
				width: '500px',
				height: '500px',
			});

			errorDialogRef.componentInstance.message = "Unable to add comment. Please try again.";
			errorDialogRef.componentInstance.onClose().subscribe((event: any) => {
				errorDialogRef.close();
			});
			errorDialogRef.componentInstance.buttonText = "Close";
		});

		dialogRef.componentInstance.onClose.subscribe(async (event: any) => {
			window.location.reload();
			dialogRef.close();
		});
	}

	deleteStory(storyId: number) {
		this.store.dispatch(toggleLoading({ status: true }));
		this.storyService.deleteStory(storyId).subscribe((res) => {
			console.log(storyId);
			const filteredUserStories = this.userStories.filter((story) => story.storyId !== storyId);
			const filteredExploreStories = this.exploreStories.filter((story) => story.storyId !== storyId);
			this.store.dispatch(setUserStories({ stories: filteredUserStories }));
			this.store.dispatch(setExploreStories({ stories: filteredExploreStories }));
			setTimeout(() => {
				this.moodService.getAverageUserMood(this.userId).subscribe((mood: any) => {
					this.store.dispatch(setAverageMood({ mood: JSON.parse(mood) }));
					this.store.dispatch(toggleLoading({ status: false }));
					alert('Story deleted successfully');
					this.router.navigateByUrl('/user-stories');
				}, (err) => {
					this.store.dispatch(toggleLoading({ status: false }));
					this.store.dispatch(setAverageMood({ mood: <StoryDrug>{} }));
					alert('Story deleted successfully.');
					this.router.navigateByUrl('/profile');
				})
			}, 200);
			// this.store.dispatch(toggleLoading({status: false}));

		}, (err) => {
			this.store.dispatch(toggleLoading({ status: false }));
			alert('Unable to delete story. Please try again.');
		})
	}

	goBack() {
		window.history.back();
	}

	ngOnInit(): void {

		this.store.select(getSharedState).subscribe((state) => {
			this.userStories = [...state.userStories];
			this.exploreStories = [...state.exploreStories];
			this.userId = state.userId;
		})

		this.route.queryParams.subscribe((params) => {
			this.storyId = parseInt(params['storyId']);
			this.getStory();
		});
		this.store.dispatch(setStoryId({ storyId: this.storyId }));
		this.storyService.isUserStory(this.storyId, this.userId).subscribe((res: any) => {
			this.isUserStory = JSON.parse(res).result;
			this.store.dispatch(setIsUserStory({ isUserStory: this.isUserStory }))
		});
	}
}
