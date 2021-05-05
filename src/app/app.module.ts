import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component"
import { AppRoutingModule } from "./app-routing.module"
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { NgbdProfileSettingsModalComponent } from './modals/settings/ngbdProfileSettingsModal.component';
import { ProfileSettingsSecurityPageComponent } from './modals/settings/securityPage/profileSettingsSecurityPage.component';
import { ProfileSettingsProfilePageComponent } from './modals/settings/profilePage/profileSettingsProfilePage.component';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpLoaderFactory } from "./shared/httpLoaderFactory"
import { MissingTranslationService } from "./services/missingTranslation.service"
import { SharedModule } from "./shared/shared.module"

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
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
        SharedModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        NotFoundComponent,
        HomeComponent,
        NgbdProfileSettingsModalComponent,
        ProfileSettingsSecurityPageComponent,
        ProfileSettingsProfilePageComponent,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    
}
