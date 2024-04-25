import { Component, OnInit } from "@angular/core";
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

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  private mode = 'create';
  private postId: string | null | undefined;
  public isLoading = false;
  public post: Post | undefined;
  public form!: FormGroup;
  public imagePreview: string | ArrayBuffer | null = null;

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}

  public ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required]})
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true
        if (this.postId) {
          this.postsService.getPost(this.postId).subscribe(post => {
            this.post = {id: post._id, title: post.title, content: post.content};
            this.form.setValue(
              {
                'title': this.post.title,
                'content': this.post.content
              });
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
      this.postsService.addPost(this.form.value.title, this.form.value.content);
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content)
    }

    this.form.reset();
  }
}
