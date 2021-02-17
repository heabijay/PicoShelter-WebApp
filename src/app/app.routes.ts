import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { RegistrationComponent } from "./registration/registration.component";
import { LoginComponent } from "./login/login.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ProfilesComponent } from "./profiles/profiles.component";
import { profileRoutes } from "./profiles/profiles.routes";
import { UploadComponent } from "./upload/upload.component";
import { UploadExitGuard } from "./guards/upload.exit.guard";
import { ImagesComponent } from "./images/images.component";
import { ConfirmComponent } from "./confirm/confirm.component";

export const appRoutes: Routes = [
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "registration", component: RegistrationComponent },
    { path: "not-found", component: NotFoundComponent },
    { path: "upload", component: UploadComponent, canDeactivate: [UploadExitGuard] },
    { path: "profiles/:id", component: ProfilesComponent, children: profileRoutes },
    { path: "p/:username", component: ProfilesComponent, children: profileRoutes },
    { path: "i/:code", component: ImagesComponent },
    { path: "confirm", component: ConfirmComponent },
    { path: "**", component: NotFoundComponent }
]