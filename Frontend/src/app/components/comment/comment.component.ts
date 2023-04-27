import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommentService } from 'src/app/services/comment.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import {
	setParentCommentContent,
	setParentId,
	setStoryContent,
	toggleAddComment,
} from 'src/app/store/comments/comments.actions';
import { getAddCommentState } from 'src/app/store/comments/comments.selector';
import { StoryComment } from 'src/app/types/comment';
import { CommentVote } from 'src/app/types/vote';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import {  MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';

@Component({
	selector: 'app-comment',
	templateUrl: './comment.component.html',
	styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
	@Input() comment!: StoryComment;
	@Input() comments!: Array<StoryComment>;
	@Input() userId!: number;
	canDelete = false;
	constructor(
		private voteService: VoteService,
		private store: Store<AppState>,
		private commentService: CommentService,
		private dialog: MatDialog
	) { }

	upvote(vote: CommentVote) {
		this.voteService.addCommentVote(vote).subscribe((res) => {
			this.comment.votes = this.comment.votes + 1;
		});
	}

	removeVote(vote: CommentVote) {
		this.voteService.removeCommentVote(vote).subscribe((res) => {
			this.comment.votes = this.comment.votes - 1;
		});
	}

	deleteComment(commentId: number, storyId: number) {
		this.commentService.deleteComment(commentId, storyId).subscribe((res) => {
			window.location.reload();
		});
	}

	openAddComment(parentCommentId: number) {
		this.store.dispatch(setParentId({ parentId: parentCommentId }));
		this.store.dispatch(setParentCommentContent({ content: this.comment.content }));
		this.store.dispatch(setStoryContent({ content: "" }));
		
		const dialogRef = this.dialog.open(AddCommentComponent, {
			width: '500px',
			height: '500px',
		});
		
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
			window.location.reload();
			dialogRef.close();
		});
	}


	ngOnInit(): void {
		const OP_USER_ID = 2;
		this.store.select(getAddCommentState).subscribe((state) => {
			this.canDelete = (state.isUserStory && this.comment.userId === 2) || (this.comment.userId === this.userId);
		})
	}
}
