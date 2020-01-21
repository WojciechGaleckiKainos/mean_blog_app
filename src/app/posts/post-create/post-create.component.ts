import {Post} from './../post.model';
import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {PostsService} from '../posts.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  post: Post;
  isLoading = false;
  private mode = 'create';
  private postId: string;

  constructor(public postsService: PostsService, public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content
          };
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const postToSave: Post = {
      title: form.value.title,
      content: form.value.content
    };

    this.isLoading = true;

    if (this.mode === 'create') {
      this.postsService.addPost(postToSave);
    } else {
      postToSave.id = this.postId;
      this.postsService.updatePost(postToSave);
    }
    form.resetForm();
  }
}
