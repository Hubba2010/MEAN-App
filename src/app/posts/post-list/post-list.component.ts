import {
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import {Subscription} from 'rxjs';

import {Post} from "../post.model";
import {PostsService} from "../posts.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"],
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  public isLoading = false;
  private postsSub: Subscription = new Subscription();

  constructor(
    public postsService: PostsService,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
      });
  }

  onDelete(postId: string | null) {
    if (!postId) {
     return;
    }
    this.postsService.deletePost(postId);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
