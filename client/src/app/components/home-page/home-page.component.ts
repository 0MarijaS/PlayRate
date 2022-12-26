import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from 'src/app/models/game.model';
import { Post } from 'src/app/models/post.model';
import { GamesService } from 'src/app/services/games.service';
import { PostsService } from 'src/app/services/posts.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public games: Observable<Game[]> = new Observable<Game[]>();
  public posts: Observable<Post[]> = new Observable<Post[]>();

  constructor(private gamesService: GamesService, private postsService: PostsService, private router: Router,
     private authService: AuthService ) {
    this.games = this.gamesService.getPopularGames(12);    
    this.posts = this.postsService.getRecentPosts();
  
    if (authService.sendUserDataIfExists() === null){
      router.navigateByUrl("");
    }
  }

  ngOnInit(): void {
    
  }
}
