import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { API_IP } from './url';
const API_URL = API_IP + 'api';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let MoodService = class MoodService {
    constructor(http) {
        this.http = http;
    }
    getAverageUserMood(userId) {
        return this.http.get(API_URL + '/protected/user/mood/get?userId=' + userId, {
            responseType: 'text',
        });
    }
    getAverageStoryMood(storyId) {
        return this.http.get(API_URL + '/public/mood/get?storyId=' + storyId, {
            responseType: 'text',
        });
    }
};
MoodService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], MoodService);
export { MoodService };
//# sourceMappingURL=mood.service.js.map