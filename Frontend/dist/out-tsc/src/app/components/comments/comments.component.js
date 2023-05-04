import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { getAddCommentsOpen, getParentCommentId, } from 'src/app/store/comments/comments.selector';
let CommentsComponent = class CommentsComponent {
    constructor(commentService, voteService, router, store, dialog) {
        this.commentService = commentService;
        this.voteService = voteService;
        this.router = router;
        this.store = store;
        this.dialog = dialog;
        this.comments = [];
        this.parentCommentId = 0;
        this.userId = 0;
        this.addCommentOpen = this.store.select(getAddCommentsOpen);
        this.isUserStory = false;
    }
    ngOnInit() {
        if (this.isUserStory) {
            const OP_USER_ID = 2;
            this.userId = OP_USER_ID;
        }
        //Get comments and sort them by upvotes
        this.commentService
            .getComments(this.storyId)
            .subscribe((res) => {
            if (res) {
                this.comments = res.sort((a, b) => b.votes - a.votes);
            }
            else {
                this.comments = [];
            }
        }, (err) => {
            this.comments = [];
        });
        if (localStorage.getItem('userProfile')) {
            this.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
        }
        //Get parentCommentId from store so that add-comment replies to the correct comment
        //The state is updated by the reply button for comments and stories
        this.store.select(getParentCommentId).subscribe((val) => {
            this.parentCommentId = val;
        });
    }
};
__decorate([
    Input()
], CommentsComponent.prototype, "storyId", void 0);
__decorate([
    Input()
], CommentsComponent.prototype, "isUserStory", void 0);
CommentsComponent = __decorate([
    Component({
        selector: 'app-comments',
        templateUrl: './comments.component.html',
        styleUrls: ['./comments.component.scss'],
    })
], CommentsComponent);
export { CommentsComponent };
//# sourceMappingURL=comments.component.js.map