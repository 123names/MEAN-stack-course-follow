import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl : './post-create.component.html',
  styleUrls : ["./post-create.component.css"]
})

export class PostCreateComponent implements OnInit, OnDestroy{
  constructor(public postService: PostService, public route:ActivatedRoute, private authService:AuthService){}

  post:Post;
  isLoading = false;
  postForm:FormGroup;
  imagePreview:string;
  private mode = "create";
  private postId:string;
  private authStatusSub: Subscription;


  ngOnInit(){
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus=>{
      this.isLoading=false;
    });
    this.postForm = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(2)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators:[Validators.required], asyncValidators:[mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap)=>{
      if(paramMap.has("postId")){
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData=>{
          this.isLoading = false;
          this.post = {id:postData._id, title:postData.title, content:postData.content, imagePath:postData.imagePath, creator: postData.creator};
          this.postForm.setValue({title:this.post.title, content:this.post.content, image: this.post.imagePath});
        });
      }else{
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }

  onImagePicked(event:Event){
    const inFile = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({image:inFile});
    this.postForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload= ()=>{
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(inFile);
    //console.log(inFile);
    //console.log(this.postForm);
  }

  onSavePost(){
    if (this.postForm.invalid){
      return
    }
    this.isLoading = true;
    if (this.mode === "create"){
      this.postService.addPost(this.postForm.value.title,this.postForm.value.content, this.postForm.value.image);
    }else{
      this.postService.updatePost(this.postId, this.postForm.value.title, this.postForm.value.content, this.postForm.value.image);
    }
    this.postForm.reset();
  }
}
