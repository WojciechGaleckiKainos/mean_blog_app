import {Injectable} from '@angular/core';
import {Post} from './post.model';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root' // singleton
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    // copy
    return [...this.posts];
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Post) {
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
  }
}
