import { Component, Input, OnInit, Output } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageService } from 'src/app/services/storage.service';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';
import { EventEmitter } from '@angular/core';

@Component({
	selector: 'app-stories',
	templateUrl: './stories.component.html',
	styleUrls: ['./stories.component.scss'],
})
export class StoriesComponent implements OnInit {
	@Input() stories!: Array<StoryDrug>;
	@Output() onScroll = new EventEmitter();
	distance: number;
	throttle: number;
	@Input() summaries: Array<{summary: string, name: string, url: string}> = [];
	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private router: Router,
		private storageService: StorageService
	) {
		this.distance = 0.1;
		this.throttle = 0;
	}

	onPageScroll() {
		console.log("scrolled")
		this.onScroll.emit()
	}

	openStory(storyId: number) {
		// this.store.dispatch(setStoryId({ storyId: storyId }));
		this.router.navigateByUrl('/story?storyId=' + storyId.toString());
	}

	getDateString(date: string) {
		const localDateObj = new Date(date);
		const localTimezoneOffsetMs = localDateObj.getTimezoneOffset() * 60 * 1000;
		const utcTimestampMs = localDateObj.getTime() + localTimezoneOffsetMs;
		const utcDateObj = new Date(utcTimestampMs);
		const options = { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' };
		const utcDateString = localDateObj.toLocaleDateString('UTC');
		return utcDateString;
	}

	ngOnInit(): void {
	}
}
