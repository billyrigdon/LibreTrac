import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Story } from '../types/story';
import { API_IP } from './url';

const API_URL = API_IP + 'api';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
	providedIn: 'root',
})
export class StoryService {
	constructor(private http: HttpClient) { }

	getUserStories(userId: number): Observable<any> {
		return this.http.get(
			API_URL + '/protected/story/user?userId=' + userId.toString(),
			{
				responseType: 'text',
			}
		);
	}

	addUserStory(story: Story) {
		return this.http.post(
			API_URL + '/protected/story/create',
			story,
			headers
		);
	}

	updateUserStory(story: Story) {
		return this.http.post(
			API_URL + '/protected/story/update',
			story,
			headers
		);
	}

	getAllStories(pageNumber: number) {
		return this.http.get(API_URL + '/public/story/get?page=' + pageNumber, {
			responseType: 'text',
		});
	}

	getFilteredStories(pageNumber: number, drugX: string, drugY: string) {
		return this.http.get(API_URL + '/public/story/get?page=' + pageNumber + "&drugX=" + drugX + "&drugY=" + drugY, {
			responseType: 'text',
		});
	}

	getStory(storyId: number) {
		return this.http.get(API_URL + '/public/story?storyId=' + storyId, {
			responseType: 'text',
		});
	}

	deleteStory(storyId: number) {
		return this.http.delete(
			API_URL + '/protected/story/delete?storyId=' + storyId,
			{ responseType: 'text' }
		);
	}

	isUserStory(storyId: number, userId: number) {
		return this.http.get(API_URL + '/protected/story/user/isUserStory?userId=' + userId + "&storyId=" + storyId,
			{ responseType: 'text' })
	}
}
