import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthInterceptorProviders } from './interceptors/auth.interceptor';
import { CreateProfileComponent } from './components/create-profile/create-profile.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AddDrugComponent } from './components/add-drug/add-drug.component';
import { AddStoryComponent } from './components/add-story/add-story.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { LoadingComponent } from './components/loading/loading.component';
import { appReducer } from './store/app.state';
import { ExploreComponent } from './components/explore/explore.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { StoryComponent } from './components/story/story.component';
import { CommentsComponent } from './components/comments/comments.component';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { CommentComponent } from './components/comment/comment.component';
import { CommentThreadComponent } from './components/comment-thread/comment-thread.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { StoriesComponent } from './components/stories/stories.component';
import { MoodGraphComponent } from './components/mood-graph/mood-graph.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatSliderModule } from "@angular/material/slider"
import { MatDialogModule } from "@angular/material/dialog";
import { ModalComponent } from './components/modal/modal.component'
import { BifrostService } from './services/bifrost.service';
import { DrugInfoComponent } from './components/drug-info/drug-info.component';
import { WarningComponent } from './components/warning/warning.component';
import { SearchModalComponent } from './components/search-modal/search-modal.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { TosComponent } from './components/tos/tos.component';
import { BottomSheetDrugComponent } from './components/bottom-sheet-drug/bottom-sheet-drug.component';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { UserStoriesComponent } from './components/user-stories/user-stories.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotieBarComponent } from './components/notie-bar/notie-bar.component';
import { BottomSheetInfoComponent } from './components/bottom-sheet-info/bottom-sheet-info.component';
import { BottomSheetDisorderComponent } from './components/bottom-sheet-disorder/bottom-sheet-disorder.component';
import { PasswordResetModalComponent } from './components/password-reset-modal/password-reset-modal.component';
import { CustomRouteReuseStrategy } from './services/custom-route-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { UserStoriesScrollableComponent } from './components/user-stories-scrollable/user-stories-scrollable.component';
import { MoodGraphStoryComponent } from './components/mood-graph-story/mood-graph-story.component';
@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		SignupComponent,
		ProfileComponent,
		CreateProfileComponent,
		NavbarComponent,
		AddDrugComponent,
		AddStoryComponent,
		LoadingComponent,
		ExploreComponent,
		StoryComponent,
		CommentsComponent,
		AddCommentComponent,
		CommentComponent,
		CommentThreadComponent,
		AutofocusDirective,
		StoriesComponent,
		MoodGraphComponent,
		ModalComponent,
		DrugInfoComponent,
		WarningComponent,
		SearchModalComponent,
		ProfileSettingsComponent,
		TosComponent,
		BottomSheetDrugComponent,
		BottomSheetDisorderComponent,
		UserStoriesComponent,
		NotieBarComponent,
		BottomSheetInfoComponent,
		PasswordResetModalComponent,
  UserStoriesScrollableComponent,
  MoodGraphStoryComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		StoreModule.forRoot(appReducer),
		!environment.production ? StoreDevtoolsModule.instrument() : [],
		BrowserAnimationsModule,
		MatToolbarModule,
		MatCardModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatCheckboxModule,
		MatSelectModule,
		InfiniteScrollModule,
		MatSliderModule,
		MatDialogModule,
		MatListModule,
		MatBottomSheetModule,
		MatAutocompleteModule
	],
	providers: [
		AuthInterceptorProviders, 
		BifrostService, 
		DatePipe, 
		{ provide: LocationStrategy, useClass: HashLocationStrategy },
		{ provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
