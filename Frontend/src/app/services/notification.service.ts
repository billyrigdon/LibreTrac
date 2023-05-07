import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { setNotifications } from '../store/comments/comments.actions';
import { CommentNotification } from '../types/comment';
import { NotificationStory, Story } from '../types/story';
import { API_IP } from './url';

const API_URL = API_IP + 'api';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
	providedIn: 'root',
})
export class NotificationService {
	constructor(private http: HttpClient, private store: Store<AppState>) {}


	getUserNotifications(userId: number): Observable<CommentNotification[]> {
		return this.http.get<CommentNotification[]>(API_URL + '/protected/notifications/get?userId=' + userId.toString());
	}

	getNotificationStories(userId: number): Observable<NotificationStory[]> {
		return this.http.get<NotificationStory[]>(
			API_URL + '/protected/notifications/get/stories?userId=' + userId.toString()
		);
	}

	clearNotifications(userId: number,storyId: number): Observable<any> {
		return this.http.get(
			API_URL +'/protected/notifications/viewed?userId=' + userId.toString() + '&storyId=' + storyId.toString()
		)
	}

}