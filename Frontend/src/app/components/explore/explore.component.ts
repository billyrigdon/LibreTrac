import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import axios from 'axios';
import { Observable, Subscription, filter } from 'rxjs';
import { DrugService } from 'src/app/services/drug.service';
import { ScrollPositionService } from 'src/app/services/scroll-position-service';
import { StorageService } from 'src/app/services/storage.service';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { setExploreStories, toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getSharedState, getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { Drug } from 'src/app/types/drug';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';

@Component({
	selector: 'app-explore',
	templateUrl: './explore.component.html',
	styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
	@ViewChild('scrollableElement') scrollableElementRef!: ElementRef;
	stories: Array<StoryDrug>;
	pageNumber: number;
	drugX = '';
	drugY = '';
	drugXName = '';
	drugYName = '';
	drugXSummary = '';
	drugYSummary = '';
	currentUrl = '';
	summaries: Array<{ summary: string, name: string, url: string }> = [];
	isLoggedIn: Observable<boolean>;
	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private router: Router,
		private storageService: StorageService,
		private route: ActivatedRoute,
		private drugService: DrugService,
		private scrollPositionService: ScrollPositionService
	) {
		this.stories = Array<StoryDrug>();
		this.isLoggedIn = this.store.select(getAuthState);
		this.pageNumber = 0;
		this.currentUrl = location.toString();
	}

	setStoriesOnScroll(res: string) {
		let newStories = [...JSON.parse(res)]
		if (newStories) {
			for (let i = 0; i < newStories.length; i++) {
				const storyDate = new Date(newStories[i].date);
				const formattedDate = storyDate.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});
				newStories[i].date = formattedDate;
			}
			this.store.dispatch(setExploreStories({ stories: [...this.stories, ...newStories] }));
		}
	}


	onScroll() {
		if (this.drugX && this.drugY) {
			this.storyService.getFilteredStories(++this.pageNumber * 10, this.drugX, this.drugY).subscribe((res) => {
				this.setStoriesOnScroll(res)
			})
		}

		if (!this.drugX && !this.drugY) {
			this.storyService.getAllStories(++this.pageNumber * 10).subscribe((res) => {
				this.setStoriesOnScroll(res)
			})
		}
	}


	setStoriesInit(res: string) {
		if (res) {
			let jsonStories = JSON.parse(res) ? [...JSON.parse(res)] : [];
			// this.stories = jsonStories ? jsonStories : [];
			if (jsonStories) {
				for (let i = 0; i < jsonStories.length; i++) {
					const storyDate = new Date(jsonStories[i].date);
					const formattedDate = storyDate.toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',

					});
					jsonStories[i].date = formattedDate;
				}
				this.store.dispatch(setExploreStories({ stories: jsonStories }));
			} else {
				this.store.dispatch(setExploreStories({ stories: [] }));
			}
		}
	}

	async getSummary(name: string, id: number, isDrug: boolean): Promise<any> {
		const apiEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";
		const encodedTitle = encodeURI(name);
		const url = `${apiEndpoint}${encodedTitle}`;
		try {
			const response = await axios.get(url);
			const summary = response.data.extract;
			//   summary["url"] = response.data.content_urls.desktop.page;
			//   this.openBottomSheetInfo(summary, id, isDrug);
			return { contents: summary, url: response.data.content_urls.desktop.page };
		} catch (error) {
			// this.openBottomSheetInfo('No information found', id, isDrug);
			// return null;
		}
	}

	ngAfterViewInit(): void {

	}

	ngOnInit(): void {
		this.store.dispatch(toggleLoading({ status: true }));

		this.store.select(getSharedState).subscribe((state) => {
			this.stories = [...state.exploreStories];
		})

		this.isLoggedIn.subscribe((loggedIn) => {
			if (!loggedIn) {
				this.router.navigateByUrl('/login')
			}
		})

		this.route.queryParams.subscribe((params) => {
			this.drugX = params['drugX'];
			this.drugY = params['drugY'];
			console.log(params);

			if (this.drugX || this.drugY) {
				if (this.drugX) {
					this.drugService.getDrug(parseInt(this.drugX, 10)).subscribe((res: any) => {
						this.drugXName = res.name;
						this.getSummary(this.drugXName, parseInt(this.drugX, 10), true).then((res) => {
							this.drugXSummary = res?.contents;
							this.summaries.push({ summary: this.drugXSummary, name: this.drugXName, url: res?.url });
						}, (err) => {
							this.drugXSummary = 'No information found.'
						});
					});
				}

				if (this.drugY) {
					this.drugService.getDrug(parseInt(this.drugY, 10)).subscribe((res: any) => {
						this.drugYName = res.name;
						this.getSummary(this.drugYName, parseInt(this.drugY, 10), true).then((res) => {
							this.drugYSummary = res.contents;
							this.summaries.push({ summary: this.drugYSummary, name: this.drugYName, url: res.url })
						});
					});

				}

				this.storyService.getFilteredStories(this.pageNumber, this.drugX, this.drugY).subscribe((res) => {
					this.setStoriesInit(res)
					this.store.dispatch(toggleLoading({ status: false }));
				}, (err) => {
					this.store.dispatch(toggleLoading({ status: false }));
					// alert('No search results found');
				});
			}

			if (!this.drugX && !this.drugY) {
				this.storyService.getAllStories(this.pageNumber).subscribe((res) => {
					this.drugXName = '';
					this.drugYName = '';
					this.drugXSummary = '';
					this.drugYSummary = '';
					this.summaries = [];
					this.setStoriesInit(res)
					this.store.dispatch(toggleLoading({ status: false }));
				}, (err) => {
					this.store.dispatch(toggleLoading({ status: false }));
					// alert('No search results found');
				});
			}
		});



	}
}