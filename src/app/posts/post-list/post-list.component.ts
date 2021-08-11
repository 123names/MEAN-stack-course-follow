import {Component, OnDestroy, OnInit} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import {PostService} from '../posts.service';
import {Post} from '../post.model';

@Component({
  selector: 'app-post-list',
  templateUrl:'./post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{

  constructor(private postService:PostService, private authService:AuthService){}

  posts:Post[] = [];
  isLoading = false;
  userAuthenticated = false;
  userID:string;

  totalPost = 0;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1,2,3,5,10];

  private postsSub : Subscription;
  private authStatusSub: Subscription;

  ngOnInit(){
    this.isLoading = true;
    this.postService.getPosts(this.postPerPage, this.currentPage);
    this.userID = this.authService.getUserID();
    this.postService.getPostUpdatedListener().subscribe((data_retirved: {posts:Post[], totalPosts:number})=>{
      this.isLoading = false;
      this.posts = data_retirved.posts;
      this.totalPost = data_retirved.totalPosts;
    });
    this.userAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated=>{
      this.userAuthenticated = isAuthenticated;
      this.userID = this.authService.getUserID();
    });
  }

  ngOnDestroy(){
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    if (this.authStatusSub){
      this.authStatusSub.unsubscribe();
    }
  }

  onDeletePost(postId:string){
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(()=>{
      this.postService.getPosts(this.postPerPage, this.currentPage);
    }, ()=>{
      this.isLoading = false;
    });
  }

  onChangePage(pageData:PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex+1;
    this.postPerPage = pageData.pageSize;
    this.postService.getPosts(this.postPerPage, this.currentPage);
  }
}
