import { StoryDrug } from "src/app/types/story";
import { UserDrug } from "src/app/types/userDrug";

export interface SharedState {
	isLoading: boolean;
	isAuth: boolean;
	userId: number;
	notiesOpen: boolean;
	storyToEdit: StoryDrug;
	drugToEdit: UserDrug;
}

export const initialState: SharedState = {
	isLoading: false,
	isAuth: false,
	userId: 0,
	notiesOpen: false,
	storyToEdit: <StoryDrug>{},
	drugToEdit: <UserDrug>{}
};
