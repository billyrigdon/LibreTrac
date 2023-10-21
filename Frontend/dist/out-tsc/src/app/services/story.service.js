import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IP } from './url';
const API_URL = API_IP + 'api';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let StoryService = class StoryService {
    constructor(http) {
        this.http = http;
    }
    getUserStories(userId) {
        return this.http.get(API_URL + '/protected/story/user?userId=' + userId.toString(), {
            responseType: 'text',
        });
    }
    addUserStory(story) {
        return this.http.post(API_URL + '/protected/story/create', story, headers);
    }
    getAllStories(pageNumber) {
        return this.http.get(API_URL + '/protected/story/get?page=' + pageNumber, {
            responseType: 'text',
        });
    }
    getFilteredStories(pageNumber, drugX, drugY) {
        return this.http.get(API_URL + '/public/story/get?page=' + pageNumber + "&drugX=" + drugX + "&drugY=" + drugY, {
            responseType: 'text',
        });
    }
    getStory(storyId) {
        return this.http.get(API_URL + '/public/story?storyId=' + storyId, {
            responseType: 'text',
        });
    }
    deleteStory(storyId) {
        return this.http.delete(API_URL + '/protected/story/delete?storyId=' + storyId, { responseType: 'text' });
    }
    isUserStory(storyId, userId) {
        return this.http.get(API_URL + '/protected/story/user/isUserStory?userId=' + userId + "&storyId=" + storyId, { responseType: 'text' });
    }
};
StoryService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], StoryService);
export { StoryService };
//# sourceMappingURL=story.service.js.map