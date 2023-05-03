import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { API_IP } from './url';
const API_URL = API_IP + 'api/protected';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let VoteService = class VoteService {
    constructor(http) {
        this.http = http;
    }
    addStoryVote(vote) {
        return this.http.post(API_URL + '/story/vote/add', vote, headers);
    }
    removeStoryVote(vote) {
        return this.http.post(API_URL + '/story/vote/remove', vote, headers);
    }
    addCommentVote(vote) {
        return this.http.post(API_URL + '/story/comment/vote/add', vote, headers);
    }
    removeCommentVote(vote) {
        return this.http.post(API_URL + '/story/comment/vote/remove', vote, headers);
    }
};
VoteService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], VoteService);
export { VoteService };
//# sourceMappingURL=vote.service.js.map