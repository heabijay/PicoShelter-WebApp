import { Component } from "@angular/core";
import { UserInfo } from "../models/userInfo";
import { IdentityService } from "../services/identityService";

@Component({
    templateUrl: "./home.component.html"
})
export class HomeComponent {
    currentUser: UserInfo;

    constructor(private identityService: IdentityService) {

    }

    ngOnInit(): void {
        this.currentUser = this.identityService.getIdentity()?.user;
    }
}