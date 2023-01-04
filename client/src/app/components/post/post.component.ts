import { Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { GamesService } from 'src/app/services/games.service';
import { Post, PostType } from '../../models/post.model';
import { UserService } from '../../services/user.service';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnDestroy{
  @Input()
  public post!: Post; 

  public currentUsername: string;
  public editMode: boolean;
  private activeSubscriptions: Subscription[] = [];
  public show;


  public constructor(private userService: UserService, private gamesService: GamesService, private postService: PostsService) {
    this.currentUsername = userService.getCurrentUserUsername();
    this.editMode = false;
    this.show=true;
  }
  ngOnDestroy(): void {
    this.activeSubscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public editHandler(): void {
    this.editMode = !this.editMode;
  }

  public saveChangesHandler(): void{
    this.editMode = false;    
    console.log(this.post.reviewText, this.post.reviewScore);
    const postSub = this.postService.editReview(this.post._id, this.post.reviewText, this.post.reviewScore).subscribe();
    this.activeSubscriptions.push(postSub);
  }


  public deleteHandler(): void {
    const id = this.post._id;

    const userSub = this.userService.deleteAPost(id).subscribe();
    this.activeSubscriptions.push(userSub);

    switch(this.post.postType){
      case PostType.Backlog:
        const deleteFromBacklog = this.userService.deleteBacklogGame(this.post.gameId).subscribe();
        this.activeSubscriptions.push(deleteFromBacklog);
        break;
      case PostType.Playing:
        const deleteFromPlaying = this.userService.deletePlayingGame(this.post.gameId).subscribe();
        this.activeSubscriptions.push(deleteFromPlaying);
        break;
      case PostType.Finished:
        const deleteFromFinished = this.userService.deleteFinishedGame(this.post.gameId).subscribe();
        this.activeSubscriptions.push(deleteFromFinished);
        break;
      case PostType.Review:
        const deleteFromReviewed = this.userService.deleteReviewedGame(this.post.gameId).subscribe();
        this.activeSubscriptions.push(deleteFromReviewed);
        break;
    }


    const postSub = this.postService.deletePost(id).subscribe();
    this.activeSubscriptions.push(postSub);

    this.show=false;
  }

}
