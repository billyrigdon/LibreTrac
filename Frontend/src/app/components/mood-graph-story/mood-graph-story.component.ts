import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MoodService } from 'src/app/services/mood.service';
import { AppState } from 'src/app/store/app.state';
import { getSharedState } from 'src/app/store/shared/selectors/shared.selector';
import { GraphBar } from 'src/app/types/graph';
import { Story, StoryDrug } from 'src/app/types/story';

@Component({
	selector: 'app-mood-graph-story',
	templateUrl: './mood-graph-story.component.html',
	styleUrls: ['./mood-graph-story.component.scss'],
})
export class MoodGraphStoryComponent implements OnInit, AfterViewInit {
	@Input() mood: StoryDrug;
	@Input() userId?: number;
	@Input() storyId?: number;
	@Input() isMonth: boolean = false;
	moodBars: Array<GraphBar>;
	
	
	constructor(private moodService: MoodService, private store: Store<AppState>) {
		this.mood = <StoryDrug>{};
		this.moodBars = Array<GraphBar>();
	}

	ngAfterViewInit(): void {
		// this.buildGraph(this.mood);z
	}

	buildGraph(mood: StoryDrug) {
		this.moodBars = [
			{
				value: mood.energy ? mood.energy : 5,
				color: '#b2a2c7', 
				size: '',
				legend: 'Energy',
			},
			
			{
				value: mood.happiness ? mood.happiness : 5,
				color: '#8c82a6',
				size: '',
				legend: 'Happiness',
			},

			{
				value: mood.creativity ? mood.creativity : 5,
				color: '#685e85',
				size: '',
				legend: 'Creativity',
			},
			{
				value: mood.focus ? mood.focus : 5,
				color: '#4e415f',
				size: '',
				legend: 'Focus',
			},
			
			{
				value: mood.irritability ? mood.irritability : 5,
				color: '#3b3148',
				size: '',
				legend: 'Irritability',
			},
			{
				value: mood.anxiety ? mood.anxiety : 5,
				color: '#271f2e',
				size: '',
				legend: 'Anxiety',
			}
		];
		this.moodBars.forEach((bar) => {
			bar.size = (bar.value * 9.7) + 'vw';
		});
	}

  	ngOnInit(): void {
      this.store.select(getSharedState).subscribe((state) => {
        this.mood = state.storyMood;
        this.buildGraph(this.mood);
      }
    );
	}
}
