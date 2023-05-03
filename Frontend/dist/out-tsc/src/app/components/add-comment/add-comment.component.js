import { __decorate } from "tslib";
import { Component, EventEmitter, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { getAddCommentsOpen, getAddCommentState } from 'src/app/store/comments/comments.selector';
let AddCommentComponent = class AddCommentComponent {
    constructor(store, commentService, formBuilder) {
        this.store = store;
        this.commentService = commentService;
        this.formBuilder = formBuilder;
        this.onClose = new EventEmitter();
        this.onError = new EventEmitter();
        this.addCommentOpen = this.store.select(getAddCommentsOpen);
        this.form = this.formBuilder.group({
            content: ['', Validators.required],
        });
        this.storyId = 0;
        this.parentCommentContent = "";
        this.storyContent = "";
        this.parentCommentId = 0;
        this.userId = 0;
    }
    addComment() {
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
        }, (err) => {
            this.onError.emit();
        });
    }
    closeAddComment() {
        this.onClose.emit();
    }
    ngOnInit() {
        const OP_USER_ID = 2;
        this.store.select(getAddCommentState).subscribe((res) => {
            this.parentCommentContent = res.parentCommentContent;
            this.parentCommentId = res.parentCommentId;
            this.storyId = res.storyId;
            this.storyContent = res.storyContent;
            this.userId = res.isUserStory ? OP_USER_ID : JSON.parse(localStorage.getItem('userProfile') || '').userId;
        });
    }
};
__decorate([
    Output()
], AddCommentComponent.prototype, "onClose", void 0);
__decorate([
    Output()
], AddCommentComponent.prototype, "onError", void 0);
AddCommentComponent = __decorate([
    Component({
        selector: 'app-add-comment',
        templateUrl: './add-comment.component.html',
        styleUrls: ['./add-comment.component.scss'],
    })
], AddCommentComponent);
export { AddCommentComponent };
//# sourceMappingURL=add-comment.component.js.map