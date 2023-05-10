import { Disorder, UserDisorder } from "src/app/types/disorder";
import { Drug } from "src/app/types/drug";
import { NotificationStory, StoryDrug } from "src/app/types/story";
import { UserDrug } from "src/app/types/userDrug";

export interface SharedState {
	isLoading: boolean;
	isAuth: boolean;
	userId: number;
	notiesOpen: boolean;
	storyToEdit: StoryDrug;
	drugToEdit: UserDrug;
	userStories: StoryDrug[];
	exploreStories: StoryDrug[];
	averageMood: StoryDrug;
	isMonthView: boolean;
	storyMood: StoryDrug;
	notificationStories: Array<NotificationStory>;
	userDrugs: Array<UserDrug>;
	userDisorders: Array<UserDisorder>;
	drugs: Array<Drug>;
	disorders: Array<Disorder>
}

export const initialState: SharedState = {
	isLoading: false,
	isAuth: false,
	userId: 0,
	notiesOpen: false,
	storyToEdit: <StoryDrug>{},
	drugToEdit: <UserDrug>{},
	userStories: [],
	exploreStories: [],
	averageMood: <StoryDrug>{},
	isMonthView: false,
	storyMood: <StoryDrug>{},
	notificationStories: [],
	userDrugs: [],
	userDisorders: [],
	drugs: [],
	disorders: []
};
