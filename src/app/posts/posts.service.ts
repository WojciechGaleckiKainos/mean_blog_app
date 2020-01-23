import {Injectable} from '@angular/core';
import {Post} from './post.model';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root' // singleton
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();
  private url = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient, private router: Router) {
  }

  getPosts() {
    this.http
      .get<{ message: string, posts: any }>(this.url)
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath
          };
        });
      }))
      .subscribe((mappedPosts) => {
        this.posts = mappedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(
      this.url + '/' + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Post) {
    const postData = new FormData();
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', post.image, post.title);

    this.http.post<{ postId: string, imagePath: string }>(this.url, postData)
      .subscribe(responseData => {
        post.id = responseData.postId;
        post.imagePath = responseData.imagePath;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.redirectToTheHomePage();
      });
  }

  updatePost(post: Post) {
    let postData: Post | FormData;

    if (typeof (post.image) === 'object') {
      postData = new FormData();
      postData.append('id', post.id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', post.image, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: post.image
      };
    }
    this.http.put(this.url + '/' + post.id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.redirectToTheHomePage();
        console.log('Successfully updated post!');
      });
  }

  deletePost(postId: string) {
    this.http.delete(this.url + '/' + postId)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
        console.log('Successfully deleted post!');
      });
  }

  redirectToTheHomePage() {
    this.router.navigate(['/']);
  }
}
