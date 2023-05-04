import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { API_IP } from './url';
import { HttpHeaders } from '@angular/common/http';
const API_URL = API_IP + 'api';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let CommentService = class CommentService {
    constructor(http) {
        this.http = http;
    }
    getComments(storyId) {
        return this.http.get(API_URL + '/public/story/comment?storyId=' + storyId);
    }
    addComment(comment) {
        return this.http.post(API_URL + '/protected/story/comment/create', comment, headers);
    }
    deleteComment(commentId, storyId) {
        return this.http.delete(API_URL + '/protected/story/comment/delete?commentId=' + commentId + "&storyId=" + storyId);
    }
};
CommentService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], CommentService);
export { CommentService };
//# sourceMappingURL=comment.service.js.map