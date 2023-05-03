import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDrugComponent } from './components/add-drug/add-drug.component';
import { AddStoryComponent } from './components/add-story/add-story.component';
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import { ExploreComponent } from './components/explore/explore.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { StoryComponent } from './components/story/story.component';
import { DrugInfoComponent } from './components/drug-info/drug-info.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { TosComponent } from './components/tos/tos.component';
import { UserStoriesComponent } from './components/user-stories/user-stories.component';

const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'createProfile', component: CreateProfileComponent },
	{ path: 'profileSettings', component: ProfileSettingsComponent},
	{ path: 'addDrug', component: AddDrugComponent },
	{ path: 'drugInfo', component: DrugInfoComponent },
	{ path: 'addStory', component: AddStoryComponent },
	{ path: 'explore', component: ExploreComponent },
	{ path: 'story', component: StoryComponent },
	{path: 'tos', component: TosComponent},
	{path: 'user-stories', component: UserStoriesComponent},
	{ path: '', redirectTo: 'profile', pathMatch: 'full' },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
