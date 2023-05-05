import { createAction, props } from '@ngrx/store';
import { StoryDrug } from 'src/app/types/story';
import { UserDrug } from 'src/app/types/userDrug';

export const toggleLoading = createAction(
	'TOGGLE_LOADING',
	props<{ status: boolean }>()
);

export const toggleAuth = createAction(
	'TOGGLE_AUTH',
	props<{ status: boolean }>()
);

export const toggleNoties = createAction(
	'toggleNoties',
	props<{ open: boolean }>()
);

export const setUserId = createAction('SET_USER', props<{ userId: number }>());

export const setStoryToEdit = createAction('SET_STORY_TO_EDIT', props<{ story: StoryDrug }>());

export const setDrugToEdit = createAction('SET_DRUG_TO_EDIT', props<{drug: UserDrug}>())

export const setUserStories = createAction('SET_USER_STORIES', props<{stories: StoryDrug[]}>())

export const setExploreStories = createAction('SET_EXPLORE_STORIES', props<{stories: StoryDrug[]}>())

export const setAverageMood = createAction('SET_AVERAGE_MOOD', props<{mood: StoryDrug}>())

export const setIsMonthView = createAction('SET_IS_MONTH_VIEW', props<{isMonthView: boolean}>())

export const setStoryMood = createAction('SET_STORY_MOOD', props<{mood: StoryDrug}>())
