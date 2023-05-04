import { Component, Input, OnInit } from '@angular/core';
import { StoryComment } from 'src/app/types/comment';

@Component({
	selector: 'app-comment-thread',
	templateUrl: './comment-thread.component.html',
	styleUrls: ['./comment-thread.component.scss'],
})
export class CommentThreadComponent implements OnInit {
  @Input() comments!: Array<StoryComment>;
  @Input() parentCommentId!: number;
  @Input() comment!: StoryComment;
	@Input() userId!: number;
	
  
	
  constructor() { 
  }

  ngOnInit(): void {
    
  }
}
