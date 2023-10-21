import { createReducer, on } from '@ngrx/store';
import { scrollToComment, setComments, setIsUserStory, setNotifications, setParentCommentContent, setParentId, setStoryContent, setStoryId, toggleAddComment } from './comments.actions';
import { initialState, CommentsState } from './comments.state';
import { Statement } from '@angular/compiler';

export const _commentsReducer = createReducer(
	initialState,
	on(toggleAddComment, (state, action) => {
		return {
			...state,
			addCommentOpen: action.open,
		};
	}),
	on(setParentId, (state, action) => {
		return {
			...state,
			parentCommentId: action.parentId,
		};
	}),
	on(setStoryId, (state, action) => {
		return {
			...state,
			storyId: action.storyId,
		}
	}),
	on(setStoryContent, (state, action) => {
		return {
			...state,
			storyContent: action.content
		}
	}),
	on(setParentCommentContent, (state, action) => {
		return {
			...state,
			parentCommentContent: action.content
		}
	}),
	on(setNotifications, (state, action) => {
		return {
			...state,
			notifications: action.notifications
		}
	}),
	on(setIsUserStory, (state, action) => {
		return {
			...state,
			isUserStory: action.isUserStory
		}
	}),
	on(setComments, (state, action) => {
		return {
			...state,
			comments: action.comments
		}
	}),
	on(scrollToComment, (state, action) => {
		return {
			...state,
			scrollToCommentId: action.commentId
		}
	})
);
