import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "./services/currentUserService";
import { IdentityHttpService } from "./services/identityHttpService";
import { TokenService } from "./services/tokenService";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    providers: [
        IdentityHttpService,
        CurrentUserService,
        TokenService
    ],
    styles: [
        "../node_modules/ng2-image-viewer/imageviewer.scss"
    ]
})
export class AppComponent {
    isLoaded: boolean = false;
    isServerFailure: boolean = false;

    constructor(
        private currentUserService: CurrentUserService,
        private tokenService: TokenService,
        private identityHttpService: IdentityHttpService
    ) {

    }

    ngOnInit(): void {
        this.identityHttpService.getCurrentUser().subscribe(
            data => 
            {
                this.currentUserService.currentUser = data.data;
            },
            (error: HttpErrorResponse) =>
            {
                if (error.status == 401) {
                    this.tokenService.setTokenWithProfile(null);
                    return;
                }

                if (error.status != 403 && error.status != 404)
                    this.isServerFailure = true;
            }
        ).add(
            () => this.isLoaded = true
        );
    }
}