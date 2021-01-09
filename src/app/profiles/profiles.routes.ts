import { Routes } from "@angular/router";
import { AlbumsComponent } from "./albums/albums.component";
import { ImagesComponent } from "./images/images.component";
import { OverviewComponent } from "./overview/overview.component";

export const profileRoutes: Routes = [
    { path: "", component: OverviewComponent },
    { path: "images", component: ImagesComponent },
    { path: "albums", component: AlbumsComponent }
]