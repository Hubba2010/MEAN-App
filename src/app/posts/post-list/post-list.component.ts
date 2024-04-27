import {
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import {Subscription} from 'rxjs';

import {Post} from "../post.model";
import {PostsService} from "../posts.service";
import {PageEvent} from '@angular/material/paginator';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"],
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  public isLoading = false;
  public totalPosts = 0;
  public postsPerPage = 2;
  public currentPage = 1;
  public pageSizeOptions = [1, 2, 5, 10];
  public userIsAuthenticated = false;
  private postsSub: Subscription = new Subscription();
  private authStatusSub!: Subscription;

  constructor(
    public postsService: PostsService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], totalPosts: number}) => {
        this.posts = postData.posts;
        this.totalPosts = postData.totalPosts;
        this.isLoading = false;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
  }

  onDelete(postId: string | null) {
    if (!postId) {
     return;
    }
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
