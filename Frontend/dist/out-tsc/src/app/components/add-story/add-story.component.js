import { __decorate } from "tslib";
import { Component, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
let AddStoryComponent = class AddStoryComponent {
    constructor(formBuilder, storyService, router) {
        this.formBuilder = formBuilder;
        this.storyService = storyService;
        this.router = router;
        this.controlNames = ['energy', 'focus', 'creativity', 'irritability', 'happiness', 'anxiety'];
        this.form = this.formBuilder.group({
            energy: [1, Validators.required],
            focus: [1, Validators.required],
            creativity: [1, Validators.required],
            irritability: [1, Validators.required],
            happiness: [1, Validators.required],
            anxiety: [1, Validators.required],
            title: ['', Validators.required],
            journal: ['', Validators.required],
        });
        this.story = {
            title: '',
            energy: 1,
            creativity: 1,
            focus: 1,
            irritability: 1,
            happiness: 1,
            anxiety: 1,
            journal: '',
            userId: 1,
            date: new Date(),
            storyId: 1,
            votes: 1,
        };
        this.journalOpen = false;
    }
    addStory() {
        const val = this.form.value;
        this.story.energy = parseInt(val.energy);
        this.story.creativity = parseInt(val.creativity);
        this.story.focus = parseInt(val.focus);
        this.story.irritability = parseInt(val.irritability);
        this.story.happiness = parseInt(val.happiness);
        this.story.anxiety = parseInt(val.anxiety);
        this.story.journal = val.journal;
        this.story.title = val.title;
        this.story.date = new Date();
        this.storyService.addUserStory(this.story).subscribe((res) => {
            this.router.navigateByUrl('profile');
        }, (err) => {
            alert('Failed to add journal entry');
        });
    }
    openJournal() {
        this.journalOpen = true;
    }
    ngOnInit() {
        if (localStorage.getItem('userProfile')) {
            //Get user fields from user stored in local storage
            this.story.userId = JSON.parse(localStorage.getItem('userProfile') || '').userId;
        }
        else {
            this.router.navigateByUrl('explore');
        }
    }
};
AddStoryComponent = __decorate([
    Component({
        selector: 'app-add-story',
        templateUrl: './add-story.component.html',
        styleUrls: ['./add-story.component.scss'],
        encapsulation: ViewEncapsulation.None
    })
], AddStoryComponent);
export { AddStoryComponent };
//# sourceMappingURL=add-story.component.js.map