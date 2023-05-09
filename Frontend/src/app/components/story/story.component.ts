import { formatDate } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';
import { ActivatedRoute, Router } from '@angular/router';
import {
	setComments,
	setIsUserStory,
	setParentCommentContent,
	setParentId,
	setStoryContent,
	setStoryId,
} from 'src/app/store/comments/comments.actions';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { setAverageMood, setExploreStories, setStoryMood, setStoryToEdit, setUserStories, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { MoodService } from 'src/app/services/mood.service';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { CommentService } from 'src/app/services/comment.service';
import { StoryComment } from 'src/app/types/comment';

@Component({
	selector: 'app-story',
	templateUrl: './story.component.html',
	styleUrls: ['./story.component.scss'],
})
export class StoryComponent implements OnInit, AfterViewInit {
	story: StoryDrug;
	mood: StoryDrug;
	storyId: number;
	userId: number;
	isUserStory: boolean;
	userStories: StoryDrug[] = [];
	exploreStories: StoryDrug[] = [];
	commentId?: number;
	private startY: number | null = null;
	@ViewChild('scrollableElement') scrollableElementRef!: ElementRef;

	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private moodService: MoodService,
		private commentsService: CommentService
	) {
		this.story = <StoryDrug>{};
		this.mood = <StoryDrug>{};
		this.storyId = 0;
		this.userId = 0;
		this.isUserStory = false;
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
				console.log('Swipe down at the top of the container');
				window.location.reload();
			}
		}
		this.startY = null;
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

	public scrollToElement(elementId: string, smoothScroll: boolean = true): void {
		const element = document.getElementById(elementId);

		if (element) {
			element.scrollIntoView({
				behavior: smoothScroll ? 'smooth' : 'auto',
				block: 'start',
				inline: 'nearest'
			});
		} else {
			console.warn(`Element with ID '${elementId}' not found.`);
		}
	}

	ngAfterViewInit() {
	
	}

	getStory() {
		this.store.dispatch(toggleLoading({ status: true }));
		this.storyService.getStory(this.storyId).subscribe((res) => {
			this.story = {...JSON.parse(res)};
			const storyDate = new Date(this.story.date);
			const formattedDate = storyDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
			});
			// this.getComments();
			this.story.date = formattedDate;
			this.moodService
				.getAverageStoryMood(this.storyId)
				.subscribe((res) => {

					// this.mood = JSON.parse(res);
					this.store.dispatch(setStoryMood({ mood: JSON.parse(res) }));


					//Get comments and sort them by upvotes
					this.commentsService
						.getComments(this.storyId)
						.subscribe((res: Array<StoryComment>) => {
							if (res) {
								this.store.dispatch(setComments({ comments: res.sort((a, b) => b.votes - a.votes) }));
							} else {
								this.store.dispatch(setComments({ comments: [] }));
							}
							this.store.dispatch(toggleLoading({ status: false }));
							setTimeout(() => {
							if (this.commentId) {
								this.scrollToElement('comment-number-' + this.commentId?.toString(), false);
							}
						}, 500);
						},
							(err) => {
								this.store.dispatch(toggleLoading({ status: false }));
								this.store.dispatch(setComments({ comments: [] }));
							});
					// this.store.dispatch(toggleLoading({ status: false }));
				}, (err) => {
					this.store.dispatch(setStoryMood({ mood: <StoryDrug>{} }));
					this.store.dispatch(toggleLoading({ status: false }));
				});
		});

	}

	upvoteStory(vote: StoryVote) {
		// this.voteService.addStoryVote(vote).subscribe((res) => {
		// 	this.story.votes = this.story.votes + 1;
		// });
		this.voteService.toggleStoryVote(vote).subscribe((res: any) => {
			this.story.votes = res.votes.length;
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
			// window.location.reload();
			dialogRef.close();
			this.commentsService
				.getComments(this.storyId)
				.subscribe((res: Array<StoryComment>) => {
					if (res) {
						this.store.dispatch(setComments({ comments: res.sort((a, b) => b.votes - a.votes) }));
					} else {
						this.store.dispatch(setComments({ comments: [] }));
					}
					this.store.dispatch(toggleLoading({ status: false }));
				},
					(err) => {
						this.store.dispatch(toggleLoading({ status: false }));
						this.store.dispatch(setComments({ comments: [] }));
					});
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
			if (state.userStories) {
				this.userStories = [...state.userStories];
			}
			this.exploreStories = [...state.exploreStories];
			this.userId = state.userId;
			this.mood = state.storyMood;
		})

		this.route.queryParams.subscribe((params) => {
			this.storyId = parseInt(params['storyId']);
			this.commentId = parseInt(params['commentId']);
			this.store.dispatch(setStoryId({ storyId: this.storyId }));
			this.getStory();
			this.storyService.isUserStory(this.storyId, this.userId).subscribe((res: any) => {
				this.isUserStory = JSON.parse(res).result;
				this.store.dispatch(setIsUserStory({ isUserStory: this.isUserStory }))
			});
		});


	}
}
