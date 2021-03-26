import { LOCALE_ID, NgModule } from "@angular/core";
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
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { TokenService } from "./services/token.service";
import { CurrentUserService } from "./services/currentUser.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { ComparePasswordDirective } from "./directives/compare-password.directive"
import { ProfilesComponent } from "./profiles/profiles.component";
import { ImagesComponent as ProfileImagesComponent } from "./profiles/images/images.component";
import { AlbumsComponent as ProfileAlbumsComponent } from "./profiles/albums/albums.component";
import { OverviewComponent } from "./profiles/overview/overview.component";
import { ProfilesDataService } from "./profiles/profiles.data.service";
import { UploadComponent } from "./upload/upload.component";
import { ImageCacheService } from "./services/imageCache.service";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from './modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { NgbdProfileSettingsModalComponent } from './modals/settings/ngbdProfileSettingsModal.component';
import { ProfileSettingsSecurityPageComponent } from './modals/settings/securityPage/profileSettingsSecurityPage.component';
import { ProfileSettingsProfilePageComponent } from './modals/settings/profilePage/profileSettingsProfilePage.component';
import { UploadExitGuard } from "./guards/upload.exit.guard";
import { ImagesComponent } from "./images/images.component";
import { PinchZoomModule } from "ngx-pinch-zoom"
import { FileSizePipe } from "./pipes/fileSizePipe"
import { FormatTimePipe } from "./pipes/formatTimePipe"
import { NgbdImageEditModalComponent } from './modals/imageEdit/ngbdImageEditModal.component';
import { NgbdAlbumCreateModalComponent } from './modals/albumCreate/ngbdAlbumCreateModal.component';
import { ConfirmComponent } from "./confirm/confirm.component"
import { AlbumsComponent } from "./albums/albums.component"
import { NgbdAlbumAddImageModalComponent } from './modals/albumAddImage/ngbdAlbumAddImageModal.component';
import { NgbdConfirmModalComponent } from './modals/confirm/ngbdConfirmModal.component';
import { ImagesComponent as AlbumImagesComponent } from "./albums/images/images.component";
import { NgbdAlbumImageLinksModalComponent } from "./modals/albumImageLinks/ngbdAlbumImageLinksModal.component"
import { NgbdAlbumMembersModalComponent } from "./modals/albumMembers/ngbdAlbumMembersModal.component"
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpLoaderFactory } from "./httpLoaderFactory"
import { MissingTranslationService } from "./services/missingTranslation.service"

@NgModule({
    imports: [
        HttpClientModule,
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [
                    HttpClient
                ]
            },
            missingTranslationHandler: {
                provide: MissingTranslationHandler,
                useClass: MissingTranslationService
            },
            useDefaultLang: false
        }),
        ToastrModule.forRoot({
            progressBar: true
        }),
        NgbModule,
        PinchZoomModule
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
        ProfileAlbumsComponent,
        ProfileImagesComponent,
        ComparePasswordDirective,
        UploadComponent,
        NgbdProfileImageDeletingModalComponent,
        NgbdProfileSettingsModalComponent,
        ProfileSettingsSecurityPageComponent,
        ProfileSettingsProfilePageComponent,
        ImagesComponent,
        FileSizePipe,
        FormatTimePipe,
        NgbdImageEditModalComponent,
        NgbdAlbumCreateModalComponent,
        ConfirmComponent,
        AlbumsComponent,
        NgbdAlbumAddImageModalComponent,
        NgbdConfirmModalComponent,
        AlbumImagesComponent,
        NgbdAlbumImageLinksModalComponent,
        NgbdAlbumMembersModalComponent
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
