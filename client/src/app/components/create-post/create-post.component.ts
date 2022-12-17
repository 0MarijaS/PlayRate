import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GamesService } from '../../services/games.service'
import { Post, PostType } from "../../models/post.model"
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnDestroy {

  public games;
  review: boolean = false;
  createPostForm: FormGroup;
  private activeSubscriptions: Subscription[] = [];

  constructor(private gameService: GamesService, private postService: PostsService, private formBuilder: FormBuilder){
    this.createPostForm = this.formBuilder.group({
      game: ['', [Validators.required]],
      type: ['', [Validators.required]],
      reviewScore: ['', [Validators.min(1.0), Validators.max(10.0)]],
      reviewText: ['', []]
    });

    this.games = this.gameService.getGamesArray();
  }

  public ngOnDestroy(): void {
    this.activeSubscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
  
  onSelectedType(event: Event): void {
    this.review = (<HTMLSelectElement>event.target).value==="review";
  }

  onCreatePostFormSubmit() {

    let type : PostType;
    const postType : string = this.createPostForm.get("type")?.value;
    switch(postType) {
      case "review": {type = PostType.Review; break;}
      case "playing": {type = PostType.Playing; break;}
      case "finished": {type = PostType.Finished; break;}
      case "backlog": {type = PostType.Backlog; break;}
      default: type=PostType.NoType;
    }
    const gameId = this.createPostForm.get("game")?.value;
    const userId = "63912e2073797a0196f9c4ad"; //ovde treba dohvatiti trenutno ulogavanog usera

    const reviewText =  this.createPostForm.get("reviewText")?.value;
    const reviewScore =  this.createPostForm.get("reviewScore")?.value;
    
    
    const postsSub = this.postService.createNewPost(type, gameId, userId, reviewText, reviewScore).subscribe((postId)=>{
        const gamesSub = this.gameService.attachPost(gameId, postId, reviewScore).subscribe();
        this.activeSubscriptions.push(gamesSub);
        //treba dodati post i useru
    });
    this.activeSubscriptions.push(postsSub);
    
  }
}
