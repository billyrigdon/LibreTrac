import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommentService } from 'src/app/services/comment.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { setParentCommentContent, setStoryContent, toggleAddComment } from 'src/app/store/comments/comments.actions';
import {
	getAddCommentsOpen,
	getCommentsState,
	getParentCommentId,
} from 'src/app/store/comments/comments.selector';
import { StoryComment, NewStoryComment } from 'src/app/types/comment';
import { CommentVote } from 'src/app/types/vote';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { ModalComponent } from '../modal/modal.component';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';

@Component({
	selector: 'app-comments',
	templateUrl: './comments.component.html',
	styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit, AfterViewInit {
	@Input() storyId!: number;
	isUserStory: boolean;
	parentCommentId: number;
	comments: Array<StoryComment>;
	addCommentOpen: Observable<boolean>;
	userId: number;
	@Input() commentId?: number;

	constructor(
		private commentService: CommentService,
		private voteService: VoteService,
		private router: Router,
		private store: Store<AppState>,
		private dialog: MatDialog,
	) {
		this.comments = [];
		this.parentCommentId = 0;
		this.userId = 0;
		this.addCommentOpen = this.store.select(getAddCommentsOpen);
		this.isUserStory = false;
	}


	// public scrollToElement(elementId: string, smoothScroll: boolean = true): void {
	// 	const element = document.getElementById(elementId);

	// 	if (element) {
	// 		element.scrollIntoView({
	// 			behavior: smoothScroll ? 'smooth' : 'auto',
	// 			block: 'start',
	// 			inline: 'nearest'
	// 		});
	// 	} else {
	// 		console.warn(`Element with ID '${elementId}' not found.`);
	// 	}
	// }

	ngAfterViewInit(): void {
		// if (this.commentId) {
			// console.log('test');
		console.log('init');
		// setTimeout(() => {
		// 	this.scrollToElement('comment-number-' + this.commentId?.toString(), false);
		// }, 1000);
		// }
	}
	

	ngOnInit(): void {
		// if (this.isUserStory) {
		// 	const OP_USER_ID = 2;
		// 	this.userId = OP_USER_ID;
		// }
		this.store.select(getSharedState).subscribe(state => {
			this.userId = state.userId;
		})
		this.store.select(getCommentsState).subscribe((state) => {
			this.isUserStory = state.isUserStory;
			this.storyId = state.storyId;
			this.comments = state.comments;
			// console.log('init');
			
		})

		// if (localStorage.getItem('userProfile')) {
		// 	this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
		// }
		//Get parentCommentId from store so that add-comment replies to the correct comment
		//The state is updated by the reply button for comments and stories
		this.store.select(getParentCommentId).subscribe((val) => {
			this.parentCommentId = val;
		});
	}
}
