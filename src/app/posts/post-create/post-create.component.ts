import {Post} from '../post.model';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostsService} from '../posts.service';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {mimeType} from './image.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

enum Mode {
  Create,
  Edit
}

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = Mode.Create;
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.setUpForm();
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('postId')) {
        this.mode = Mode.Edit;
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            owner: postData.owner
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = Mode.Create;
        this.postId = null; // handled in the backend
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    this.loadImagePreview(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    const postToSave: Post = {
      title: this.form.value.title,
      content: this.form.value.content,
      image: this.form.value.image,
      owner: null
    };
    this.isLoading = true;

    if (this.mode === Mode.Create) {
      this.postsService.addPost(postToSave);
    } else {
      postToSave.id = this.postId;
      this.postsService.updatePost(postToSave);
    }
    this.form.reset();
  }

  private setUpForm() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
  }

  private loadImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
