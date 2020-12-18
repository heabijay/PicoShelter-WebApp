import { HttpResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UserInfo } from "../models/userInfo";
import { UserLoginData } from "../models/userLoginData";
import { IdentityService } from "../services/identityService";
import { ProfilesHttpService } from "../services/profilesHttpService";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    providers: [
        ProfilesHttpService
    ]
})
export class NavbarComponent {
    avatarLink: string = null;
    currentUser: UserInfo;
    subscription: Subscription;
    subscriptionAvatar: Subscription;

    constructor(
        private identityService: IdentityService, 
        private router: Router,
        private profilesHttpService: ProfilesHttpService,
    ) {
        
    }

    refreshInfo(data: UserLoginData) {
        this.avatarLink = null;
        this.currentUser = data?.user;
        if (this.currentUser != null) {
            this.subscriptionAvatar = this.profilesHttpService.getAvatarHead(this.currentUser.id).subscribe(
                (data: any) => {
                    if (data.status == 200) {
                        this.avatarLink = this.profilesHttpService.getAvatarLink(this.currentUser.id)
                    }
                    else {
                        this.avatarLink = "none";
                    }
                },
                error => {
                    this.avatarLink = "none";
                }
            ).add(
                () => this.subscriptionAvatar.unsubscribe()
            );
        }
    }

    ngOnInit(): void {
        this.subscription = this.identityService.onIdentityChanged.subscribe(data => {
            this.refreshInfo(data);
        });
        this.refreshInfo(this.identityService.getIdentity());
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    logout() {
        this.identityService.deleteIdentity();
        this.router.navigateByUrl("/");
    }

    gotoMyProfile() {
        this.router.navigateByUrl(this.profilesHttpService.getProfileLink(this.currentUser.id));
    }
}