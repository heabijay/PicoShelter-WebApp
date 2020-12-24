import { Component } from "@angular/core";
import { UserInfo } from "../models/userInfo";
import { CurrentUserService } from "../services/currentUserService"

@Component({
    templateUrl: "./home.component.html"
})
export class HomeComponent {

    constructor(public currentUserService: CurrentUserService) {

    }
}