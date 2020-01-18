import { Post } from './../post.model';
import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {
  postTitle = '';
  postContent = '';

  @Output() newPost = new EventEmitter<Post>();

  onAddPost() {
    const post: Post = {
      title: this.postTitle,
      content: this.postContent
    };
    this.newPost.emit(post);
  }
}
