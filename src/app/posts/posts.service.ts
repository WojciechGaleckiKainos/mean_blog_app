import {Injectable} from '@angular/core';
import {Post} from './post.model';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';

const URL = environment.apiUrl + '/posts';

@Injectable({
  providedIn: 'root' // singleton
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {
  }

  getPosts(currentPage: number, postsPerPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string, posts: any, totalPosts: number }>(URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              owner: post.owner
            };
          }),
          totalPosts: postData.totalPosts
        };
      }))
      .subscribe((mappedPostsData) => {
        this.posts = mappedPostsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          totalPosts: mappedPostsData.totalPosts
        });
      });
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, owner: string}>(
      URL + '/' + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Post) {
    const postData = new FormData();
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', post.image, post.title);

    this.http.post<{ postId: string, imagePath: string }>(URL, postData)
      .subscribe(responseData => {
        console.log('Successfully added post');
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
        imagePath: post.image,
        owner: null // handled in the backend
      };
    }
    this.http.put(URL + '/' + post.id, postData)
      .subscribe(response => {
        this.redirectToTheHomePage();
        console.log('Successfully updated post');
      });
  }

  deletePost(postId: string) {
    return this.http.delete(URL + '/' + postId);
  }

  redirectToTheHomePage() {
    this.router.navigate(['/']);
  }
}
