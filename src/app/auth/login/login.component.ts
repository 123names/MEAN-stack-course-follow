import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls:['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy{
  constructor(private authService: AuthService) { }

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

  onLogin(loginForm:NgForm){
    if (loginForm.invalid){
      return ;
    }
    this.isLoading=true;
    this.authService.loginUser(loginForm.value.email, loginForm.value.password);
  }
}
