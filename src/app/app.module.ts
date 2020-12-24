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

@NgModule({
    imports: [
        HttpClientModule,
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            progressBar: true
        })
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        NotFoundComponent,
        RegistrationComponent,
        LoginComponent,
        ComparePasswordDirective
    ],
    providers: [
        TokenService,
        CurrentUserService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
    
}
