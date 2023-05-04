import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentsState } from './comments.state';

export const COMMENTS_STATE_NAME = 'comments';

const getCommentsState = createFeatureSelector<CommentsState>(COMMENTS_STATE_NAME);

export const getAddCommentsOpen = createSelector(getCommentsState, (state) => {
	return state.addCommentOpen;
});

export const getStoryId = createSelector(getCommentsState, (state) => {
	return state.storyId;
})

export const getParentCommentId = createSelector(getCommentsState, (state) => {
	return state.parentCommentId;
});

export const getStoryContent = createSelector(getCommentsState, (state) => {
	return state.storyContent;
})

export const getParentCommentContent = createSelector(getCommentsState, (state) => {
	return state.parentCommentContent
})

export const getAddCommentState = createSelector(getCommentsState, (state) => {
	return state;
})

export const getNotifications = createSelector(getCommentsState, (state) => {
	return state.notifications;
});