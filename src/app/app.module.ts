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
import { HttpService } from "./services/httpService";
import { HttpClientModule } from "@angular/common/http";
import { IdentityService } from "./services/identityService";

@NgModule({
    imports: [
        HttpClientModule,
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        NotFoundComponent,
        RegistrationComponent,
        LoginComponent
    ],
    providers: [
        HttpService,
        IdentityService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {

}
