import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommentService } from 'src/app/services/comment.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import {
	setComments,
	setIsUserStory,
	setParentCommentContent,
	setParentId,
	setStoryContent,
	toggleAddComment,
} from 'src/app/store/comments/comments.actions';
import { getAddCommentState, getCommentsState } from 'src/app/store/comments/comments.selector';
import { StoryComment } from 'src/app/types/comment';
import { CommentVote } from 'src/app/types/vote';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import {  MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';

@Component({
	selector: 'app-comment',
	templateUrl: './comment.component.html',
	styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit, AfterViewInit {
	@Input() storyComment!: StoryComment;
	@Input() comments!: Array<StoryComment>;
	@Input() userId!: number;
	comment!: StoryComment;
	storyId = 0;
	
	canDelete = false;
	isUserStory: any;
	storyService: any;
	constructor(
		private voteService: VoteService,
		private store: Store<AppState>,
		private commentService: CommentService,
		private dialog: MatDialog
	) {
		this.comment = {...this.storyComment};
	 }

	upvote(vote: CommentVote) {
		// this.voteService.addCommentVote(vote).subscribe((res) => {
		// 	this.comment.votes = this.comment.votes + 1;
		// });
		this.voteService.toggleCommentVote(vote).subscribe((res: any) => {
			this.comment.votes = res.votes.length;
		});
	}

	removeVote(vote: CommentVote) {
		this.voteService.removeCommentVote(vote).subscribe((res) => {
			this.comment.votes = this.comment.votes - 1;
		});
	}

	ngAfterViewInit(): void {
		this.comment = {...this.storyComment};
		const OP_USER_ID = 2;
		this.store.select(getCommentsState).subscribe((state) => {
			this.storyId = state.storyId;
			this.canDelete  = (state.isUserStory && this.comment.userId === OP_USER_ID) || (this.comment.userId === this.userId);
		})
	}

	deleteComment(commentId: number, storyId: number) {
		this.commentService.deleteComment(commentId, storyId).subscribe((res) => {
			this.commentService
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

	openAddComment(parentCommentId: number) {
		this.store.dispatch(setParentId({ parentId: parentCommentId }));
		this.store.dispatch(setParentCommentContent({ content: this.comment.content }));
		this.store.dispatch(setStoryContent({ content: "" }));
		
		const dialogConfig = new MatDialogConfig();
		dialogConfig.width = '100vw';
		dialogConfig.height = '100%';
		dialogConfig.maxWidth = '100vw';
		dialogConfig.maxHeight = '100%';

		const dialogRef = this.dialog.open(AddCommentComponent,dialogConfig)
		
		dialogRef.componentInstance.onError.subscribe((event: any) => {
			dialogRef.close();
			
			const errorDialogRef = this.dialog.open(ModalComponent, {
				width: '500px',
				height: '500px',
			});

			errorDialogRef.componentInstance.message = "Unable to add comment. Please try again.";
			errorDialogRef.componentInstance.onClose.subscribe((event: any) => {
				errorDialogRef.close();
			});
			errorDialogRef.componentInstance.buttonText = "Close";
		});

		dialogRef.componentInstance.onClose.subscribe((event: any) => {
			this.commentService
				.getComments(this.storyId)
				.subscribe((res: Array<StoryComment>) => {
					if (res) {
						this.store.dispatch(setComments({ comments: res.sort((a, b) => b.votes - a.votes) }));
					} else {
						this.store.dispatch(setComments({ comments: [] }));
					}
					if (!this.isUserStory) {
						this.storyService.isUserStory(this.storyId, this.userId).subscribe((res: any) => {
							this.isUserStory = JSON.parse(res).result;
							this.store.dispatch(setIsUserStory({ isUserStory: this.isUserStory }))
							this.store.dispatch(toggleLoading({ status: false }));
						});
					} else {
						this.store.dispatch(toggleLoading({ status: false }));
					}
				},
					(err) => {
						this.store.dispatch(toggleLoading({ status: false }));
						this.store.dispatch(setComments({ comments: [] }));
					});
			dialogRef.close();
		});
	}

	openUpdateComment(comment: StoryComment) {
		
		const dialogConfig = new MatDialogConfig();
		dialogConfig.width = '100vw';
		dialogConfig.height = '100%';
		dialogConfig.maxWidth = '100vw';
		dialogConfig.maxHeight = '100%';

		const dialogRef = this.dialog.open(AddCommentComponent,dialogConfig)
		
		dialogRef.componentInstance.commentForEdit = comment;

		dialogRef.componentInstance.onError.subscribe((event: any) => {
			dialogRef.close();
			
			const errorDialogRef = this.dialog.open(ModalComponent, {
				width: '500px',
				height: '500px',
			});

			errorDialogRef.componentInstance.message = "Unable to add comment. Please try again.";
			errorDialogRef.componentInstance.onClose.subscribe((event: any) => {
				errorDialogRef.close();
			});
			errorDialogRef.componentInstance.buttonText = "Close";
		});

		dialogRef.componentInstance.onClose.subscribe((event: any) => {
			this.commentService
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
			dialogRef.close();
		});
	}

	ngOnInit(): void {
		
	}
}
