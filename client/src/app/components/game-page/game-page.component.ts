import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Game } from 'src/app/models/game.model';
import { GamesService } from 'src/app/services/games.service';
import { UserService } from 'src/app/services/user.service';
import { PostsService } from 'src/app/services/posts.service';
import { Post, PostType } from 'src/app/models/post.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


declare const $:any;

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent implements OnDestroy{

  public game:Observable<Game>=new Observable<Game>();
  public steamLink:string='';
  public clicked:boolean=false;
  public reviews:Post[]=[];
  public reviewForm:FormGroup;
  public showReview:boolean = false;
  private activeSubscriptions: Subscription[] = [];


  constructor(private activatedRoute:ActivatedRoute,private gameService:GamesService, private userService:UserService, private postsService:PostsService, private formBuilder: FormBuilder){
    
    this.activatedRoute.paramMap.subscribe((params:ParamMap)=>{
      const gameId:string | null=params.get('gameId');
      this.game=this.gameService.getGameById((gameId)!);
      const steamLinkSub=this.game.subscribe(g=>{this.steamLink=g.steamLink});
      this.activeSubscriptions.push(steamLinkSub);
      const reviewSub = this.gameService.getGameReviews(gameId!).subscribe(posts=>this.reviews = posts);
      this.activeSubscriptions.push(reviewSub);
    })

    this.reviewForm = this.formBuilder.group({
      reviewScore: ['5', [Validators.min(1.0), Validators.max(10.0)]],
      reviewText: ['', []]
    });

  }

  ngOnDestroy(): void {
    this.activeSubscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }
  
  addToFinishedOnClick(): void{
    const sub = this.game.subscribe((g)=>{
      const obs : Observable<{token : string}>  = this.userService.putFinishedGame(g._id);
      const userSub = obs.subscribe((token) => {
        if(token.token !== "error"){
          const postSub = this.postsService.createNewPost(PostType.Finished ,g._id, g.name, this.userService.getCurrentUserUsername(), '', 0).subscribe( (post) => {
            const userSub = this.userService.putAPost(post._id).subscribe();
            this.activeSubscriptions.push(userSub);
           });
          this.activeSubscriptions.push(sub, postSub, userSub);
        }
      });
    })
  }

  addToPlayingOnClick(): void{
    const sub = this.game.subscribe((g)=>{
      const obs : Observable<{token : string}>  = this.userService.putPlayingGame(g._id);
      const userSub = obs.subscribe((token) => {
        if(token.token !== "error"){
          const postSub = this.postsService.createNewPost(PostType.Playing ,g._id, g.name, this.userService.getCurrentUserUsername(), '', 0).subscribe( (post) => {
            const userSub = this.userService.putAPost(post._id).subscribe();
            this.activeSubscriptions.push(userSub);
           });
          this.activeSubscriptions.push(sub, postSub, userSub);
        }
      });
    })
  }

  addToBacklogOnClick(): void{
    const sub = this.game.subscribe((g)=>{
      const obs : Observable<{token : string}>  = this.userService.putBacklogGame(g._id);
      const userSub = obs.subscribe((token) => {
        if(token.token !== "error"){
          const postSub = this.postsService.createNewPost(PostType.Backlog ,g._id, g.name, this.userService.getCurrentUserUsername(), '', 0).subscribe( (post) => {
            const userSub = this.userService.putAPost(post._id).subscribe();
            this.activeSubscriptions.push(userSub);
           });
          this.activeSubscriptions.push(sub, postSub, userSub);
        }
      });
    })
  }

  reviewOnClick(): void{
    this.showReview = !this.showReview;
  }

  onUpdatedReviewScore(gameId: string) {
    this.game = this.gameService.getGameById(gameId);
  }

  onDeletedPost(deletedPost: Post){
    this.reviews = this.reviews.filter(post=>post._id!=deletedPost._id);
    this.game = this.gameService.getGameById(deletedPost.gameId);
   
  }

  onReview(): void {
    const sub = this.game.subscribe((g)=>{
      const reviewText =  this.reviewForm.get("reviewText")?.value;
      const reviewScore =  this.reviewForm.get("reviewScore")?.value;
      this.reviewForm.get("reviewText")?.reset();
      this.reviewForm.get("reviewScore")?.reset();
      const obs : Observable<{token : string}>  = this.userService.putReviewedGame(g._id);
      const userSub = obs.subscribe((token) => {
          if(token.token !== "error"){
            const postSub = this.postsService.createNewPost(PostType.Review ,g._id, g.name, this.userService.getCurrentUserUsername(), reviewText, reviewScore).subscribe( (post) => {
              const gamesSub = this.gameService.attachPost(g._id, post._id, reviewScore).subscribe();
              const userSub = this.userService.putAPost(post._id).subscribe();
              this.activeSubscriptions.push(gamesSub, userSub);
              this.reviews = [...this.reviews, post];
             });
            this.activeSubscriptions.push(sub, postSub, userSub);
          }
      });
      this.game.subscribe(g=>console.log(g.reviewScore));
    })
  }
}
