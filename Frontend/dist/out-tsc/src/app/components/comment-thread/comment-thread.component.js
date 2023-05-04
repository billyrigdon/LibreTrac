import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let CommentThreadComponent = class CommentThreadComponent {
    constructor() {
    }
    ngOnInit() {
    }
};
__decorate([
    Input()
], CommentThreadComponent.prototype, "comments", void 0);
__decorate([
    Input()
], CommentThreadComponent.prototype, "parentCommentId", void 0);
__decorate([
    Input()
], CommentThreadComponent.prototype, "comment", void 0);
__decorate([
    Input()
], CommentThreadComponent.prototype, "userId", void 0);
CommentThreadComponent = __decorate([
    Component({
        selector: 'app-comment-thread',
        templateUrl: './comment-thread.component.html',
        styleUrls: ['./comment-thread.component.scss'],
    })
], CommentThreadComponent);
export { CommentThreadComponent };
//# sourceMappingURL=comment-thread.component.js.map