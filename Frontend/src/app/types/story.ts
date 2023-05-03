import { UserDrug } from "./userDrug";

export type Story = {
  storyId: number;
  userId: number;
  title: string;
  energy: number;
  focus: number;
  creativity: number;
  irritability: number;
  happiness: number;
  anxiety: number;
  journal: string;
  date: Date;
  votes: number;
};

export type StoryDrug = {
	storyId: number;
  userId: number;
  title: string;
	energy: number;
	focus: number;
	creativity: number;
	irritability: number;
	happiness: number;
	anxiety: number;
	journal: string;
  date: string;
  votes: number;
  drugs: Array<UserDrug>;
};