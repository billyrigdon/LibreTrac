import { createAction, props } from '@ngrx/store';
import { CommentNotification, StoryComment } from 'src/app/types/comment';

export const toggleAddComment = createAction(
	'TOGGLE_ADD_COMMENT',
	props<{ open: boolean }>()
);

export const setParentId = createAction(
	'SET_PARENT',
	props<{ parentId: number }>()
)

export const setStoryId = createAction(
	'[Comment] SET_STORY',
	props<{ storyId: number }>()
)

export const setStoryContent = createAction(
	'[Comment] SET_STORY_CONTENT',
	props<{ content: string }>()
)

export const setParentCommentContent = createAction(
	'[Comment] SET_PARENT_COMMENT_CONTENT',
	props<{ content: string }>()
)

export const setNotifications = createAction(
	'[Comment] SET_NOTIFICATIONS',
	props<{ notifications: CommentNotification[] }>()
);

export const setIsUserStory = createAction(
	'[Comment] SET_IS_USER_STORY',
	props<{ isUserStory: boolean}>()
)

export const setComments = createAction(
	'[Comment] SET_COMMENTS',
	props<{ comments: StoryComment[] }>()
)

export const scrollToComment = createAction(
	'[Comment] SCROLL_TO_COMMENT',
	props<{commentId: number}>()
);