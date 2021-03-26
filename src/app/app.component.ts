import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "./services/currentUser.service";
import { IdentityHttpService } from "./services/identityHttp.service";
import { TokenService } from "./services/token.service";
import { environment } from "./enviroment"

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
        private identityHttpService: IdentityHttpService,
        private translateService: TranslateService
    ) {

    }

    ngOnInit(): void {
        this.translateService.setDefaultLang(environment.defaultLocale);
        this.translateService.use(environment.locales[2]);

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