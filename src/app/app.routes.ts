import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ProfilesComponent } from "./profiles/profiles.component";

export const appRoutes: Routes = [
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "registration", component: RegistrationComponent },
    { path: "not-found", component: NotFoundComponent },
    { path: "profiles/:id", component: ProfilesComponent },
    { path: "p/:username", component: ProfilesComponent },
    { path: "**", component: NotFoundComponent }
]