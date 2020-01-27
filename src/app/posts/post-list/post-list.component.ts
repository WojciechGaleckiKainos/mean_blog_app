import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {PostsService} from '../posts.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  isLoading = false;
  currentPage = 1;
  totalPosts = 0;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  currentUserId: string;
  private posts: Post[] = [];
  private postSubscription: Subscription;
  private authListenerSubs: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
    this.currentUserId = this.authService.getCurrentUserId();
    this.postSubscription = this.postsService
      .getPostUpdateListener()
      .subscribe(
        (postsData: { posts: Post[], totalPosts: number }) => {
          this.isLoading = false;
          this.posts = postsData.posts;
          this.totalPosts = postsData.totalPosts;
        });
    this.userIsAuthenticated = this.authService.getIsAuthenticated();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.currentUserId = this.authService.getCurrentUserId();
      });
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService
      .deletePost(postId)
      .subscribe(() => {
        this.postsService.getPosts(this.currentPage, this.postsPerPage);
      }, () => {
        this.isLoading = false;
      });
  }

  onPageChanged(pageEvent: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageEvent.pageIndex + 1;
    this.postsPerPage = pageEvent.pageSize;
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }
}
