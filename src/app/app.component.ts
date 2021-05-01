import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "./services/currentUser.service";
import { IdentityHttpService } from "./services/identityHttp.service";
import { TokenService } from "./services/token.service";
import { environment } from "./enviroment"
import { env } from "process";
import { ProfilesHttpService } from "./services/profilesHttp.service";

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
        public identityHttpService: IdentityHttpService,
        private translateService: TranslateService,
        private toastrService: ToastrService
    ) {

    }

    get currentLocale() {
        return this.translateService.currentLang;
    }
    
    set currentLocale(locale: string) {
        if (environment.locales.indexOf(locale) != -1) {
            this.translateService.use(locale);
            localStorage.setItem('locale', locale);
        } 
        else {
            if (locale != null)
                console.error('Locale "' + locale + '" not found!');

            this.translateService.use(environment.defaultLocale);
        }
    }

    ngOnInit(): void {
        this.translateService.setDefaultLang(environment.defaultLocale);
        const savedLocale = localStorage.getItem('locale');
        this.currentLocale = savedLocale;

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

    changeLocale(locale: string) {
        this.currentLocale = locale;
        this.translateService.get('app.toastr.languageChanged').subscribe(str => {
            this.toastrService.info(str);
        })
    }

    onActivate(event) {
        document.getElementById('bodyAndFooter').scrollTo(0, 0);
    }
}