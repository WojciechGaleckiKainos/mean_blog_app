import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {PostsService} from '../posts.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material';

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
  private posts: Post[] = [];
  private postSubscription: Subscription;

  constructor(public postsService: PostsService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
    this.postSubscription = this.postsService.getPostUpdateListener().subscribe(
      (postsData: {posts: Post[], totalPosts: number}) => {
      this.isLoading = false;
      this.posts = postsData.posts;
      this.totalPosts = postsData.totalPosts;
    });
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.currentPage, this.postsPerPage);
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
  }
}
