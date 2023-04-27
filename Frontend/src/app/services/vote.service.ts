import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoryVote, CommentVote } from '../types/vote';
import { API_IP } from './url';

const API_URL = API_IP + 'api/protected';
const headers = {
	headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
	providedIn: 'root',
})
export class VoteService {
	constructor(private http: HttpClient) {}

	addStoryVote(vote: StoryVote) {
		return this.http.post(API_URL + '/story/vote/add', vote, headers);
	}

	removeStoryVote(vote: StoryVote) {
		return this.http.post(API_URL + '/story/vote/remove', vote, headers);
	}

	addCommentVote(vote: CommentVote) {
		return this.http.post(
			API_URL + '/story/comment/vote/add',
			vote,
			headers
		);
	}

	removeCommentVote(vote: CommentVote) {
		return this.http.post(
			API_URL + '/story/comment/vote/remove',
			vote,
			headers
		);
	}
}
