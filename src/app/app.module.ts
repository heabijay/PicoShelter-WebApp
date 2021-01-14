import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component"
import { appRoutes } from "./app.routes"
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { HttpClientModule } from "@angular/common/http";
import { TokenService } from "./services/tokenService";
import { CurrentUserService } from "./services/currentUserService";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { ComparePasswordDirective } from "./directives/compare-password.directive"
import { ProfilesComponent } from "./profiles/profiles.component";
import { ImagesComponent as ProfileImagesComponent } from "./profiles/images/images.component";
import { AlbumsComponent } from "./profiles/albums/albums.component";
import { OverviewComponent } from "./profiles/overview/overview.component";
import { ProfilesDataService } from "./profiles/profiles.data.service";
import { UploadComponent } from "./upload/upload.component";
import { ImageCacheService } from "./services/imageCacheService";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from './modals/profileImageDeleting/NgbdProfileImageDeletingModal.component';
import { NgbdProfileSettingsModalComponent } from './modals/settings/ngbdProfileSettingsModal.component';
import { ProfileSettingsSecurityPageComponent } from './modals/settings/securityPage/profileSettingsSecurityPage.component';
import { ProfileSettingsProfilePageComponent } from './modals/settings/profilePage/profileSettingsProfilePage.component';
import { UploadExitGuard } from "./guards/upload.exit.guard";
import { ImagesComponent } from "./images/images.component";

@NgModule({
    imports: [
        HttpClientModule,
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            progressBar: true
        }),
        NgbModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        NotFoundComponent,
        RegistrationComponent,
        LoginComponent,
        ProfilesComponent,
        OverviewComponent,
        AlbumsComponent,
        ProfileImagesComponent,
        ComparePasswordDirective,
        UploadComponent,
        NgbdProfileImageDeletingModalComponent,
        NgbdProfileSettingsModalComponent,
        ProfileSettingsSecurityPageComponent,
        ProfileSettingsProfilePageComponent,
        ImagesComponent
    ],
    providers: [
        TokenService,
        CurrentUserService,
        ProfilesDataService,
        ImageCacheService,
        UploadExitGuard
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    
}
