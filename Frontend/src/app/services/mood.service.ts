import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
export class MoodService {
	constructor(private http: HttpClient) {}

	getAverageUserMood(userId: number) {
		return this.http.get(
			API_URL + '/protected/user/mood/get?userId=' + userId,
			{
				responseType: 'text',
			}
		);
	}

	getAverageUserMoodForMonth(userId: number) {
		return this.http.get(
			API_URL + '/protected/user/mood/get/month?userId=' + userId,
			{
				responseType: 'text',
			}
		);
	}

	getAverageStoryMood(storyId: number) {
		return this.http.get(
			API_URL + '/protected/mood/get?storyId=' + storyId,
			{
				responseType: 'text',
			}
		);
	}
}
