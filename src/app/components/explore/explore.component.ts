import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import axios from 'axios';
import { Observable, filter } from 'rxjs';
import { DrugService } from 'src/app/services/drug.service';
import { StorageService } from 'src/app/services/storage.service';
import { StoryService } from 'src/app/services/story.service';
import { VoteService } from 'src/app/services/vote.service';
import { AppState } from 'src/app/store/app.state';
import { toggleLoading } from 'src/app/store/shared/actions/shared.actions';
import { getAuthState, getUserId } from 'src/app/store/shared/selectors/shared.selector';
import { Drug } from 'src/app/types/drug';
import { StoryDrug } from 'src/app/types/story';
import { StoryVote } from 'src/app/types/vote';

@Component({
	selector: 'app-explore',
	templateUrl: './explore.component.html',
	styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
	stories: Array<StoryDrug>;
	pageNumber: number;
	drugX = '';
	drugY = '';
	drugXName = '';
	drugYName = '';
	drugXSummary = '';
	drugYSummary = '';
	currentUrl = '';
	summaries: Array<{summary: string, name: string}> = [];
	isLoggedIn: Observable<boolean>;
	constructor(
		private storyService: StoryService,
		private voteService: VoteService,
		private store: Store<AppState>,
		private router: Router,
		private storageService: StorageService,
		private route: ActivatedRoute,
		private drugService: DrugService
	) {
		this.stories = Array<StoryDrug>();
		this.isLoggedIn = this.store.select(getAuthState);
		this.pageNumber = 0;
		this.currentUrl = location.toString()
	}

	setStoriesOnScroll(res: string) {
		const newStories = JSON.parse(res)
		if (newStories) {
			this.stories.push(...newStories);
		}
		for (let i = 0; i < this.stories.length; i++) {
			const storyDate = new Date(this.stories[i].date);
			const formattedDate = storyDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
			this.stories[i].date = formattedDate;
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
		const jsonStories = JSON.parse(res);
		this.stories = jsonStories ? jsonStories : [];
		for (let i = 0; i < this.stories.length; i++) {
			const storyDate = new Date(this.stories[i].date);
			const formattedDate = storyDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',

			});
			this.stories[i].date = formattedDate;
		}
	}

	async getSummary(name: string, id: number, isDrug: boolean): Promise<any> {
		const apiEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";
		const encodedTitle = encodeURI(name);
		const url = `${apiEndpoint}${encodedTitle}`;
		
		try {
		  const response = await axios.get(url);
		  const summary = response.data.extract;
		//   this.openBottomSheetInfo(summary, id, isDrug);
		  return { contents: summary };
		} catch (error) {
			// this.openBottomSheetInfo('No information found', id, isDrug);
		  return null;
		}
	}


	ngOnInit(): void {
		this.store.dispatch(toggleLoading({status: true}));



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
							this.drugXSummary = res.contents;
							this.summaries.push({summary: this.drugXSummary, name: this.drugXName});
						});
					});
				}

				if (this.drugY) {
					this.drugService.getDrug(parseInt(this.drugY, 10)).subscribe((res: any) => {
						this.drugYName = res.name;
						this.getSummary(this.drugYName, parseInt(this.drugY, 10), true).then((res) => {
							this.drugYSummary = res.contents;
							this.summaries.push({summary: this.drugYSummary, name: this.drugYName})
						});
					});

				}

				this.storyService.getFilteredStories(this.pageNumber, this.drugX, this.drugY).subscribe((res) => {
					this.setStoriesInit(res)
					this.store.dispatch(toggleLoading({status: false}));
				}, (err) => {
					this.store.dispatch(toggleLoading({status: false}));
					// alert('No search results found');
				});
			}
		});

		if (!this.drugX && !this.drugY) {
			this.storyService.getAllStories(this.pageNumber).subscribe((res) => {
				this.setStoriesInit(res)
				this.store.dispatch(toggleLoading({status: false}));
			}, (err) => {
				this.store.dispatch(toggleLoading({status: false}));
				// alert('No search results found');
			});
		}

		// this.router.events.subscribe(event => {
		// 	console.log(event);
		// 	if (event instanceof NavigationStart) {
		// 		if (event.url.toString().includes(this.currentUrl) && this.currentUrl.length < event.url.toString().length) 
		// 		if (this.currentUrl.length < event.url.toString().length) {
		// 			window.location.reload();
		// 		}
		// 	}
		// });

		// this.router.events.pipe(
		// 	filter((event): event is NavigationStart => event instanceof NavigationStart)
		// ).subscribe((event: NavigationStart) => {
		// 	const urlTree = this.router.parseUrl(event.url)
		// 	const queryParams = urlTree.queryParams;
		// 	const queryKeys = Object.keys(queryParams);
		// 	// if (queryKeys.length > 0) {
		// 	// 	window.location.reload();
		// 	// }
		// })
	}
}