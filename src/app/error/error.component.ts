import { Component, Inject } from "@angular/core";
import { inject } from "@angular/core/testing";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl:"./error.component.html"
})
export class ErrorComponent{
  message = "An unknown error occurred!";
  constructor(@Inject(MAT_DIALOG_DATA) public data:any){}

}
