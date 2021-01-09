import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { SuccessResponseDto } from "../models/successResponseDto";
import { UserInfo } from "../models/userInfo";
import { UserLoginData } from "../models/userLoginData";
import { IdentityHttpService } from "../services/identityHttpService";
import { ProfilesHttpService } from "../services/profilesHttpService";
import { CurrentUserService } from "../services/currentUserService";
import { TokenService } from "../services/tokenService";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    providers: [
        ProfilesHttpService,
        IdentityHttpService
    ]
})
export class NavbarComponent {
    currentUser: UserInfo;
    subscription: Subscription;

    get currentUserAvatarLink() {
        if (this.currentUser?.id != null)
            return this.profilesHttpService.getAvatarLink(this.currentUser?.id);
        return null;
    }

    constructor(
        private tokenService: TokenService,
        private currentUserService: CurrentUserService, 
        private router: Router,
        public profilesHttpService: ProfilesHttpService
    ) {
        
    }

    ngOnInit(): void {
        this.subscription = this.currentUserService.onCurrentUserChanged.subscribe(data => {
            this.currentUser = this.currentUserService.currentUser;
        });
        this.currentUser = this.currentUserService.currentUser;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    logout() {
        this.tokenService.setTokenWithProfile(null);
        this.router.navigateByUrl("/");
    }

    gotoMyProfile() {
        this.router.navigateByUrl(this.profilesHttpService.getProfileLink(this.currentUser.id));
    }
}