import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_IP } from './url';
const API_URL = API_IP + 'api';
const headers = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
let NotificationService = class NotificationService {
    constructor(http, store) {
        this.http = http;
        this.store = store;
    }
    getUserNotifications(userId) {
        return this.http.get(API_URL + '/protected/notifications/get?userId=' + userId.toString());
    }
    getNotificationStories(userId) {
        return this.http.get(API_URL + '/protected/notifications/get/stories?userId=' + userId.toString());
    }
    clearNotifications(userId, storyId) {
        return this.http.get(API_URL + '/protected/notifications/viewed?userId=' + userId.toString() + '&storyId=' + storyId.toString());
    }
};
NotificationService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], NotificationService);
export { NotificationService };
//# sourceMappingURL=notification.service.js.map