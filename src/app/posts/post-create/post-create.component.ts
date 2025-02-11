import {
  Component,
  OnDestroy,
  OnInit
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  NgForm,
  Validators
} from "@angular/forms";

import { PostsService } from "../posts.service";
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {Post} from '../post.model';
import {mimeType} from './mime-type.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  private mode = 'create';
  private postId: string | null | undefined;
  private authStatusSub!: Subscription;
  public isLoading = false;
  public post: Post | undefined;
  public form!: FormGroup;
  public imagePreview: string | ArrayBuffer | null = null;

  constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService) {}

  public ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(() => {
      this.isLoading = false;
    });
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true
        if (this.postId) {
          this.postsService.getPost(this.postId).subscribe(post => {
            this.post = {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
            this.form.setValue(
              {
                'title': this.post.title,
                'content': this.post.content,
                'image': this.post.imagePath
              });
            this.imagePreview = post.imagePath;
            this.isLoading = false;
          });
        } else {
          this.isLoading = false;
        }
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement)?.files;
    if (!file) {
      return;
    }
    this.form.patchValue({image: file[0]});
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result
    }
    reader.readAsDataURL(file[0]);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.mode === 'create' || !this.postId) {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  public ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
