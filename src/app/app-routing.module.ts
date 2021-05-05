import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    { path: "",  component: HomeComponent },
    { path: "login", loadChildren: () => import('./login/login.module').then(t => t.LoginModule) },
    { path: "registration", loadChildren: () => import('./registration/registration.module').then(t => t.RegistrationModule) },
    { path: "not-found", component: NotFoundComponent },
    { path: "upload", loadChildren: () => import('./upload/upload.module').then(t => t.UploadModule) },
    { path: "profiles/:id", loadChildren: () => import('./profiles/profiles.module').then(t => t.ProfilesModule) },
    { path: "p/:username", loadChildren: () => import('./profiles/profiles.module').then(t => t.ProfilesModule) },
    { path: "i/:code", loadChildren: () => import('./images/images.module').then(t => t.ImagesModule) },
    { path: "a/:code", loadChildren: () => import('./albums/albums.module').then(t => t.AlbumsModule) },
    { path: "s/:usercode", loadChildren: () => import('./albums/albums.module').then(t => t.AlbumsModule) },
    { path: "a/:code/:imgCode", loadChildren: () => import('./albums/images/images.module').then(t => t.ImagesModule) },
    { path: "s/:usercode/:imgCode", loadChildren: () => import('./albums/images/images.module').then(t => t.ImagesModule) },
    { path: "confirm", loadChildren: () => import('./confirm/confirm.module').then(t => t.ConfirmModule) },
    { path: "apps", loadChildren: () => import('./apps/apps.module').then(t => t.AppsModule) },
    { path: "apanel", loadChildren: () => import('./apanel/apanel.module').then(t => t.APanelModule) },
    { path: "about", loadChildren: () => import('./about/about.module').then(t => t.AboutModule) },
    { path: "**", component: NotFoundComponent }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules,
        relativeLinkResolution: 'legacy'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {}