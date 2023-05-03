import { createAction, props } from '@ngrx/store';
export const toggleAddComment = createAction('TOGGLE_ADD_COMMENT', props());
export const setParentId = createAction('SET_PARENT', props());
export const setStoryId = createAction('[Comment] SET_STORY', props());
export const setStoryContent = createAction('[Comment] SET_STORY_CONTENT', props());
export const setParentCommentContent = createAction('[Comment] SET_PARENT_COMMENT_CONTENT', props());
export const setNotifications = createAction('[Comment] SET_NOTIFICATIONS', props());
export const setIsUserStory = createAction('[Comment] SET_IS_USER_STORY', props());
//# sourceMappingURL=comments.actions.js.map