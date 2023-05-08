import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
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
	selector: 'app-stories',
	templateUrl: './stories.component.html',
	styleUrls: ['./stories.component.scss'],
})
export class StoriesComponent implements OnInit {
	@Input() stories!: Array<StoryDrug>;
	@Output() onScroll = new EventEmitter();
	distance: number;
	throttle: number;
	private startY: number | null = null;
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

	

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.startY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const endY = event.changedTouches[0].clientY;
    if (this.startY !== null && this.startY < endY && this.scrollableElementRef.nativeElement.scrollTop === 0) {
      const swipeDistance = endY - this.startY;
      const threshold = 100; // Set a threshold to consider it as a swipe down

      if (swipeDistance > threshold) {
        console.log('Swipe down at the top of the container');
        window.location.reload();
      }
    }
    this.startY = null;
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
		this.router.events
		.pipe(
			filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd)
		  )
      .subscribe((event) => {
        const currentRoute = this.router.url;
		console.log(currentRoute);
        if (currentRoute.includes('/explore')) {
          if (event instanceof NavigationStart) {
              const scrollPosition = this.scrollableElementRef.nativeElement.scrollTop;
              this.scrollPositionService.saveScrollPosition(currentRoute, scrollPosition);
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
