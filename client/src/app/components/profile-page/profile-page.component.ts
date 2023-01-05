import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model'
import { UserService} from 'src/app/services/user.service';
import { Game } from 'src/app/models/game.model';
import { Post, PostType } from 'src/app/models/post.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GamesService } from 'src/app/services/games.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent {
  public user: Observable<User> = new Observable<User>();
  public finishedGames: Game[] | undefined;
  public playingGames: Game[] | undefined;
  public backlogGames: Game[] | undefined;
  public reviewedGames: Game[] | undefined;
  public posts: Post[] = new Array<Post>();
  
  public showPopup:boolean = false;
  public gamesToShow: Game[] | undefined;

  public changeURLFormShown:boolean = false;
  public changeURLForm:FormGroup;

  public username?: string | null;
  public currentUserUsername?: string | null;
  public imgUrl?: string | null;

  constructor(private activatedRoute:ActivatedRoute,private userService:UserService, private formBuilder: FormBuilder){
   
    this.activatedRoute.paramMap.subscribe((params:ParamMap)=>{
      this.username=params.get('userName');
    });
    this.currentUserUsername = this.userService.getCurrentUserUsername();

    this.userService.getFinishedGames(this.getUsername()).subscribe((finishedGames) => {
      this.finishedGames = finishedGames;
    })
    this.userService.getPlayingGames(this.getUsername()).subscribe((playingGames) => {
      this.playingGames = playingGames;
    })
    this.userService.getBacklogGames(this.getUsername()).subscribe((backlogGames) => {
      this.backlogGames = backlogGames;
    })
    this.userService.getReviewedGames(this.getUsername()).subscribe((reviewedGames) => {
      this.reviewedGames = reviewedGames;
    })
    
    this.posts = this.userService.getPostsByUsername(this.getUsername());
    
    this.userService.getImgUrl(this.getUsername()).subscribe((imgUrl) => (imgUrl !== '') ? this.imgUrl = imgUrl : this.imgUrl = 'assets/profile-default.png');

    this.changeURLForm = this.formBuilder.group({
      imgURLToSet: ['', []]
    });
  }

  getUsername(): string {
    if(this.username)
      return this.username;
    else
      return this.userService.getCurrentUserUsername();
  }

  finishedCount() {
    const count = (this.finishedGames !== undefined) ? this.finishedGames.length : 0;
    return count;
  }

  playingCount() {
    const count = (this.playingGames !== undefined) ? this.playingGames.length : 0;
    return count;
  }

  backlogCount() {
    const count = (this.backlogGames !== undefined) ? this.backlogGames.length : 0;
    return count;
  }

  reviewCount() {
    const count = (this.reviewedGames !== undefined) ? this.reviewedGames.length : 0;
    return count;
  }

  showFinished() {
    this.gamesToShow = this.finishedGames;
    this.showPopup = true;
  }

  showPlaying() {
    this.gamesToShow = this.playingGames;
    this.showPopup = true;
  }

  showBacklog() {
    this.gamesToShow = this.backlogGames;
    this.showPopup = true;
  }

  showReviewed() {
    this.gamesToShow = this.reviewedGames;
    this.showPopup = true;
  }

  showChangeURLForm() {
    this.changeURLFormShown = !this.changeURLFormShown;
  }

  changeImgUrl() {
    const imgUrl = this.changeURLForm.get("imgURLToSet")?.value;
    this.userService.setImgUrl(this.getUsername(), imgUrl)
  }

}
