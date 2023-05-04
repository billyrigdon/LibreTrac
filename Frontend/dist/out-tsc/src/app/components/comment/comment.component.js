import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { setParentCommentContent, setParentId, setStoryContent, } from 'src/app/store/comments/comments.actions';
import { getAddCommentState } from 'src/app/store/comments/comments.selector';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { ModalComponent } from '../modal/modal.component';
let CommentComponent = class CommentComponent {
    constructor(voteService, store, commentService, dialog) {
        this.voteService = voteService;
        this.store = store;
        this.commentService = commentService;
        this.dialog = dialog;
        this.canDelete = false;
    }
    upvote(vote) {
        this.voteService.addCommentVote(vote).subscribe((res) => {
            this.comment.votes = this.comment.votes + 1;
        });
    }
    removeVote(vote) {
        this.voteService.removeCommentVote(vote).subscribe((res) => {
            this.comment.votes = this.comment.votes - 1;
        });
    }
    deleteComment(commentId, storyId) {
        this.commentService.deleteComment(commentId, storyId).subscribe((res) => {
            window.location.reload();
        });
    }
    openAddComment(parentCommentId) {
        this.store.dispatch(setParentId({ parentId: parentCommentId }));
        this.store.dispatch(setParentCommentContent({ content: this.comment.content }));
        this.store.dispatch(setStoryContent({ content: "" }));
        const dialogRef = this.dialog.open(AddCommentComponent, {
            width: '500px',
            height: '500px',
        });
        dialogRef.componentInstance.onError.subscribe((event) => {
            dialogRef.close();
            const errorDialogRef = this.dialog.open(ModalComponent, {
                width: '500px',
                height: '500px',
            });
            errorDialogRef.componentInstance.message = "Unable to add comment. Please try again.";
            errorDialogRef.componentInstance.onClose.subscribe((event) => {
                errorDialogRef.close();
            });
            errorDialogRef.componentInstance.buttonText = "Close";
        });
        dialogRef.componentInstance.onClose.subscribe((event) => {
            window.location.reload();
            dialogRef.close();
        });
    }
    ngOnInit() {
        const OP_USER_ID = 2;
        this.store.select(getAddCommentState).subscribe((state) => {
            this.canDelete = (state.isUserStory && this.comment.userId === 2) || (this.comment.userId === this.userId);
        });
    }
};
__decorate([
    Input()
], CommentComponent.prototype, "comment", void 0);
__decorate([
    Input()
], CommentComponent.prototype, "comments", void 0);
__decorate([
    Input()
], CommentComponent.prototype, "userId", void 0);
CommentComponent = __decorate([
    Component({
        selector: 'app-comment',
        templateUrl: './comment.component.html',
        styleUrls: ['./comment.component.scss'],
    })
], CommentComponent);
export { CommentComponent };
//# sourceMappingURL=comment.component.js.map