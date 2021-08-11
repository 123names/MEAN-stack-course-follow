import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls:['./signup.component.css']
})

export class SignUpComponent implements OnInit, OnDestroy{
  constructor(private authService:AuthService) { }

  private authStatusSub:Subscription;

  isLoading = false;

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus=>{
      this.isLoading = false;
    });
  }
  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
  onSignUp(signupForm:NgForm){
    if (signupForm.invalid){
      return ;
    }
    this.isLoading = true;
    this.authService.createUser(signupForm.value.email, signupForm.value.password);
  }
}
