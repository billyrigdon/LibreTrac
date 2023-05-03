import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { setIsUserStory, setParentCommentContent, setParentId, setStoryContent, setStoryId, } from 'src/app/store/comments/comments.actions';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { ModalComponent } from '../modal/modal.component';
let StoryComponent = class StoryComponent {
    constructor(storyService, voteService, store, route, router, dialog) {
        this.storyService = storyService;
        this.voteService = voteService;
        this.store = store;
        this.route = route;
        this.router = router;
        this.dialog = dialog;
        this.story = {};
        this.storyId = 0;
        this.userId = 0;
        this.isUserStory = false;
    }
    parseDate(input) {
        let parts = input.split('-');
        // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])); // Note: months are 0-based
    }
    getStory() {
        this.storyService.getStory(this.storyId).subscribe((res) => {
            this.story = JSON.parse(res);
            const storyDate = new Date(this.story.date);
            const formattedDate = storyDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });
            this.story.date = formattedDate;
        });
    }
    upvoteStory(vote) {
        this.voteService.addStoryVote(vote).subscribe((res) => {
            this.story.votes = this.story.votes + 1;
        });
    }
    openAddComment() {
        this.store.dispatch(setParentId({ parentId: 0 }));
        this.store.dispatch(setStoryContent({ content: this.story.journal }));
        this.store.dispatch(setParentCommentContent({ content: "" }));
        const dialogRef = this.dialog.open(AddCommentComponent, {
            width: '600px',
            height: '400px',
        });
        dialogRef.componentInstance.onError.subscribe((event) => {
            dialogRef.close();
            const errorDialogRef = this.dialog.open(ModalComponent, {
                width: '500px',
                height: '500px',
            });
            errorDialogRef.componentInstance.message = "Unable to add comment. Please try again.";
            errorDialogRef.componentInstance.onClose().subscribe((event) => {
                errorDialogRef.close();
            });
            errorDialogRef.componentInstance.buttonText = "Close";
        });
        dialogRef.componentInstance.onClose.subscribe(async (event) => {
            window.location.reload();
            dialogRef.close();
        });
    }
    deleteStory(storyId) {
        this.storyService.deleteStory(storyId).subscribe((res) => {
            this.router.navigateByUrl('/profile');
        });
    }
    goBack() {
        window.history.back();
    }
    ngOnInit() {
        if (localStorage.getItem('userProfile')) {
            this.userId = parseInt(JSON.parse(localStorage.getItem('userProfile') || '').userId);
        }
        this.route.queryParams.subscribe((params) => {
            this.storyId = parseInt(params['storyId']);
            this.getStory();
        });
        this.store.dispatch(setStoryId({ storyId: this.storyId }));
        this.storyService.isUserStory(this.storyId, this.userId).subscribe((res) => {
            this.isUserStory = JSON.parse(res).result;
            this.store.dispatch(setIsUserStory({ isUserStory: this.isUserStory }));
        });
    }
};
StoryComponent = __decorate([
    Component({
        selector: 'app-story',
        templateUrl: './story.component.html',
        styleUrls: ['./story.component.scss'],
    })
], StoryComponent);
export { StoryComponent };
//# sourceMappingURL=story.component.js.map