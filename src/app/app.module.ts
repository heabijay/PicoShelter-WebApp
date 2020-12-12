import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component"
import { appRoutes } from "./app.routes"
import { HomeComponent } from "./home/home.component";

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {

}
