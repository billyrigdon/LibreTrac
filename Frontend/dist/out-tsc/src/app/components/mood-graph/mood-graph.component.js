import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let MoodGraphComponent = class MoodGraphComponent {
    constructor(moodService) {
        this.moodService = moodService;
        this.mood = {};
        this.moodBars = Array();
    }
    buildGraph(mood) {
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
            //Get the rem value to determine bar height by multiplying
            //by the max height and dividing by the max value of 10
            bar.size = (bar.value * 9.7) + 'vw';
        });
    }
    ngOnInit() {
        if (this.userId) {
            this.moodService
                .getAverageUserMood(this.userId)
                .subscribe((res) => {
                this.mood = JSON.parse(res);
                this.buildGraph(this.mood);
            }, (err) => {
                this.mood = {};
                this.buildGraph(this.mood);
            });
        }
        else if (this.storyId != null) {
            this.moodService
                .getAverageStoryMood(this.storyId)
                .subscribe((res) => {
                this.mood = JSON.parse(res);
                this.buildGraph(this.mood);
            }, (err) => {
                this.mood = {};
                this.buildGraph(this.mood);
            });
        }
    }
};
__decorate([
    Input()
], MoodGraphComponent.prototype, "userId", void 0);
__decorate([
    Input()
], MoodGraphComponent.prototype, "storyId", void 0);
MoodGraphComponent = __decorate([
    Component({
        selector: 'app-mood-graph',
        templateUrl: './mood-graph.component.html',
        styleUrls: ['./mood-graph.component.scss'],
    })
], MoodGraphComponent);
export { MoodGraphComponent };
//# sourceMappingURL=mood-graph.component.js.map