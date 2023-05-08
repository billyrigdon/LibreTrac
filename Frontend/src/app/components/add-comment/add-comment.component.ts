import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommentService } from 'src/app/services/comment.service';
import { AppState } from 'src/app/store/app.state';
import { toggleAddComment } from 'src/app/store/comments/comments.actions';
import { getAddCommentsOpen, getAddCommentState } from 'src/app/store/comments/comments.selector';
import { StoryComment } from 'src/app/types/comment';

@Component({
	selector: 'app-add-comment',
	templateUrl: './add-comment.component.html',
	styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent implements OnInit {
	storyId: number;
	parentCommentId: number;
	storyContent: string;
	parentCommentContent: string;
	userId: number;
	addCommentOpen: Observable<boolean>;
	form: UntypedFormGroup;
	commentForEdit?: StoryComment;
	@Output() onClose = new EventEmitter();
	@Output() onError = new EventEmitter();
	
	constructor(
		private store: Store<AppState>,
		private commentService: CommentService,
		private formBuilder: UntypedFormBuilder,
	) {
		this.addCommentOpen = this.store.select(getAddCommentsOpen);
		this.form = this.formBuilder.group({
			content: ['', Validators.required, Validators.minLength(1)],
		});
		this.storyId = 0;
		this.parentCommentContent = "";
		this.storyContent = "";
		this.parentCommentId = 0;
		this.userId = 0;
	}

	addComment() {
		if (this.form.invalid) {
			return;
		}
		let content = this.form.value.content;

		this.commentService
			.addComment({
				storyId: this.storyId,
				parentCommentId: this.parentCommentId,
				userId: this.userId,
				content: content,
			})
			.subscribe((res) => {
				this.onClose.emit();
			},
			(err) => {
				this.onError.emit();
			});
	}


	updateComment(comment: StoryComment) {

		if (this.form.invalid) {
			return;
		}

		let content = this.form.value.content;

		this.commentService
			.updateComment({
				commentId: comment.commentId,
				storyId: comment.storyId,
				parentCommentId: comment.parentCommentId,
				userId: this.userId,
				content: content,
				username: comment.username,
				updatedAt: comment.updatedAt,
				votes: comment.votes,
				dateCreated: comment.dateCreated,
			})
			.subscribe((res) => {
				this.onClose.emit();
			},
			(err) => {
				this.onError.emit();
			});
	}

	
	closeAddComment() {
		this.onClose.emit();
	}

	ngOnInit(): void {
		const OP_USER_ID = 2;
		
		this.store.select(getAddCommentState).subscribe((res) => {
			this.parentCommentContent = res.parentCommentContent;
			this.parentCommentId = res.parentCommentId;
			this.storyId = res.storyId;
			this.storyContent = res.storyContent;
			this.userId = res.isUserStory ? OP_USER_ID : JSON.parse(localStorage.getItem('userProfile') || '').userId  
		})

		if (this.commentForEdit) {
			this.form.setValue({
				content: this.commentForEdit.content,
			});
		}
		
	}
}
