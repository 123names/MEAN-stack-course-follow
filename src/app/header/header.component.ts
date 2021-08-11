import {Component, OnDestroy, OnInit} from "@angular/core"

import { Subscription } from "rxjs"

import { AuthService } from "../auth/auth.service"

@Component({
  selector: 'app-header',
  templateUrl : './header.component.html',
  styleUrls:['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy{
  constructor(private authService:AuthService){}
  userAuthenticated = false;
  private authListener:Subscription;

  ngOnInit(){
    this.userAuthenticated = this.authService.getIsAuth();
    this.authListener = this.authService.getAuthStatusListener().subscribe(isAuthenticated=>{
      this.userAuthenticated = isAuthenticated;
    })
  }

  ngOnDestroy(){
    this.authListener.unsubscribe();
  }

  onLogout(){
    this.authService.logout();
  }

}
