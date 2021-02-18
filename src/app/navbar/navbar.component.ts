import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { UserInfo } from "../models/userInfo";
import { IdentityHttpService } from "../services/identityHttpService";
import { ProfilesHttpService } from "../services/profilesHttpService";
import { CurrentUserService } from "../services/currentUserService";
import { TokenService } from "../services/tokenService";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { NgbdProfileSettingsModalComponent } from "../modals/settings/ngbdProfileSettingsModal.component"

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
        public profilesHttpService: ProfilesHttpService,
        private modalService: NgbModal,
        private toastrService: ToastrService
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

    openSettingsModal() {
        const modalRef = this.modalService.open(NgbdProfileSettingsModalComponent, { centered: true, size: "xl" });
        // modalRef.result.then(
        //     result => {
        //         const r = result as { success: number, failed: number };
        //         if (r.failed > 0) {
        //             this.toastrService.error(r.failed + " image(s) wasn't deleted due to error.");
        //         }
        //         if (r.success > 0) {
        //             this.toastrService.success(r.success + " image(s) deleted!");
        //             this.reload();
        //         }
        //     }
        // )
    }
}