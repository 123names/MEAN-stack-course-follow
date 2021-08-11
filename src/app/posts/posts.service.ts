import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"
import { Router } from "@angular/router";

import {Subject} from 'rxjs';
import {map} from 'rxjs/operators'

import { Post } from "./post.model";

import {environment} from "../../environments/environment";

const BACKEND_URL = environment.apiURL+"/posts/";

@Injectable({providedIn:'root'})
export class PostService{
  constructor(private httpClient:HttpClient, private router:Router){}

  private posts:Post[] = [];
  private postUpdated = new Subject<{posts:Post[], totalPosts: number}>();

  getPostUpdatedListener(){
    return this.postUpdated.asObservable();
  }

  getPost(postId:string){
    return this.httpClient.get<{_id:string, title:string, content:string, imagePath:string, creator: string}>(BACKEND_URL+postId);
  }

  getPosts(postPerPage:number, currPage:number){
    const queryParams = `?pageSize=${postPerPage}&currPage=${currPage}`;
    this.httpClient.get<{message:string, posts:any, totalPosts:number}>(BACKEND_URL+queryParams)
    .pipe(map((returnData)=>{
      console.log(returnData.message);
      return { posts: returnData.posts.map(post =>{
        return { id:post._id, title: post.title, content: post.content, imagePath:post.imagePath, creator: post.creator};
      }), totalPosts: returnData.totalPosts}
    }))
    .subscribe((transformedPostData)=>{
      console.log(transformedPostData);
      this.posts = transformedPostData.posts;
      this.postUpdated.next({posts: [...this.posts], totalPosts: transformedPostData.totalPosts});
    });
  }

  addPost(title: string, content: string, image:File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content",content);
    postData.append("image",image, title);
    this.httpClient.post<{message:string, post:Post}>(BACKEND_URL, postData)
    .subscribe((resopnseData)=>{
      console.log(resopnseData.message);
      // navigate
      this.router.navigate(["/"]);
    });
  }

  updatePost(id:string, title:string, content:string, image:File | string){
    let postData: Post |FormData;
    if (typeof(image)=="object"){
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);

    } else{
      postData = {id:id, title:title, content:content, imagePath:image, creator:null};
    }
    this.httpClient.put<{message:string}>(BACKEND_URL+id, postData).subscribe(response=>{
      console.log(response.message);
      this.router.navigate(["/"]);
    })
  }

  deletePost(postId:string){
    return this.httpClient.delete<{message:string}>(BACKEND_URL+postId);
  }
}
