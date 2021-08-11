import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { Subject } from "rxjs";

import { AuthData } from "./auth-data.model";

import {environment} from "../../environments/environment";

const BACKEND_URL = environment.apiURL+"/user/";

@Injectable({providedIn:"root"})
export class AuthService{
  constructor(private httpClient: HttpClient, private router:Router){}

  private token:string;
  private tokenTimer: any;
  private userID: string;
  private userAuthenticated = false;
  private authStatusListener = new Subject<boolean>();

  private saveAuthData(token:string, expirationDate:Date, userID:string){
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userID", userID);
  }

  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userID = localStorage.getItem("userID");
    if (!token || !expirationDate){
      return null;
    }
    return {token:token, expirationDate:new Date(expirationDate), userID:userID}
  }

  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userID");
  }

  private setAuthTimer(durationInSec:number){
    console.log("Setting timmer: " + durationInSec);
    this.tokenTimer = setTimeout(()=>{
      this.logout();
    }, durationInSec*1000);
  }

  getToken(){
    return this.token;
  }

  getIsAuth(){
    return this.userAuthenticated;
  }

  getUserID(){
    return this.userID;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if (!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    console.log(authInformation, expiresIn);
    if (expiresIn>0){
      this.token = authInformation.token;
      this.userAuthenticated = true;
      this.userID = authInformation.userID;
      this.setAuthTimer(expiresIn/1000);
      this.authStatusListener.next(true);
    }
  }

  createUser(email:string, password:string){
    const authData:AuthData = {email:email, password: password};
    this.httpClient.post<{message:string}>(BACKEND_URL+"/signup", authData).subscribe(response=>{
      if (response.message){
        console.log(response.message);
        this.router.navigate(["/"]);
      }
    }, error=>{
      this.authStatusListener.next(false);
    });
  }

  loginUser(email:string, password:string){
    const authData:AuthData = {email:email, password: password};
    this.httpClient.post<{token:string, expiresIn:number, userID:string}>(BACKEND_URL+"/login",authData).subscribe(response=>{
      const token = response.token;
      this.token = token;
      if (token){
        const tokenExpiresInDuration = response.expiresIn
        this.setAuthTimer(tokenExpiresInDuration);

        this.userAuthenticated = true;
        this.userID = response.userID;
        this.authStatusListener.next(true);

        const now = new Date();
        const expirationDate = new Date(now.getTime() + tokenExpiresInDuration*1000);
        console.log(expirationDate);

        this.saveAuthData(token, expirationDate, this.userID);
        this.router.navigate(["/"]);
      }
    }, error=>{
      this.authStatusListener.next(false);
    });
  }

  logout(){
    this.token = null;
    this.userID = null;
    this.userAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }
}
