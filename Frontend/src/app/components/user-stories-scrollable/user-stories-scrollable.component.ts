import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageService } from 'src/app/services/storage.service';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';
import { EventEmitter } from '@angular/core';
import { ScrollPositionService } from 'src/app/services/scroll-position-service';
import { debounceTime, filter } from 'rxjs';

@Component({
	selector: 'app-user-stories-scrollable',
	templateUrl: './user-stories-scrollable.component.html',
	styleUrls: ['./user-stories-scrollable.component.scss'],
})
export class UserStoriesScrollableComponent implements OnInit {
	@Input() stories!: Array<StoryDrug>;
	@Output() onScroll = new EventEmitter();
	distance: number;
	throttle: number;
	@Input() summaries: Array<{ summary: string, name: string, url: string }> = [];
	@ViewChild('scrollableElement') scrollableElementRef!: ElementRef;
	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private router: Router,
		private storageService: StorageService,
		private scrollPositionService: ScrollPositionService
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
		// this.router.events
		// 	.pipe(filter((event) => event instanceof NavigationEnd))
		// 	.subscribe(() => {
		// 		console.log(this.router.url + 'NavigationEnd');
		// 		if (this.router.url === '/explore' || this.router.url === '/user-stories') {
					
		// 			const currentRoute = this.router.url;
		// 			const savedScrollPosition = this.scrollPositionService.getScrollPosition(currentRoute);
		// 			console.log(this.router.url, savedScrollPosition)
		// 			if (savedScrollPosition) {
		// 				this.scrollableElementRef.nativeElement.scrollTop = savedScrollPosition;
		// 				this.scrollPositionService.saveScrollPosition(currentRoute, savedScrollPosition);
		// 			}
		// 		}
		// 	});

		// this.router.events
		// 	.pipe(filter((event) => event instanceof NavigationStart))
		// 	.subscribe(() => {
		// 		console.log(this.router.url + 'NavigationStart');
		// 		if (this.router.url === '/explore' || this.router.url === '/user-stories') {
		// 			setTimeout(() => {
		// 				const currentRoute = this.router.url;
		// 				const scrollPosition = this.scrollableElementRef.nativeElement.scrollTop;
		// 				console.log(this.router.url, scrollPosition)
		// 				this.scrollPositionService.saveScrollPosition(currentRoute, scrollPosition);
		// 			},100)
					
		// 		}
		// 	});
		this.router.events
		.pipe(
			filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd)
		  )
      .subscribe((event) => {
        const currentRoute = this.router.url;
		    console.log(currentRoute);
        if (currentRoute === '/user-stories') {
          if (event instanceof NavigationStart) {
            // setTimeout(() => {
              const scrollPosition = this.scrollableElementRef.nativeElement.scrollTop;
              this.scrollPositionService.saveScrollPosition(currentRoute, scrollPosition);
            // }, 100);
          } else if (event instanceof NavigationEnd) {
            this.restoreScrollPosition(currentRoute);
          }
        }
      });
	}

	private restoreScrollPosition(route: string): void {
		setTimeout(() => {
		  const savedScrollPosition = this.scrollPositionService.getScrollPosition(route);
		  if (savedScrollPosition && this.scrollableElementRef) {
			this.scrollableElementRef.nativeElement.scrollTop = savedScrollPosition;
		  }
		});
	  }

}
